// Собрано obsidian-kit из src/quickadd/docx-style-begin.ts — не править, правки вносить в исходник.
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

// src/quickadd/docx-style-begin.ts
var docx_style_begin_exports = {};
__export(docx_style_begin_exports, {
  default: () => docx_style_begin_default
});
module.exports = __toCommonJS(docx_style_begin_exports);
var import_node_fs = __toESM(require("node:fs"), 1);
var import_node_os = __toESM(require("node:os"), 1);
var import_node_path = __toESM(require("node:path"), 1);

// src/pandoc/styles.ts
var STYLES = [
  {
    id: "official",
    label: "📄 Официальный — A4, Times New Roman 12, разделы с новой страницы, оглавление",
    name: "официальный",
    suffix: ""
  },
  {
    id: "mobile",
    label: "📱 Для телефона — узкая страница, Arial, без разрывов и оглавления",
    name: "для телефона",
    suffix: " (телефон)",
    // Оглавление-поле на телефоне не обновить (нет F9); навигация по заголовкам
    // в мобильном Word есть и без него. Значение из defaults перекрывает toc во frontmatter.
    metadata: { toc: false }
  }
];

// src/quickadd/lib/common.ts
var KIT_DIR = "_.Settings/obsidian-kit";
var makeStop = (params) => (message) => {
  new params.obsidian.Notice(message, 15e3);
  return params.abort(message);
};

// src/quickadd/lib/docxStyleStash.ts
var getPandocPlugin = (params) => params.app.plugins.plugins["obsidian-pandoc"];

// src/quickadd/docx-style-begin.ts
var STYLE_ARG_RE = /^--defaults=.*[\\/]dist[\\/]pandoc[\\/][^\\/]+\.yaml$/u;
var docx_style_begin_default = async (params) => {
  const { app, quickAddApi } = params;
  const stop = makeStop(params);
  const pandoc = getPandocPlugin(params);
  if (!pandoc) return stop("Export: плагин Pandoc не включён");
  const file = app.workspace.getActiveFile();
  if (!file) return stop("Export: нет активной заметки");
  const stale = window.__quickaddDocxStyle;
  if (stale) {
    Object.assign(pandoc.settings, stale.orig);
    delete window.__quickaddDocxStyle;
  }
  const style = await quickAddApi.suggester(
    STYLES.map((s) => s.label),
    STYLES
  );
  if (!style) return stop("Export: стиль не выбран");
  const base = app.vault.adapter.getBasePath();
  const yaml = import_node_path.default.join(base, KIT_DIR, "dist", "pandoc", `${style.id}.yaml`);
  if (!import_node_fs.default.existsSync(yaml)) return stop(`Export: нет файла стиля ${yaml} — пересоберите кит (pixi run build)`);
  if (/\s/u.test(yaml)) return stop(`Export: в пути к стилю есть пробел — плагин Pandoc его не передаст: ${yaml}`);
  const cleanArgs = (pandoc.settings.extraArguments || "").split("\n").filter((l) => !STYLE_ARG_RE.test(l.trim())).join("\n");
  const orig = { extraArguments: cleanArgs, outputFolder: pandoc.settings.outputFolder };
  const tmpDir = import_node_fs.default.mkdtempSync(import_node_path.default.join(import_node_os.default.tmpdir(), "obsidian-docx-"));
  window.__quickaddDocxStyle = {
    orig,
    style,
    tmpDir,
    startedAt: Date.now(),
    outName: `${file.basename}.docx`,
    targetDir: orig.outputFolder || import_node_path.default.dirname(import_node_path.default.join(base, file.path))
  };
  pandoc.settings.extraArguments = `${cleanArgs}
--defaults=${yaml}`;
  pandoc.settings.outputFolder = tmpDir;
};
module.exports = module.exports.default;
