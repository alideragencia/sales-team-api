import { IInstagramQueueTasksRepository } from "@/repositories/instagram-queue-tasks-repository"
import { prisma } from "@/services/database"

type Props = {
    arg: string
    tags: string[]
    type: 'LIKES_ON_POST'
    batch: string
    isAssignedToSalesTeam?: boolean
}

export class CreateInstagramScrapingTaskUseCase {

    constructor(
        private repository: IInstagramQueueTasksRepository
    ) { }

    async execute({ arg, tags, type, batch, isAssignedToSalesTeam }: Props) {

        if (type == 'LIKES_ON_POST') {

            const hasPostOnDatabase = await this.repository.getByArg(arg);
            if (hasPostOnDatabase) throw new Error('duplicated instagram scraping task');

            const data = await this.repository.create({
                arg: arg,
                type: 'LIKES',
                batch: batch,
                tags: [],
                isAssignedToSalesTeam: isAssignedToSalesTeam == undefined || true
            })

            return data;
        }

    }

}