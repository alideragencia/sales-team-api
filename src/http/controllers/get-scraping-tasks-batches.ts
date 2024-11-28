


import { PrismaInstagramQueueTasksRepository } from '@/repositories/prisma/prisma-instagram-queue-tasks-repository'
import { GetInstagramScrapingTasksBatchesUseCase } from '@/use-cases/instagram/get-instagram-scraping-tasks-batches';

import { NextFunction, Request, Response } from 'express';

export async function getScrapingTasksBatches(request: Request, response: Response, next: NextFunction) {
    try {

        const repository = new PrismaInstagramQueueTasksRepository();
        const batches = await new GetInstagramScrapingTasksBatchesUseCase(repository).execute({ isAssignedToSalesTeam: !!(request?.query?.isAssignedToSalesTeam) });

        return response.status(200).json(batches);

    } catch (e) {
        next(e);
    }
}
