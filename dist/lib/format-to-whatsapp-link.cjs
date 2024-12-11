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

// src/lib/format-to-whatsapp-link.ts
var format_to_whatsapp_link_exports = {};
__export(format_to_whatsapp_link_exports, {
  formatToWhatsappLink: () => formatToWhatsappLink
});
module.exports = __toCommonJS(format_to_whatsapp_link_exports);
function formatToWhatsappLink(phone) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  formatToWhatsappLink
});
