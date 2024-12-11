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

// src/lib/format-to-phone.ts
var format_to_phone_exports = {};
__export(format_to_phone_exports, {
  formatToPhone: () => formatToPhone
});
module.exports = __toCommonJS(format_to_phone_exports);
var formatToPhone = (v) => {
  v = v.replace(/\D/g, "");
  if (v.length == 13 && v.slice(0, 2) == "55")
    v = v.slice(2);
  if (v.length <= 10) {
    v = v.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  } else if (v.length === 11) {
    v = v.replace(/^(\d{2})(\d{1})(\d{4})(\d{4})$/, "($1) $2 $3-$4");
  } else if (v.length === 13) {
    v = v.replace(/^(\d{2})(\d{2})(\d{1})(\d{4})(\d{4})$/, "$1 ($2) $3 $4-$5");
  } else {
    v = v.replace(/^(\d{2})(\d{1})(\d{4})(\d{4})(\d{0,4})$/, "($1) $2 $3-$4$5");
  }
  return v;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  formatToPhone
});
