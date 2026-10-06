// Собрано obsidian-kit из src/quickadd/restore-tech-copy.ts — не править, правки вносить в исходник.
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

// src/quickadd/restore-tech-copy.ts
var restore_tech_copy_exports = {};
__export(restore_tech_copy_exports, {
  default: () => restore_tech_copy_default
});
module.exports = __toCommonJS(restore_tech_copy_exports);

// src/quickadd/lib/common.ts
var makeStop = (params) => (message) => {
  new params.obsidian.Notice(message, 15e3);
  return params.abort(message);
};

// src/quickadd/lib/techCopy.ts
var MARKER_RE = /(?:%%|<!--\s*)TECH_COPY_PATH--(.*?)(?:%%|\s*-->)/u;
var findMarker = (content) => content.match(MARKER_RE)?.[1]?.trim();

// src/quickadd/restore-tech-copy.ts
var restore_tech_copy_default = async (params) => {
  const { app, obsidian } = params;
  const stop = makeStop(params);
  const modFile = app.workspace.getActiveFile();
  if (!modFile) return stop("Restore: нет активной заметки");
  const markerPath = findMarker(await app.vault.read(modFile));
  if (markerPath === void 0) {
    return stop("Утеряна техническая копия заметки. Пожалуйста, посмотрите в корневой папке хранилища");
  }
  const techCopy = app.vault.getAbstractFileByPath(markerPath);
  if (!(techCopy instanceof obsidian.TFile)) {
    return stop(`Ошибка при получении доступа к технической копии «${markerPath}»`);
  }
  await app.vault.modify(modFile, await app.vault.read(techCopy));
  await app.vault.delete(techCopy);
};
module.exports = module.exports.default;
