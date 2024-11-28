

import { PrismaLeadsRepository } from '@/repositories/prisma/prisma-leads-repository';
import { UpdateLeadByIdUseCase } from '@/use-cases/leads/update-lead-by-id';
import { NextFunction, Request, Response } from 'express';

export async function updateLeadById(request: Request, response: Response, next: NextFunction) {
    try {
        const { id } = request.params as { id: string }

        const updateLeadByIdUseCase = new UpdateLeadByIdUseCase(new PrismaLeadsRepository());
        await updateLeadByIdUseCase.execute(id, request.body);

        return response.sendStatus(200);

    } catch (e) {
        next(e);
    }
}
