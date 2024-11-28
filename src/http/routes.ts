import { Router } from "express";

export const routes = Router();

import { Request, Response } from 'express';

import { getScrapingTasks } from "./controllers/get-scraping-tasks";
import { createScrapingTasks } from "./controllers/create-scraping-tasks";
import { getScrapingTasksBatches } from "./controllers/get-scraping-tasks-batches";
import { runScrapperQueue } from "./controllers/run-scrapper-queue";
import { exportLeadsToCSV } from "./controllers/export-leads-to-csv";
import { getLeadsByBatch } from "./controllers";
import { updateLeadById } from "./controllers/update-lead-by-id";
import { RedriveProvider } from "@/providers/redrive";
import { PrismaInstagramQueueTasksRepository } from "@/repositories/prisma/prisma-instagram-queue-tasks-repository";

routes.get('/', async (request: Request, response: Response) => {

  return response.status(200).json({ now: new Date().toISOString() });
})

routes.get('/tasks/:id', async (request: Request, response: Response) => {
  return response.status(200).json(await new RedriveProvider().getTaskByArg(request.params.id));
})

// routes.get('/leads/:id', async (request: Request, response: Response) => {
//   return response.status(200).json(await new RedriveProvider().getLeadsByArg(request.params.id));
// })

// Get Instagram Scraping Tasks
routes.get('/scraping-tasks', getScrapingTasks)

// Create Instagram Scraping Task
routes.post('/scraping-tasks', createScrapingTasks)

// Get Instagram Scraping Tasks Batches
routes.get('/scraping-tasks-batches', getScrapingTasksBatches)
routes.get('/scraping-tasks-batches/:batch/leads', getLeadsByBatch)

// Export leads CSV
routes.get('/leads/csv', exportLeadsToCSV)
routes.put('/leads/:id', updateLeadById)

// Run Instagram Scraping Tasks
routes.post('/run-instagram-scraping-tasks', runScrapperQueue);
