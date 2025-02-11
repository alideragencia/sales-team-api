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

// src/http/controllers/index.ts
var controllers_exports = {};
__export(controllers_exports, {
  createScrapingTasks: () => createScrapingTasks,
  getLeadsByBatch: () => getLeadsByBatch,
  getScrapingTasks: () => getScrapingTasks,
  getScrapingTasksBatches: () => getScrapingTasksBatches,
  runScrapperQueue: () => runScrapperQueue
});
module.exports = __toCommonJS(controllers_exports);

// src/config/env.ts
var import_dotenv = __toESM(require("dotenv"), 1);
var import_path = __toESM(require("path"), 1);
var import_zod = require("zod");
import_dotenv.default.config({ path: import_path.default.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`) });
console.log(process.env);
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
  PORT: import_zod.z.coerce.number().default(8080)
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
    const where2 = isAssignedToSalesTeam ? { isAssignedToSalesTeam: true } : {};
    const batches = await prisma.instagramScrappingTask.findMany({
      distinct: ["batch"],
      orderBy: { createdAt: "desc" },
      select: {
        batch: true
      },
      where: where2
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

// src/use-cases/instagram/create-instagram-scraping-task.ts
var CreateInstagramScrapingTaskUseCase = class {
  constructor(repository) {
    this.repository = repository;
  }
  async execute({ arg, tags, type, batch, isAssignedToSalesTeam }) {
    if (type == "LIKES_ON_POST") {
      const hasPostOnDatabase = await this.repository.getByArg(arg);
      if (hasPostOnDatabase)
        throw new Error("duplicated instagram scraping task");
      const data = await this.repository.create({
        arg,
        type: "LIKES",
        batch,
        tags: [],
        isAssignedToSalesTeam: isAssignedToSalesTeam == void 0 || true
      });
      return data;
    }
  }
};

// src/use-cases/instagram/start-instagram-posts-retrieval-job-by-profile.ts
var FIVE_MINUTES_IN_MS = 60 * 1e3 * 5;
var StartInstagramPostsRetrievalJobByProfileUseCase = class {
  constructor(tasksRepository, apify) {
    this.tasksRepository = tasksRepository;
    this.apify = apify;
  }
  async execute({ profile, batch }) {
    const { id } = await this.apify.runInstagramProfilePostScraper(profile);
    await this.tasksRepository.create({
      data: { id, batch },
      key: "HANDLE_POSTS_BY_PROFILE_ON_APIFY",
      runAt: new Date(Date.now() + FIVE_MINUTES_IN_MS)
    });
  }
};

// src/http/controllers/create-scraping-tasks.ts
var import_zod2 = require("zod");
async function createScrapingTasks(request, response, next) {
  try {
    const schema = import_zod2.z.object({
      posts: import_zod2.z.array(import_zod2.z.string()).optional(),
      profile: import_zod2.z.string().optional(),
      batch: import_zod2.z.string().min(1)
    }).refine(
      (data) => !!data.posts || !!data.profile,
      "Either posts or profile should be filled in."
    );
    const { posts, profile, batch } = schema.parse(request.body);
    if (profile) {
      const s = new StartInstagramPostsRetrievalJobByProfileUseCase(
        new PrismaTasksRepository(),
        new ApifyProvider({ token: env.APIFY_TOKEN })
      );
      await s.execute({ profile, batch });
    }
    if (posts?.length) {
      const createInstagramScrapingTaskUseCase = new CreateInstagramScrapingTaskUseCase(new PrismaInstagramQueueTasksRepository());
      for (let post of posts) {
        await createInstagramScrapingTaskUseCase.execute({
          arg: post,
          type: "LIKES_ON_POST",
          batch,
          tags: []
        });
      }
    }
    return response.sendStatus(201);
  } catch (e) {
    next(e);
  }
}

// src/providers/redrive.ts
var import_firestore2 = require("firebase/firestore");

// src/services/redrive/index.ts
var import_app = require("firebase/app");
var import_firestore = require("firebase/firestore");
var import_process = require("process");
var config = {
  apiKey: import_process.env.FIREBASE_API_KEY,
  authDomain: import_process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: import_process.env.FIREBASE_DATABASE_URL,
  projectId: import_process.env.FIREBASE_PROJECT_ID,
  storageBucket: import_process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import_process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: import_process.env.FIREBASE_APP_ID,
  measurementId: import_process.env.FIREBASE_MEASUREMENT_ID
};
var app = (0, import_app.initializeApp)(config);
var firestore = (0, import_firestore.getFirestore)(app);

// src/providers/redrive.ts
var import_axios2 = __toESM(require("axios"), 1);
var RedriveProvider = class {
  constructor() {
    this.token = null;
    this.headers = {
      "Accept": "application/json, text/plain, */*",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7,es;q=0.6",
      "Cache-Control": "no-cache",
      "Origin": "https://app.redrive.com.br",
      "Pragma": "no-cache",
      "Priority": "u=1, i",
      "Referer": "https://app.redrive.com.br/",
      "Sec-CH-UA": '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
      "Sec-CH-UA-Mobile": "?0",
      "Sec-CH-UA-Platform": '"Linux"',
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-site",
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
    };
    this.instance = import_axios2.default.create({
      baseURL: "https://instagram.redrive.com.br",
      headers: this.headers
    });
  }
  async initialize() {
    if (this.token)
      return;
    const auth = await prisma.redriveAuth.findFirst();
    if (!auth) {
      const { token } = await this.login();
      this.token = token;
      await prisma.redriveAuth.create({ data: { token } });
    }
    if (auth)
      this.token = auth.token;
    this.instance = import_axios2.default.create({
      baseURL: "https://instagram.redrive.com.br",
      headers: { ...this.headers, Authorization: this.token }
    });
  }
  async tryMultipleTimes(cb, options = { attempts: 1 }) {
    for (let attempt = 1; attempt <= options.attempts; attempt++) {
      try {
        return await cb();
      } catch (error) {
        if (attempt == options.attempts && error?.response?.data)
          throw error?.response?.data;
        if (attempt == options.attempts)
          throw error;
        if (error?.response?.status == 401) {
          const { token } = await this.login();
          this.token = token;
          this.instance = import_axios2.default.create({
            baseURL: "https://instagram.redrive.com.br",
            headers: { ...this.headers, Authorization: this.token }
          });
        }
      }
      ;
    }
    ;
    throw new Error("Function failed without error details.");
  }
  async login() {
    const { data } = await import_axios2.default.post(`https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyA7inINbcgTHYrKPb1mEpZ3LIb3dMAzI_k`, {
      "email": "diogo.alan@v4company.com",
      "password": "M*E!FY7HptWZK@Q",
      "returnSecureToken": true
    });
    return { token: data.idToken };
  }
  async getTaskByArg(arg) {
    return await this.tryMultipleTimes(async () => {
      const ref = (0, import_firestore2.collection)(firestore, "instagram-queue");
      if (!ref)
        throw new Error("cannot find instagram-queue collection on firestore");
      const q = (0, import_firestore2.query)(
        ref,
        (0, import_firestore2.where)("arg", "==", arg),
        (0, import_firestore2.where)("owner", "==", process.env.REDRIVE_OWNER_ID)
      );
      const snapshot = await (0, import_firestore2.getDocs)(q);
      const data = snapshot.docs.map((doc) => ({ ...doc.data(), doc: doc.id }));
      return data[0];
    }, { attempts: 2 });
  }
  async getPostDataById(post) {
    return await this.tryMultipleTimes(async () => {
      await this.initialize();
      const { data } = await this.instance.get(`/check-post-new/${post}`);
      return data?.result;
    }, { attempts: 2 });
  }
  async addPostToQueue({ arg, tags }) {
    const post = await this.getPostDataById(arg);
    if (!post)
      throw new Error(`cannot find ${arg} in redrive`);
    return await this.tryMultipleTimes(async () => {
      await this.initialize();
      const { data } = await this.instance.post("/insta-scrapper-post-likes", {
        "post": arg,
        "owner": process.env.REDRIVE_OWNER_ID,
        "tags": tags,
        "postData": {
          "id": post.id,
          "biography": post.biography,
          "profile_pic_url": post.profile_pic_url
        }
      });
      console.log(`\u2705 Post (${arg}) successfully add to redrive queue!`);
      return data;
    }, { attempts: 2 });
  }
  async runSearchAgain(doc) {
    return await this.tryMultipleTimes(async () => {
      const { data } = await this.instance.post(`/insta-restart`, {
        docId: doc
      });
      if (!data?.ack)
        throw new Error();
    }, { attempts: 2 });
  }
  async exportLeadsToCSV(doc) {
    return await this.tryMultipleTimes(async () => {
      const { data } = await import_axios2.default.post(`https://misc.redrive.com.br/export-csv`, {
        userId: process.env.REDRIVE_OWNER_ID,
        fileType: "csv",
        doc
      });
      if (!data?.ack)
        throw new Error();
    }, { attempts: 2 });
  }
  async getLeadsByInstagram(instagram) {
    const ref = (0, import_firestore2.collection)(firestore, "crm-leads");
    if (!ref)
      throw new Error("cannot find leads collection on firestore");
    const q = (0, import_firestore2.query)(
      ref,
      (0, import_firestore2.where)("instagram", "==", instagram)
    );
    const snapshot = await (0, import_firestore2.getDocs)(q);
    const data = snapshot.docs.map((doc) => ({ ...doc.data(), doc: doc.id }));
    return data;
  }
  async getLeadsByArg(arg) {
    const ref = (0, import_firestore2.collection)(firestore, "crm-leads");
    if (!ref)
      throw new Error("cannot find leads collection on firestore");
    const q = (0, import_firestore2.query)(
      ref,
      (0, import_firestore2.where)("leadOwner", "==", process.env.REDRIVE_OWNER_ID),
      (0, import_firestore2.where)("tags", "array-contains", arg)
    );
    const snapshot = await (0, import_firestore2.getDocs)(q);
    const data = snapshot.docs.map((doc) => ({ ...doc.data(), doc: doc.id }));
    return data;
  }
  async getPendingOrScrapingInstagramTasks() {
    const ref = (0, import_firestore2.collection)(firestore, "instagram-queue");
    if (!ref)
      throw new Error("cannot find instagram-queue collection on firestore");
    const q = (0, import_firestore2.query)(
      ref,
      (0, import_firestore2.where)("status", "in", ["scraping", "pending"]),
      (0, import_firestore2.where)("owner", "==", process.env.REDRIVE_OWNER_ID)
    );
    const snapshot = await (0, import_firestore2.getDocs)(q);
    const data = snapshot.docs.map((doc) => doc.data());
    return data;
  }
};

