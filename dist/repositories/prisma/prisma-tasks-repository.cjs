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

// src/repositories/prisma/prisma-tasks-repository.ts
var prisma_tasks_repository_exports = {};
__export(prisma_tasks_repository_exports, {
  PrismaTasksRepository: () => PrismaTasksRepository
});
module.exports = __toCommonJS(prisma_tasks_repository_exports);

// src/services/database/index.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient();

// src/repositories/prisma/prisma-tasks-repository.ts
var PrismaTasksRepository = class {
  async getWaitingTasks() {
    return await prisma.task.findMany({
      where: {
        status: "WAITING",
        runAt: { lte: /* @__PURE__ */ new Date() }
      }
    });
  }
  async update(id, data) {
    await prisma.task.update({
      where: { id },
      data
    });
  }
  async create(data) {
    await prisma.task.create({ data });
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PrismaTasksRepository
});
