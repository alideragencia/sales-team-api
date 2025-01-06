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

// src/repositories/prisma/prisma-leads-repository.ts
var prisma_leads_repository_exports = {};
__export(prisma_leads_repository_exports, {
  PrismaLeadsRepository: () => PrismaLeadsRepository
});
module.exports = __toCommonJS(prisma_leads_repository_exports);

// src/services/database/index.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient();

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
    const where = {};
    if (email)
      where.email = email;
    if (phone)
      where.phone = phone;
    if (mobilephone)
      where.mobilephone = mobilephone;
    return await prisma.lead.findFirst({ where });
  }
  async update(id, data) {
    await prisma.lead.update({
      where: { id },
      data
    });
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PrismaLeadsRepository
});
