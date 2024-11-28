import { ApifyProvider } from "@/providers/apify";
import { PrismaTasksRepository } from "@/repositories/prisma/prisma-tasks-repository";

const FIVE_MINUTES_IN_MS = 60 * 1000 * 5;

type Props = {
    profile: string
    batch: string
}

export class StartInstagramPostsRetrievalJobByProfileUseCase {

    constructor(
        private tasksRepository: PrismaTasksRepository,
        private apify: ApifyProvider
    ) { }

    async execute({ profile, batch }: Props) {

        const { id } = await this.apify.runInstagramProfilePostScraper(profile);

        await this.tasksRepository.create({
            data: { id, batch },
            key: 'HANDLE_POSTS_BY_PROFILE_ON_APIFY',
            runAt: new Date(Date.now() + FIVE_MINUTES_IN_MS),
        })

    }

}