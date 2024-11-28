

import { PrismaLeadsRepository } from '@/repositories/prisma/prisma-leads-repository';
import { ExportLeadsToCSVUseCase } from '@/use-cases/leads/export-leads-to-csv';
import { NextFunction, Request, Response } from 'express';

export async function exportLeadsToCSV(request: Request, response: Response, next: NextFunction) {
    try {

        const { batch } = request.query as { batch: string };

        const exportLeadsToCSVUseCase = new ExportLeadsToCSVUseCase(new PrismaLeadsRepository());
        const { CSV } = await exportLeadsToCSVUseCase.execute({ batch });

        response.header('Content-Type', 'text/csv');
        response.attachment(`${batch}.csv`);

        return response.send(CSV);

    } catch (e) {
        console.log(e)
        next(e);
    }
}
