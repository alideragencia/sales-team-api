import { ILeadsRepository } from "@/repositories/leads-repository";

type CreateLeadUseCaseProps = {
    batch: string
    arg: string
    lead: {
        email?: string
        firstname: string
        lastname?: string
        instagram: string
        mobilephone?: string
        phone?: string
        tags: string[]
    }
}

export class CreateLeadUseCase {

    constructor(
        private repository: ILeadsRepository,
    ) { }

    async execute({ batch, arg, lead }: CreateLeadUseCaseProps): Promise<void> {

        if (!lead.email && !lead.phone && !lead.mobilephone) return;

        const hasLeadOnDatabase = await this.repository.getByContactData({ email: lead.email, phone: lead.phone, mobilephone: lead.mobilephone });
        if (hasLeadOnDatabase) return;

        console.log(`Creating lead ${lead.email}`);

        await this.repository.create({
            batch: batch,
            arg: arg,
            email: lead.email || null,
            firstname: lead.firstname,
            lastname: lead.lastname || null,
            instagram: lead.instagram,
            mobilephone: lead.mobilephone || null,
            phone: lead.phone || null,
            tags: lead.tags,
            isLeadQualified: null
        })

    }
}