import { ApifyProvider } from "@/providers/apify";
import { ITasksRepository } from "@/repositories/tasks-repository";

import { PrismaInstagramQueueTasksRepository } from "@/repositories/prisma/prisma-instagram-queue-tasks-repository";
import { CreateInstagramScrapingTaskUseCase } from "@/use-cases/instagram/create-instagram-scraping-task";

export class HandleTasksUseCase {

    constructor(
        private repository: ITasksRepository,
    ) { }

    async execute() {

        const tasks = await this.repository.getWaitingTasks();

        console.log(`${tasks.length} tasks to run!`)

        for (let task of tasks) {
            try {

                console.log(`Running task to => ${task.key}`)

                await this.repository.update(task.id, { status: 'RUNNING' });

                if (!KEYS[task.key]) throw new Error('Invalid Key');
                await KEYS[task.key]({ ...(task.data as object), task: task.id });

                await this.repository.update(task.id, { status: 'FINISHED' });

            } catch (e) {
                console.log(`❌ Error running ${task.key}`)
                console.log(e)
                await this.repository.update(task.id, { status: 'ERROR' });
            }
        }

    }
}


const KEYS = {
    'HANDLE_POSTS_BY_PROFILE_ON_APIFY': async (d: any) => {

        const data = d as { task: string, id: string, batch: string };

        const apify = new ApifyProvider({
            token: process.env.APIFY_TOKEN as string
        });
        const dataset = await apify.getDatasetById(data.id as string);

        const posts = dataset.map((d: { shortCode: string }) => d.shortCode);

        const createInstagramScrapingTaskUseCase = new CreateInstagramScrapingTaskUseCase(
            new PrismaInstagramQueueTasksRepository(),
        );

        await Promise.all(posts.map(async (post: string) => {
            try {

                await createInstagramScrapingTaskUseCase.execute({
                    arg: post,
                    type: 'LIKES_ON_POST',
                    batch: data.batch,
                    tags: [post, data.batch]
                })
            } catch (e) {

            }
        }))

    }
}