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

// src/config/env.ts
var env_exports = {};
__export(env_exports, {
  env: () => env
});
module.exports = __toCommonJS(env_exports);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_path = __toESM(require("path"), 1);
var import_zod = require("zod");
import_dotenv.default.config({ path: import_path.default.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`) });
var envSchema = import_zod.z.object({
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
  PORT: import_zod.z.coerce.number().default(8080)
});
var _env = envSchema.safeParse(process.env);
if (!_env.success) {
  console.error("\u274C Invalid environment variables", _env.error.format());
  throw new Error("Invalid environment varibles.");
}
var env = _env.data;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  env
});
