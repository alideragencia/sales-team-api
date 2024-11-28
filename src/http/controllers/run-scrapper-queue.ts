


import { RedriveProvider } from '@/providers/redrive';
import { PrismaInstagramQueueTasksRepository } from '@/repositories/prisma/prisma-instagram-queue-tasks-repository';
import { PrismaLeadsRepository } from '@/repositories/prisma/prisma-leads-repository';
import { HandleInstagramScrapingTasksUseCase } from '@/use-cases/instagram/handle-instagram-scraping-tasks';
import { CreateLeadUseCase } from '@/use-cases/leads/create-lead';

import { NextFunction, Request, Response } from 'express';

export async function runScrapperQueue(request: Request, response: Response, next: NextFunction) {
    try {

        console.log('Received a request to run queue ------');

        const leadsRepository = new PrismaLeadsRepository();
        const tasksRepository = new PrismaInstagramQueueTasksRepository();
        const redriveProvider = new RedriveProvider();

        const data = await new HandleInstagramScrapingTasksUseCase(
            redriveProvider,
            tasksRepository,
            new CreateLeadUseCase(leadsRepository),
        ).execute()

        return response.status(200).json(data);

    } catch (e) {
        next(e);
    }
}