// src/repositories/prisma/prisma-leads-repository.ts
var PrismaLeadsRepository = class {
  async getByBatch(batch) {
    const leads = await prisma.lead.findMany({
      where: { batch },
      orderBy: { createdAt: "asc" }
    });
    return leads;
  }
  async create(data) {
    await prisma.lead.create({
      data
    });
  }
  async getByContactData({ email, phone, mobilephone }) {
    const where2 = {};
    if (email)
      where2.email = email;
    if (phone)
      where2.phone = phone;
    if (mobilephone)
      where2.mobilephone = mobilephone;
    return await prisma.lead.findFirst({ where: where2 });
  }
  async update(id, data) {
    await prisma.lead.update({
      where: { id },
      data
    });
  }
};

// src/use-cases/instagram/handle-instagram-scraping-tasks.ts
var HandleInstagramScrapingTasksUseCase = class {
  constructor(redrive, tasks, createLeadUseCase) {
    this.redrive = redrive;
    this.tasks = tasks;
    this.createLeadUseCase = createLeadUseCase;
  }
  async execute() {
    const LOGS = {
      "ESPERANDO": 0,
      "EXECUTANDO": 0,
      "NOVAMENTE": 0,
      "FINALIZADAS": 0,
      "ADICIONADAS": 0
    };
    const tasks = (await this.tasks.getByStatus(["RUNNING", "PENDING"])).slice(0, 10);
    for (let task of tasks) {
      const t = await this.redrive.getTaskByArg(task.arg);
      console.log(`\u{1F5D2} Checking task ${task.arg}`);
      console.log(t);
      await new Promise((r) => setTimeout(r, 250));
      const leads = await this.redrive.getLeadsByArg(task.arg);
      await Promise.all(leads.map(async (lead) => {
        await this.createLeadUseCase.execute({
          batch: task.batch,
          arg: task.arg,
          lead: {
            email: lead.email,
            firstname: lead.firstname,
            lastname: lead.lastname,
            instagram: lead.instagram,
            mobilephone: lead.mobilephone,
            phone: lead.phone,
            tags: lead.tags
          }
        });
      }));
      const finish = async () => {
        await this.tasks.update(task.id, {
          status: "FINISHED",
          leads: Number(t.totalLeads),
          finishedAt: /* @__PURE__ */ new Date(),
          //@ts-ignore
          logs: {
            create: {
              event: "FINISHED_SEARCH",
              leads: Number(t.totalLeads)
            }
          }
        });
        LOGS["FINALIZADAS"]++;
      };
      const repeat = async () => {
        await this.tasks.update(task.id, {
          leads: Number(t.totalLeads),
          //@ts-ignore
          logs: {
            create: {
              event: "SEARCH_HALTED",
              leads: Number(t.totalLeads)
            }
          }
        });
        if (t?.doc) {
          await this.redrive.runSearchAgain(t.doc);
          LOGS["NOVAMENTE"]++;
          return;
        }
      };
      const error = async () => {
        await this.tasks.update(task.id, { status: "FAILED" });
        const leads2 = await this.redrive.getLeadsByArg(task.arg);
        await Promise.all(leads2.map(async (lead) => {
          await this.createLeadUseCase.execute({
            batch: task.batch,
            arg: task.arg,
            lead: {
              email: lead.email,
              firstname: lead.firstname,
              lastname: lead.lastname,
              instagram: lead.instagram,
              mobilephone: lead.mobilephone,
              phone: lead.phone,
              tags: lead.tags
            }
          });
        }));
      };
      if (t.status == "pending" || t.status == "pending-new") {
        await this.tasks.updateByArg(task.arg, { status: "PENDING" });
        LOGS["ESPERANDO"]++;
        continue;
      }
      if (t.status == "scraping") {
        await this.tasks.update(task.id, { status: "RUNNING" });
        LOGS["EXECUTANDO"]++;
        continue;
      }
      if (t.status == "stopped_by_system" || t.status == "paused") {
        let logs = task.logs;
        logs = logs?.length ? logs.filter((l) => l.event == "STOPPED_BY_SYSTEM") : [];
        if (!logs.length) {
          await this.tasks.update(task.id, {
            //@ts-ignore
            logs: {
              create: {
                event: "STOPPED_BY_SYSTEM",
                leads: Number(t.totalLeads)
              }
            }
          });
          continue;
        }
        await error();
        continue;
      }
      if (t.status == "complete" || t.status == "stopped_by_user") {
        const hasGoodPercentageOfLeads = t.totalLeads / t.followersCount > 0.2;
        if (hasGoodPercentageOfLeads) {
          await finish();
          continue;
        }
        let logs = task.logs;
        logs = logs?.length ? logs.filter((l) => l.event == "SEARCH_HALTED") : [];
        if (logs.length <= 1) {
          await repeat();
          continue;
        }
        const penultimateTotalLeads = logs.at(-2)?.data?.leads || 0;
        const lastTotalLeads = (logs.at(-1)?.data?.leads || 0) - penultimateTotalLeads;
        const hasGoodLeadColletionRate = lastTotalLeads / penultimateTotalLeads > 0.35;
        if (hasGoodLeadColletionRate) {
          await repeat();
          continue;
        }
        await finish();
      }
    }
    const MAX_ITENS_ON_REDRIVE_QUEUE = 3;
    const remaining = await this.tasks.getByStatus(["RUNNING", "PENDING"]);
    if (remaining.length >= MAX_ITENS_ON_REDRIVE_QUEUE)
      return LOGS;
    const distributed = await (async () => {
      const tasks2 = await this.tasks.getByStatus("WAITING");
      const max = MAX_ITENS_ON_REDRIVE_QUEUE - remaining.length;
      return tasks2.slice(0, max);
    })();
    console.log(distributed);
    for (let task of distributed) {
      try {
        LOGS["ADICIONADAS"]++;
        const data = await this.redrive.addPostToQueue({ ...task, tags: [task.batch, task.arg] });
        console.log(`Adicionou`);
        console.log(data);
        if (!data?.ack) {
          console.log(await this.redrive.getLeadsByArg(task.arg));
          await this.tasks.updateByArg(task.arg, { status: "FAILED" });
          throw new Error(`error adding task in redrive queue => ${JSON.stringify(data)}`);
        }
      } catch (e) {
        console.log(`\u274C Error`);
        if (e?.response?.data) {
          console.log(e.response.data);
        } else if (e?.response) {
          console.log(e?.response);
        } else {
          console.log(e);
        }
      }
    }
    return LOGS;
  }
};

