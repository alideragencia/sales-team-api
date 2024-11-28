import { ILeadsRepository } from "@/repositories/leads-repository";

type Props = {
    batch: string
}

export class GetLeadsByBatchUseCase {

    constructor(
        private repository: ILeadsRepository
    ) { }

    async execute({ batch }: Props) {
        const leads = await this.repository.getByBatch(batch);
        return leads || [];
    }

}

