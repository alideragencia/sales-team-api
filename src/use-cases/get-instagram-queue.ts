import { firestore } from "@/services/redrive";
import { InstagramQueueTask } from "@/types/instagram-queue";
import { collection, getDocs, query, where } from "firebase/firestore";


export class GetInstagramQueueUseCase {

    constructor() { }

    async execute(): Promise<InstagramQueueTask[]> {

        console.log('Fetching Instagram Queue!')

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