// src/use-cases/leads/create-lead.ts
var CreateLeadUseCase = class {
  constructor(repository) {
    this.repository = repository;
  }
  async execute({ batch, arg, lead }) {
    if (!lead.email && !lead.phone && !lead.mobilephone)
      return;
    const hasLeadOnDatabase = await this.repository.getByContactData({ email: lead.email, phone: lead.phone, mobilephone: lead.mobilephone });
    if (hasLeadOnDatabase)
      return;
    console.log(`Creating lead ${lead.email}`);
    await this.repository.create({
      batch,
      arg,
      email: lead.email || null,
      firstname: lead.firstname,
      lastname: lead.lastname || null,
      instagram: lead.instagram,
      mobilephone: lead.mobilephone || null,
      phone: lead.phone || null,
      tags: lead.tags,
      isLeadQualified: null
    });
  }
};

// src/http/controllers/run-scrapper-queue.ts
async function runScrapperQueue(request, response, next) {
  try {
    console.log("Received a request to run queue ------");
    const leadsRepository = new PrismaLeadsRepository();
    const tasksRepository = new PrismaInstagramQueueTasksRepository();
    const redriveProvider = new RedriveProvider();
    const data = await new HandleInstagramScrapingTasksUseCase(
      redriveProvider,
      tasksRepository,
      new CreateLeadUseCase(leadsRepository)
    ).execute();
    return response.status(200).json(data);
  } catch (e) {
    next(e);
  }
}

