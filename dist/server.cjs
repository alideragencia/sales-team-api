"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// src/app.ts
var import_dotenv = __toESM(require("dotenv"), 1);
var import_path = __toESM(require("path"), 1);
var import_express2 = __toESM(require("express"), 1);

// src/http/routes.ts
var import_express = require("express");

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
var import_axios = __toESM(require("axios"), 1);
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
    this.instance = import_axios.default.create({
      baseURL: "https://instagram.redrive.com.br",
      headers: this.headers
    });
  }
  async initialize() {
    if (this.token)
      return;
    const auth = await prisma.redriveAuth.findFirst();
    console.log(`Has Auth`);
    console.log(auth);
    if (!auth) {
      const { token } = await this.login();
      this.token = token;
      await prisma.redriveAuth.create({ data: { token } });
    }
    if (auth)
      this.token = auth.token;
    this.instance = import_axios.default.create({
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
          this.instance = import_axios.default.create({
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
    console.log("LOGIN ----");
    const { data } = await import_axios.default.post(`https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyA7inINbcgTHYrKPb1mEpZ3LIb3dMAzI_k`, {
      "email": "diogo.alan@v4company.com",
      "password": "LWA644*yzY9auQH",
      "returnSecureToken": true
    });
    console.log(`New token =>`);
    console.log(data.idToken);
    return { token: data.idToken };
  }
  async getTaskByArg(arg) {
    return await this.tryMultipleTimes(async () => {
      console.log("Fetching Instagram Task By Arg!");
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
  async addPostToQueue({ arg, tags, post }) {
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
      const { data } = await import_axios.default.post(`https://misc.redrive.com.br/export-csv`, {
        userId: process.env.REDRIVE_OWNER_ID,
        fileType: "csv",
        doc
      });
      if (!data?.ack)
        throw new Error();
    }, { attempts: 2 });
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
};

// src/use-cases/add-instagram-task-to-redrive-queue.ts
var AddInstagramTaskToRedriveQueue = class {
  constructor(redrive, tasks) {
    this.redrive = redrive;
    this.tasks = tasks;
  }
  async execute({ arg, tags, type, batch }) {
    const post = await this.redrive.getPostDataById(arg);
    if (!post)
      throw new Error(`cannot find ${arg} in redrive`);
    console.log(`Post Caption =>`);
    console.log("ID" + post.id + "\n");
    console.log("Text" + post.caption.text + "\n");
    console.log("Picture" + post.caption.user.profile_pic_url + "\n");
    tags = [...tags, arg, batch];
    const data = await this.redrive.addPostToQueue({
      arg,
      tags,
      post: { "id": post.id, "biography": post.caption.text, "profile_pic_url": post.caption.user.profile_pic_url }
    });
    console.log("Succesfully add post on redrive =>");
    console.log(data);
    if (!data?.ack) {
      await this.tasks.updateByArg(arg, { status: "FAILED" });
      throw new Error(`error adding task in redrive queue => ${JSON.stringify(data)}`);
    }
    await this.tasks.updateByArg(arg, { status: "PENDING" });
  }
};

// src/use-cases/handle-instagram-queue.ts
var HandleInstagramQueueUseCase = class {
  constructor(redrive, tasks) {
    this.redrive = redrive;
    this.tasks = tasks;
  }
  async execute() {
    const LOGS = {
      "ESPERANDO": 0,
      "EXECUTANDO": 0,
      "NOVAMENTE": 0,
      "FINALIZADAS": 0,
      "ADICIONADAS": 0
    };
    const tasks = await this.tasks.getByStatus(["RUNNING", "PENDING"]);
    console.log(`Tasks Pending or Running => ${tasks.length}`);
    for (let task of tasks) {
      const t = await this.redrive.getTaskByArg(task.arg);
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
      if (t.status == "pending") {
        LOGS["ESPERANDO"]++;
        continue;
      }
      if (t.status == "scraping")
        LOGS["EXECUTANDO"]++;
      if (t.status == "scraping" && task.status == "RUNNING")
        continue;
      if (t.status == "scraping" && task.status != "RUNNING") {
        await this.tasks.update(task.id, { status: "RUNNING" });
        continue;
      }
      ;
      if (t.status == "stopped_by_system") {
        await this.tasks.update(task.id, { status: "FAILED" });
        continue;
      }
      if (t.status == "complete") {
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
    const MAX_ITENS_ON_REDRIVE_QUEUE = 2;
    const remaining = await this.tasks.getByStatus(["RUNNING", "PENDING"]);
    if (remaining.length >= MAX_ITENS_ON_REDRIVE_QUEUE)
      return LOGS;
    const tasksToAdd = await this.tasks.getByStatus("WAITING");
    const addInstagramTaskToRedriveQueueUseCase = new AddInstagramTaskToRedriveQueue(this.redrive, this.tasks);
    for (let task of tasksToAdd.slice(0, MAX_ITENS_ON_REDRIVE_QUEUE - remaining.length)) {
      await addInstagramTaskToRedriveQueueUseCase.execute({ ...task });
      LOGS["ADICIONADAS"]++;
    }
    return LOGS;
  }
};

// src/http/controllers/scrapper-queues.ts
async function scrapperQueues(request, response) {
  console.log("Received a request to run queue ------");
  const data = await new HandleInstagramQueueUseCase(
    new RedriveProvider(),
    new PrismaInstagramQueueTasksRepository()
  ).execute();
  console.log(data);
  return response.status(200).json(data);
}

// src/http/routes.ts
var routes = (0, import_express.Router)();
routes.get("/", (request, response) => {
  return response.status(200).json({ message: "Welcome to Redrive Instagram Scrapper API!" });
});
routes.post("/scrapper-post", scrapperPosts);
routes.post("/scrapper-queues", scrapperQueues);

// src/app.ts
var import_cors = __toESM(require("cors"), 1);
import_dotenv.default.config({ path: import_path.default.resolve(process.cwd(), ".env") });
var app2 = (0, import_express2.default)();
app2.use(import_express2.default.json());
app2.use(import_express2.default.urlencoded({ extended: true }));
app2.use((0, import_cors.default)({ origin: "*" }));
app2.use(routes);

// src/config/env.ts
var import_dotenv2 = __toESM(require("dotenv"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_zod2 = require("zod");
import_dotenv2.default.config({ path: import_path2.default.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`) });
var envSchema = import_zod2.z.object({
  // FIREBASE_API_KEY: z.string().min(1),
  // FIREBASE_AUTH_DOMAIN: z.string().min(1),
  // FIREBASE_DATABASE_URL: z.string().min(1),
  // FIREBASE_PROJECT_ID: z.string().min(1),
  // FIREBASE_STORAGE_BUCKET: z.string().min(1),
  // FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  // FIREBASE_APP_ID: z.string().min(1),
  // FIREBASE_MEASUREMENT_ID: z.string().min(1),
  // REDRIVE_OWNER_ID: z.string().min(1),
  // REDRIVE_TOKEN: z.string().min(1),
  PORT: import_zod2.z.coerce.number().default(8080)
});
var _env = envSchema.safeParse(process.env);
if (!_env.success) {
  console.error("\u274C Invalid environment variables", _env.error.format());
  throw new Error("Invalid environment varibles.");
}
var env2 = _env.data;

// src/cron.ts
var import_node_cron = __toESM(require("node-cron"), 1);
setTimeout(() => {
  console.log("\u2705 Cron is running!");
  import_node_cron.default.schedule("0 0 * * *", async () => {
  });
}, 5e3);

// src/server.ts
app2.listen(env2.PORT, () => console.log(`\u2705 Server running at http://localhost:${env2.PORT}`));
