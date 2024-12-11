"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/jobs/handle-tasks.ts
var handle_tasks_exports = {};
__export(handle_tasks_exports, {
  HandleTasksUseCase: () => HandleTasksUseCase
});
module.exports = __toCommonJS(handle_tasks_exports);

// src/config/env.ts
var import_dotenv = __toESM(require("dotenv"), 1);
var import_path = __toESM(require("path"), 1);
var import_zod = require("zod");
import_dotenv.default.config({ path: import_path.default.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`) });
var envSchema = import_zod.z.object({
  FIREBASE_API_KEY: import_zod.z.string().min(1),
  FIREBASE_AUTH_DOMAIN: import_zod.z.string().min(1),
  FIREBASE_DATABASE_URL: import_zod.z.string().min(1),
  FIREBASE_PROJECT_ID: import_zod.z.string().min(1),
  FIREBASE_STORAGE_BUCKET: import_zod.z.string().min(1),
  FIREBASE_MESSAGING_SENDER_ID: import_zod.z.string().min(1),
  FIREBASE_APP_ID: import_zod.z.string().min(1),
  FIREBASE_MEASUREMENT_ID: import_zod.z.string().min(1),
  REDRIVE_OWNER_ID: import_zod.z.string().min(1),
  REDRIVE_TOKEN: import_zod.z.string().min(1),
  GROQ_API_KEY: import_zod.z.string().optional(),
  APIFY_BASE_URL: import_zod.z.string().min(1),
  APIFY_TOKEN: import_zod.z.string().min(1),
  DATABASE_URL: import_zod.z.string().min(1),
  PORT: import_zod.z.coerce.number().default(4e3)
});
var _env = envSchema.safeParse(process.env);
if (!_env.success) {
  console.error("\u274C Invalid environment variables", _env.error.format());
  throw new Error("Invalid environment varibles.");
}
var env = _env.data;

// src/lib/get-months-ago.ts
var getMonthsAgo = (months) => {
  let today = /* @__PURE__ */ new Date();
  today.setMonth(today.getMonth() - months);
  return today.toISOString().slice(0, 10);
};

// src/providers/apify.ts
var import_axios = __toESM(require("axios"), 1);
var ApifyProvider = class {
  constructor({ token }) {
    this.token = token;
  }
  async runInstagramProfilePostScraper(profile) {
    const { data } = await import_axios.default.post(env.APIFY_BASE_URL + `/acts/apify~instagram-post-scraper/runs`, {
      "username": [profile],
      "resultsLimit": 500,
      "skipPinnedPosts": true,
      "onlyPostsNewerThan": getMonthsAgo(6)
    }, {
      headers: {
        "Authorization": `Bearer ${process.env.APIFY_TOKEN}`
      }
    });
    const id = data?.data?.defaultDatasetId;
    return { id };
  }
  async getDatasetById(id) {
    const { data } = await import_axios.default.get(`https://api.apify.com/v2/datasets/${id}/items`);
    return data;
  }
};

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

// src/use-cases/instagram/create-instagram-scraping-task.ts
var CreateInstagramScrapingTaskUseCase = class {
  constructor(repository) {
    this.repository = repository;
  }
  async execute({ arg, tags, type, batch }) {
    if (type == "LIKES_ON_POST") {
      const hasPostOnDatabase = await this.repository.getByArg(arg);
      if (hasPostOnDatabase)
        throw new Error("duplicated instagram scraping task");
      const data = await this.repository.create({
        arg,
        type: "LIKES",
        batch,
        tags: []
      });
      return data;
    }
  }
};

// src/jobs/handle-tasks.ts
var HandleTasksUseCase = class {
  constructor(repository) {
    this.repository = repository;
  }
  async execute() {
    const tasks = await this.repository.getWaitingTasks();
    console.log(`${tasks.length} tasks to run!`);
    for (let task of tasks) {
      try {
        console.log(`Running task to => ${task.key}`);
        await this.repository.update(task.id, { status: "RUNNING" });
        if (!KEYS[task.key])
          throw new Error("Invalid Key");
        await KEYS[task.key]({ ...task.data, task: task.id });
        await this.repository.update(task.id, { status: "FINISHED" });
      } catch (e) {
        console.log(`\u274C Error running ${task.key}`);
        console.log(e);
        await this.repository.update(task.id, { status: "ERROR" });
      }
    }
  }
};
var KEYS = {
  "HANDLE_POSTS_BY_PROFILE_ON_APIFY": async (d) => {
    const data = d;
    const apify = new ApifyProvider({
      token: process.env.APIFY_TOKEN
    });
    const dataset = await apify.getDatasetById(data.id);
    const posts = dataset.map((d2) => d2.shortCode);
    const createInstagramScrapingTaskUseCase = new CreateInstagramScrapingTaskUseCase(
      new PrismaInstagramQueueTasksRepository()
    );
    await Promise.all(posts.map(async (post) => {
      try {
        await createInstagramScrapingTaskUseCase.execute({
          arg: post,
          type: "LIKES_ON_POST",
          batch: data.batch,
          tags: [post, data.batch]
        });
      } catch (e) {
      }
    }));
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HandleTasksUseCase
});
