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

// src/http/controllers/update-lead-by-id.ts
var update_lead_by_id_exports = {};
__export(update_lead_by_id_exports, {
  updateLeadById: () => updateLeadById
});
module.exports = __toCommonJS(update_lead_by_id_exports);

// src/services/database/index.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient();

// src/repositories/prisma/prisma-leads-repository.ts
var PrismaLeadsRepository = class {
  async getByBatch(batch) {
    const leads = await prisma.lead.findMany({
      where: { batch }
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
    console.log({ id, data });
    await prisma.lead.update({
      where: { id },
      data
    });
  }
};

// src/use-cases/leads/update-lead-by-id.ts
var UpdateLeadByIdUseCase = class {
  constructor(repository) {
    this.repository = repository;
  }
  async execute(id, data) {
    await this.repository.update(id, data);
  }
};

// src/http/controllers/update-lead-by-id.ts
async function updateLeadById(request, response, next) {
  try {
    const { id } = request.params;
    const updateLeadByIdUseCase = new UpdateLeadByIdUseCase(new PrismaLeadsRepository());
    await updateLeadByIdUseCase.execute(id, request.body);
    return response.sendStatus(200);
  } catch (e) {
    next(e);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  updateLeadById
});
