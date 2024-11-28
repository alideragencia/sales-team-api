import { IInstagramQueueTasksRepository } from "@/repositories/instagram-queue-tasks-repository";

type Props = {
    batch?: string
}

export class GetInstagramScrapingTasksUseCase {

    constructor(
        private repository: IInstagramQueueTasksRepository
    ) { }

    async execute({ batch }: Props = {}) {

        if (!batch) {
            const batches = await this.repository.getBatches();
            batch = batches[0] as string;
        }

        const tasks = await this.repository.getByBatch(batch);
        return tasks || [];
    }

}