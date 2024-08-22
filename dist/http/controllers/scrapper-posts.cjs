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

// src/http/controllers/scrapper-posts.ts
var scrapper_posts_exports = {};
__export(scrapper_posts_exports, {
  scrapperPosts: () => scrapperPosts
});
module.exports = __toCommonJS(scrapper_posts_exports);

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

// src/use-cases/add-instagram-task-to-queue.ts
var AddInstagramTaskToQueue = class {
  constructor() {
  }
  async execute({ arg, tags, type, batch }) {
    const task = await prisma.instagramQueueTask.create({ data: { arg, tags, type, batch } });
    return task;
  }
};

// src/http/controllers/scrapper-posts.ts
var import_zod = require("zod");
async function scrapperPosts(request, response) {
  console.log("Received a list to add on queue ------");
  const schema = import_zod.z.object({
    posts: import_zod.z.array(import_zod.z.string()),
    batch: import_zod.z.string().min(1)
  });
  const { posts, batch } = schema.parse(request.body);
  const db = [];
  for (let post of posts) {
    const hasPostOnDatabase = await new PrismaInstagramQueueTasksRepository().getByArg(post);
    if (hasPostOnDatabase)
      continue;
    const data = await new AddInstagramTaskToQueue().execute({
      arg: post,
      type: "LIKES",
      batch,
      tags: []
    });
    db.push(data);
  }
  return response.status(200).json(db);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  scrapperPosts
});
