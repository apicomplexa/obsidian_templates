// Собрано obsidian-kit из src/quickadd/docx-style-finish.ts — не править, правки вносить в исходник.
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

// src/quickadd/docx-style-finish.ts
var docx_style_finish_exports = {};
__export(docx_style_finish_exports, {
  default: () => docx_style_finish_default
});
module.exports = __toCommonJS(docx_style_finish_exports);
var import_node_fs = __toESM(require("node:fs"), 1);
var import_node_path = __toESM(require("node:path"), 1);

// src/quickadd/lib/docxStyleStash.ts
var getPandocPlugin = (params) => params.app.plugins.plugins["obsidian-pandoc"];

// src/quickadd/docx-style-finish.ts
var TIMEOUT_MS = 18e4;
var POLL_MS = 400;
var waitForFile = async (file, startedAt) => {
  let lastSize = -1;
  const deadline = Date.now() + TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const st = import_node_fs.default.statSync(file);
      if (st.mtimeMs >= startedAt - 2e3 && st.size > 0 && st.size === lastSize) return true;
      lastSize = st.size;
    } catch {
    }
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
  return false;
};
var docx_style_finish_default = async (params) => {
  const { obsidian } = params;
  const s = window.__quickaddDocxStyle;
  if (!s) return;
  const pandoc = getPandocPlugin(params);
  try {
    const out = import_node_path.default.join(s.tmpDir, s.outName);
    if (await waitForFile(out, s.startedAt)) {
      const target = import_node_path.default.join(s.targetDir, s.outName.replace(/\.docx$/u, `${s.style.suffix}.docx`));
      import_node_fs.default.copyFileSync(out, target);
      new obsidian.Notice(`DOCX (${s.style.name}) сохранён:
${target}`, 1e4);
    } else {
      new obsidian.Notice(
        `Export: pandoc не создал файл за ${TIMEOUT_MS / 1e3} с — смотрите уведомления плагина Pandoc`,
        15e3
      );
    }
  } finally {
    if (pandoc) Object.assign(pandoc.settings, s.orig);
    delete window.__quickaddDocxStyle;
    try {
      import_node_fs.default.rmSync(s.tmpDir, { recursive: true, force: true });
    } catch (e) {
      console.error("docx-style-finish: не удалось удалить", s.tmpDir, e);
    }
  }
};
module.exports = module.exports.default;
