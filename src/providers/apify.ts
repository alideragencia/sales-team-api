
import { env } from "@/config/env";
import { getMonthsAgo } from "@/lib/get-months-ago";
import axios from "axios";

type Props = {
    token: string
}

export class ApifyProvider {

    token: string

    constructor({ token }: Props) {
        this.token = token;
    }

    async runInstagramProfilePostScraper(profile: string) {

        const { data } = await axios.post(env.APIFY_BASE_URL + `/acts/apify~instagram-post-scraper/runs`, {
            "username": [profile],
            "resultsLimit": 500,
            "skipPinnedPosts": true,
            "onlyPostsNewerThan": getMonthsAgo(6)
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.APIFY_TOKEN}`
            }
        })

        const id = data?.data?.defaultDatasetId;
        return { id };
    }

    async getDatasetById(id: string) {
        const { data } = await axios.get(`https://api.apify.com/v2/datasets/${id}/items`);
        return data;
    }

}
