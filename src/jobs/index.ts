import cron from 'node-cron';

import { RedriveProvider } from '@/providers/redrive';
import { PrismaInstagramQueueTasksRepository } from '@/repositories/prisma/prisma-instagram-queue-tasks-repository';
import { PrismaLeadsRepository } from '@/repositories/prisma/prisma-leads-repository';
import { HandleInstagramScrapingTasksUseCase } from '@/use-cases/instagram/handle-instagram-scraping-tasks';
import { CreateLeadUseCase } from '@/use-cases/leads/create-lead';
import { HandleTasksUseCase } from './handle-tasks';
import { PrismaTasksRepository } from '@/repositories/prisma/prisma-tasks-repository';

setTimeout(async () => {

    console.log('✅ Cron is running!');

    console.log(`⚡ Running...`);

    // cron.schedule('*/10 * * * *', async () => {

    //     const tasks = (await new PrismaInstagramQueueTasksRepository().getFailedTasksToVerify()).slice(0, 4);

    //     const redrive = new RedriveProvider();

    //     for (let task of tasks) {

    //         const t = await redrive.getLeadsByArg(task.arg);

    //         console.log(t)

    //     }


    // });

    cron.schedule('*/10 * * * *', async () => {

        console.log(`⚡ Running...`);

        const leadsRepository = new PrismaLeadsRepository();
        const tasksRepository = new PrismaInstagramQueueTasksRepository();
        const redriveProvider = new RedriveProvider();

        const data = await new HandleInstagramScrapingTasksUseCase(
            redriveProvider,
            tasksRepository,
            new CreateLeadUseCase(leadsRepository),
        ).execute()

        console.log(data);

    });

    await new HandleTasksUseCase(
        new PrismaTasksRepository()
    ).execute()
    cron.schedule('*/1 * * * *', async () => {

        console.log(`⚡ Tasks...`);

        await new HandleTasksUseCase(
            new PrismaTasksRepository()
        ).execute()
    });

}, 5000);