// src/use-cases/instagram/get-instagram-scraping-tasks.ts
var GetInstagramScrapingTasksUseCase = class {
  constructor(repository) {
    this.repository = repository;
  }
  async execute({ batch } = {}) {
    if (!batch) {
      const batches = await this.repository.getBatches();
      batch = batches[0];
    }
    const tasks = await this.repository.getByBatch(batch);
    return tasks || [];
  }
};

// src/http/controllers/get-scraping-tasks.ts
async function getScrapingTasks(request, response, next) {
  try {
    const getScrapperTasksUseCase = new GetInstagramScrapingTasksUseCase(new PrismaInstagramQueueTasksRepository());
    const batch = request?.query.batch;
    const tasks = await getScrapperTasksUseCase.execute({ batch });
    return response.status(200).json({
      data: tasks,
      count: tasks.length
    });
  } catch (e) {
    next(e);
  }
}

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

// src/use-cases/leads/get-leads-by-batch.ts
var GetLeadsByBatchUseCase = class {
  constructor(repository) {
    this.repository = repository;
  }
  async execute({ batch }) {
    const leads = await this.repository.getByBatch(batch);
    return leads || [];
  }
};

// src/http/controllers/get-leads-by-batch.ts
async function getLeadsByBatch(request, response, next) {
  try {
    const { batch } = request.params;
    const repository = new PrismaLeadsRepository();
    const leads = await new GetLeadsByBatchUseCase(repository).execute({ batch });
    const NEGATIVE_KEY_WORDS = [
      "freelancer",
      "aut\xF4nomo",
      "aut\xF4noma",
      "marketing",
      "digital",
      "ag\xEAncia",
      "tr\xE1fego",
      "performance",
      "propaganda",
      "nutricionista",
      "est\xE9tica",
      "beleza",
      "cabeleireiro",
      "cabeleireira",
      "sal\xE3o",
      "unhas",
      "maquiagem",
      "fot\xF3grafo",
      "fotografia",
      "v\xEDdeo maker",
      "v\xEDdeos",
      "psic\xF3logo",
      "psic\xF3loga",
      "sa\xFAde",
      "mental",
      "terapia",
      "dentista",
      "cl\xEDnica",
      "fisioterapia",
      "hinode",
      "mary kay",
      "semijoias",
      "joias",
      "bijuterias",
      "artesanato",
      "artes\xE3",
      "artes\xE3o",
      "blog",
      "blogger",
      "influencer",
      "influenciador",
      "mentoria",
      "mentor",
      "coach",
      "coaching",
      "artista",
      "pintura",
      "design gr\xE1fico",
      "designer",
      "beleza",
      "beauty",
      "est\xE9tica",
      "sobrancelhas",
      "cabeleireiro",
      "manicure",
      "espiritualidade",
      "terapia integrativa",
      "hol\xEDstica",
      "personal",
      "treinador",
      "academia",
      "influencer",
      "digital",
      "autoajuda",
      "espiritual",
      "autoconhecimento",
      "boutique",
      "mercearia",
      "consultora de imagem",
      "estilo",
      "blogueira",
      "youtuber",
      "criador de conte\xFAdo",
      "mkt",
      "design",
      "trafego",
      "psicologa",
      "fotografa",
      "assessoria",
      "sest senat",
      "sesi",
      "print",
      "designer",
      "social media",
      "marketing",
      "sesi",
      "sesc",
      "print",
      "designer",
      "marketing",
      "mecanic",
      "mec\xE2nic",
      "contabilidade",
      "grafic",
      "desing"
    ];
    return response.status(200).json({
      data: leads.filter((lead) => {
        if (!lead.phone && !lead.mobilephone)
          return false;
        const name = (lead.firstname + lead.lastname).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const hasNegativeKeyWord = NEGATIVE_KEY_WORDS.find((k) => name.includes(k));
        return !hasNegativeKeyWord;
      }),
      count: leads.length
    });
  } catch (e) {
    next(e);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createScrapingTasks,
  getLeadsByBatch,
  getScrapingTasks,
  getScrapingTasksBatches,
  runScrapperQueue
});
