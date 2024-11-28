


import { PrismaInstagramQueueTasksRepository } from '@/repositories/prisma/prisma-instagram-queue-tasks-repository'
import { GetInstagramScrapingTasksUseCase } from '@/use-cases/instagram/get-instagram-scraping-tasks';
import { NextFunction, Request, Response } from 'express';

export async function getScrapingTasks(request: Request, response: Response, next: NextFunction) {
    try {

        const getScrapperTasksUseCase = new GetInstagramScrapingTasksUseCase(new PrismaInstagramQueueTasksRepository())

        const batch = request?.query.batch as string
        const tasks = await getScrapperTasksUseCase.execute({ batch });

        return response.status(200).json({
            data: tasks,
            count: tasks.length
        });

    } catch (e) {
        next(e);
    }
}
