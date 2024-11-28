import { IInstagramQueueTasksRepository } from "@/repositories/instagram-queue-tasks-repository";


type Props = {
    isAssignedToSalesTeam?: boolean
}

export class GetInstagramScrapingTasksBatchesUseCase {

    constructor(
        private repository: IInstagramQueueTasksRepository
    ) { }

    async execute({ isAssignedToSalesTeam }: Props) {
        const batches = await this.repository.getBatches({ isAssignedToSalesTeam });
        return batches || [];
    }

}

