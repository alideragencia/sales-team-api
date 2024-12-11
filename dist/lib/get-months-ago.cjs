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

// src/lib/get-months-ago.ts
var get_months_ago_exports = {};
__export(get_months_ago_exports, {
  getMonthsAgo: () => getMonthsAgo
});
module.exports = __toCommonJS(get_months_ago_exports);
var getMonthsAgo = (months) => {
  let today = /* @__PURE__ */ new Date();
  today.setMonth(today.getMonth() - months);
  return today.toISOString().slice(0, 10);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getMonthsAgo
});
