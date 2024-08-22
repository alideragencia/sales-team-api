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

// src/repositories/prisma/prisma-instagram-queue-tasks-repository.ts
var prisma_instagram_queue_tasks_repository_exports = {};
__export(prisma_instagram_queue_tasks_repository_exports, {
  PrismaInstagramQueueTasksRepository: () => PrismaInstagramQueueTasksRepository
});
module.exports = __toCommonJS(prisma_instagram_queue_tasks_repository_exports);

// src/services/database/index.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient();

// src/repositories/prisma/prisma-instagram-queue-tasks-repository.ts
var PrismaInstagramQueueTasksRepository = class {
  async getByStatus(status) {
    if (typeof status == "string") {
      const tasks2 = await prisma.instagramQueueTask.findMany({ where: { status }, include: { logs: true } });
      return tasks2;
    }
    const tasks = await prisma.instagramQueueTask.findMany({
      where: { OR: status.map((status2) => ({ status: status2 })) },
      include: {
        logs: true
      }
    });
    return tasks;
  }
  async update(id, data) {
    await prisma.instagramQueueTask.update({ where: { id }, data });
  }
  async updateByArg(arg, data) {
    await prisma.instagramQueueTask.updateMany({ where: { arg }, data });
  }
  async getByArg(arg) {
    const task = await prisma.instagramQueueTask.findFirst({ where: { arg } });
    return task;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PrismaInstagramQueueTasksRepository
});
