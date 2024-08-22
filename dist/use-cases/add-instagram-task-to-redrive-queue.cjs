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

// src/use-cases/add-instagram-task-to-redrive-queue.ts
var add_instagram_task_to_redrive_queue_exports = {};
__export(add_instagram_task_to_redrive_queue_exports, {
  AddInstagramTaskToRedriveQueue: () => AddInstagramTaskToRedriveQueue
});
module.exports = __toCommonJS(add_instagram_task_to_redrive_queue_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AddInstagramTaskToRedriveQueue
});
