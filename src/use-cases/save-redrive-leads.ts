import { RedriveProvider } from "@/providers/redrive-provider";
import { IInstagramQueueTasksRepository } from "@/repositories/instagram-queue-tasks-repository";
import { ILeadsRepository } from "@/repositories/leads-repository";
import { Lead } from "@prisma/client";


export class SaveRedriveLeadsUseCase {

    constructor(
        private repository: ILeadsRepository,
        private redrive: RedriveProvider,
    ) { }

    async execute({ batch, arg }: { batch: string, arg: string }): Promise<void> {

        const leads = await this.redrive.getLeadsByArg(arg);
        if (!leads.length) throw new Error('cannot found leads to save');

        leads.forEach(async (lead) => {

            if (!lead.email && !lead.phone && !lead.mobilephone) return;

            const hasLeadOnDatabase = await this.repository.getByContactData({ email: lead.email, phone: lead.phone, mobilephone: lead.mobilephone });
            if (hasLeadOnDatabase) return;

            await this.repository.create({
                batch: batch,
                email: lead.email || null,
                firstname: lead.firstname,
                lastname: lead.lastname || null,
                instagram: lead.instagram,
                mobilephone: lead.mobilephone || null,
                phone: lead.phone || null,
                tags: lead.tags
            })
        })

    }
}