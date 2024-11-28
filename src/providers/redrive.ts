import { collection, getCountFromServer, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { RedriveInstagramQueueTask } from "@/types/redrive-instagram-queue";
import { app, firestore } from "@/services/redrive";
import axios, { AxiosInstance } from "axios";
import { prisma } from "@/services/database";
import { RedriveLead } from "@/types/redrive-lead";
import { InstagramQueueTask } from "@prisma/client";

type AddPostToQueueProps = {
    arg: string
    tags: string[]
}

export class RedriveProvider {

    token: string | null
    instance: AxiosInstance
    headers: object

    constructor() {
        this.token = null;
        this.headers = {
            "Accept": "application/json, text/plain, */*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7,es;q=0.6",
            "Cache-Control": "no-cache",
            "Origin": "https://app.redrive.com.br",
            "Pragma": "no-cache",
            "Priority": "u=1, i",
            "Referer": "https://app.redrive.com.br/",
            "Sec-CH-UA": "\"Not)A;Brand\";v=\"99\", \"Google Chrome\";v=\"127\", \"Chromium\";v=\"127\"",
            "Sec-CH-UA-Mobile": "?0",
            "Sec-CH-UA-Platform": "\"Linux\"",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site",
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
        }
        this.instance = axios.create({
            baseURL: 'https://instagram.redrive.com.br',
            headers: this.headers
        })
    }

    async initialize() {

        if (this.token) return;

        const auth = await prisma.redriveAuth.findFirst();

        if (!auth) {
            const { token } = await this.login();
            this.token = token;
            await prisma.redriveAuth.create({ data: { token } });
        }

        if (auth) this.token = auth.token;

        this.instance = axios.create({
            baseURL: 'https://instagram.redrive.com.br',
            headers: { ...this.headers, Authorization: this.token }
        })
    }

    async tryMultipleTimes<T>(cb: () => Promise<T>, options: { attempts: number } = { attempts: 1 },): Promise<T> {

        for (let attempt = 1; attempt <= options.attempts; attempt++) {
            try {
                return await cb();
            } catch (error) {

                //@ts-ignore
                if (attempt == options.attempts && error?.response?.data) throw error?.response?.data;
                if (attempt == options.attempts) throw error;

                //@ts-ignore
                if (error?.response?.status == 401) {
                    const { token } = await this.login();
                    this.token = token;
                    this.instance = axios.create({
                        baseURL: 'https://instagram.redrive.com.br',
                        headers: { ...this.headers, Authorization: this.token }
                    })
                }

            };
        };
        throw new Error('Function failed without error details.');

    }

    async login() {

        const { data } = await axios.post(`https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyA7inINbcgTHYrKPb1mEpZ3LIb3dMAzI_k`, {
            "email": "diogo.alan@v4company.com",
            "password": "LWA644*yzY9auQH",
            "returnSecureToken": true
        })

        return { token: data.idToken }
    }

    async getTaskByArg(arg: string) {
        return await this.tryMultipleTimes(async () => {

            const ref = collection(firestore, 'instagram-queue');
            if (!ref) throw new Error('cannot find instagram-queue collection on firestore');

            const q = query(ref,
                where("arg", "==", arg),
                where("owner", "==", process.env.REDRIVE_OWNER_ID),
            )

            const snapshot = await getDocs(q);

            const data = snapshot.docs.map(doc => ({ ...doc.data(), doc: doc.id })) as RedriveInstagramQueueTask[];

            return data[0];

        }, { attempts: 2 })
    }

    async getPostDataById(post: string) {
        return await this.tryMultipleTimes(async () => {
            await this.initialize();
            const { data } = await this.instance.get(`/check-post-new/${post}`);
            return data?.result;
        }, { attempts: 2 })
    }

    async addPostToQueue({ arg, tags }: AddPostToQueueProps) {

        const post = await this.getPostDataById(arg);
        if (!post) throw new Error(`cannot find ${arg} in redrive`);

        return await this.tryMultipleTimes(async () => {
            await this.initialize();
            const { data } = await this.instance.post('/insta-scrapper-post-likes', {
                "post": arg,
                "owner": process.env.REDRIVE_OWNER_ID,
                "tags": tags,
                "postData": {
                    "id": post.id,
                    "biography": post.biography,
                    "profile_pic_url": post.profile_pic_url
                }
            })
            console.log(`✅ Post (${arg}) successfully add to redrive queue!`)
            return data;
        }, { attempts: 2 })
    }

    async runSearchAgain(doc: string) {
        return await this.tryMultipleTimes(async () => {
            const { data } = await this.instance.post(`/insta-restart`, {
                docId: doc
            })
            if (!data?.ack) throw new Error();
        }, { attempts: 2 })
    }

    async exportLeadsToCSV(doc: string) {
        return await this.tryMultipleTimes(async () => {
            const { data } = await axios.post(`https://misc.redrive.com.br/export-csv`, {
                userId: process.env.REDRIVE_OWNER_ID,
                fileType: 'csv',
                doc: doc
            })
            if (!data?.ack) throw new Error();
        }, { attempts: 2 })
    }

    async getLeadsByInstagram(instagram: string) {

        const ref = collection(firestore, 'crm-leads');
        if (!ref) throw new Error('cannot find leads collection on firestore');
        const q = query(ref,
            where("instagram", "==", instagram)
        )

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ ...doc.data(), doc: doc.id }))

        return data as RedriveLead[]

    }

    async getLeadsByArg(arg: string) {

        const ref = collection(firestore, 'crm-leads');
        if (!ref) throw new Error('cannot find leads collection on firestore');

        const q = query(ref,
            where("leadOwner", "==", process.env.REDRIVE_OWNER_ID),
            where("tags", "array-contains", arg),
        )

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map(doc => ({ ...doc.data(), doc: doc.id }))

        return data as RedriveLead[]

    }

    async getPendingOrScrapingInstagramTasks() {

        const ref = collection(firestore, 'instagram-queue');
        if (!ref) throw new Error('cannot find instagram-queue collection on firestore');

        const q = query(ref,
            where("status", "in", ["scraping", "pending"]),
            where("owner", "==", process.env.REDRIVE_OWNER_ID),
        )

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => doc.data()) as InstagramQueueTask[];

        return data;


    }


}
