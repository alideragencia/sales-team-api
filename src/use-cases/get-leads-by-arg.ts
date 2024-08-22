import { firestore } from "@/services/redrive";
import { RedriveLead } from "@/types/redrive-lead";
import { collection, getDocs, query, where } from "firebase/firestore";


type Props = {
    arg: string
}

export class GetLeadsByArgUseCase {

    constructor() { }

    async execute({ arg }: Props): Promise<RedriveLead[]> {

        console.log('Fetching Instagram Leads By Arg!')

        const ref = collection(firestore, 'crm-leads');
        if (!ref) throw new Error('cannot find instagram-queue collection on firestore');

        const q = query(ref,
            where("tags", "array-contains", arg),
            where("leadOwner", "==", process.env.REDRIVE_OWNER_ID),
        )

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => doc.data());

        return data as RedriveLead[];

    }

}

