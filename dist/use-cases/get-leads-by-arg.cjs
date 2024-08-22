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

// src/use-cases/get-leads-by-arg.ts
var get_leads_by_arg_exports = {};
__export(get_leads_by_arg_exports, {
  GetLeadsByArgUseCase: () => GetLeadsByArgUseCase
});
module.exports = __toCommonJS(get_leads_by_arg_exports);

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

// src/use-cases/get-leads-by-arg.ts
var import_firestore2 = require("firebase/firestore");
var GetLeadsByArgUseCase = class {
  constructor() {
  }
  async execute({ arg }) {
    console.log("Fetching Instagram Leads By Arg!");
    const ref = (0, import_firestore2.collection)(firestore, "crm-leads");
    if (!ref)
      throw new Error("cannot find instagram-queue collection on firestore");
    const q = (0, import_firestore2.query)(
      ref,
      (0, import_firestore2.where)("tags", "array-contains", arg),
      (0, import_firestore2.where)("leadOwner", "==", process.env.REDRIVE_OWNER_ID)
    );
    const snapshot = await (0, import_firestore2.getDocs)(q);
    const data = snapshot.docs.map((doc) => doc.data());
    return data;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GetLeadsByArgUseCase
});
