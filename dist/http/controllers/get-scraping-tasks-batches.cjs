"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/http/controllers/get-scraping-tasks-batches.ts
var get_scraping_tasks_batches_exports = {};
__export(get_scraping_tasks_batches_exports, {
  getScrapingTasksBatches: () => getScrapingTasksBatches
});
module.exports = __toCommonJS(get_scraping_tasks_batches_exports);

// src/services/database/index.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient();

// src/repositories/prisma/prisma-instagram-queue-tasks-repository.ts
var PrismaInstagramQueueTasksRepository = class {
  async create(data) {
    const tasks = await prisma.instagramScrappingTask.create({
      data: { ...data, isAssignedToSalesTeam: true }
    });
    return tasks;
  }
  async getByStatus(status) {
    const tasks = await prisma.instagramScrappingTask.findMany({
      where: typeof status == "string" ? { status } : { OR: status.map((status2) => ({ status: status2 })) },
      include: {
        logs: true
      }
    });
    return tasks;
  }
  async update(id, data) {
    await prisma.instagramScrappingTask.update({ where: { id }, data });
  }
  async updateByArg(arg, data) {
    await prisma.instagramScrappingTask.updateMany({ where: { arg }, data });
  }
  async getByArg(arg) {
    const task = await prisma.instagramScrappingTask.findFirst({ where: { arg } });
    return task;
  }
  async getByBatch(batch) {
    const tasks = await prisma.instagramScrappingTask.findMany({ where: { batch } });
    return tasks;
  }
  async getBatches({ isAssignedToSalesTeam } = { isAssignedToSalesTeam: false }) {
    const where = isAssignedToSalesTeam ? { isAssignedToSalesTeam: true } : {};
    const batches = await prisma.instagramScrappingTask.findMany({
      distinct: ["batch"],
      orderBy: { createdAt: "desc" },
      select: {
        batch: true
      },
      where
    });
    return batches.map((b) => b.batch);
  }
  async getFailedTasksToVerify() {
    const tasks = await prisma.instagramScrappingTask.findMany({
      where: {
        status: "FAILED",
        logs: {
          none: {
            event: "FAILURE_CHECK"
          }
        },
        isAssignedToSalesTeam: true
      }
    });
    return tasks;
  }
};

// src/use-cases/instagram/get-instagram-scraping-tasks-batches.ts
var GetInstagramScrapingTasksBatchesUseCase = class {
  constructor(repository) {
    this.repository = repository;
  }
  async execute({ isAssignedToSalesTeam }) {
    const batches = await this.repository.getBatches({ isAssignedToSalesTeam });
    return batches || [];
  }
};

// src/http/controllers/get-scraping-tasks-batches.ts
async function getScrapingTasksBatches(request, response, next) {
  try {
    const repository = new PrismaInstagramQueueTasksRepository();
    const batches = await new GetInstagramScrapingTasksBatchesUseCase(repository).execute({ isAssignedToSalesTeam: !!request?.query?.isAssignedToSalesTeam });
    return response.status(200).json(batches);
  } catch (e) {
    next(e);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getScrapingTasksBatches
});
