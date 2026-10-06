// Собрано obsidian-kit из src/quickadd/make-tech-copy.ts — не править, правки вносить в исходник.
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

// src/quickadd/make-tech-copy.ts
var make_tech_copy_exports = {};
__export(make_tech_copy_exports, {
  default: () => make_tech_copy_default
});
module.exports = __toCommonJS(make_tech_copy_exports);

// src/quickadd/lib/common.ts
var makeStop = (params) => (message) => {
  new params.obsidian.Notice(message, 15e3);
  return params.abort(message);
};

// src/quickadd/lib/techCopy.ts
var MARKER_RE = /(?:%%|<!--\s*)TECH_COPY_PATH--(.*?)(?:%%|\s*-->)/u;
var techCopyPathFor = (file) => `TECH_COPY_${file.name}`;
var markerFor = (techCopyPath) => `

<!-- TECH_COPY_PATH--${techCopyPath} -->
`;
var findMarker = (content) => content.match(MARKER_RE)?.[1]?.trim();

// src/quickadd/make-tech-copy.ts
var make_tech_copy_default = async (params) => {
  const { app, obsidian } = params;
  const stop = makeStop(params);
  const file = app.workspace.getActiveFile();
  if (!file) return stop("Export: нет активной заметки");
  let content = await app.vault.read(file);
  const techCopyPath = techCopyPathFor(file);
  const markerPath = findMarker(content);
  if (markerPath !== void 0) {
    const copy = app.vault.getAbstractFileByPath(markerPath);
    if (!(copy instanceof obsidian.TFile)) {
      return stop(
        `Export прерван: в заметке маркер технической копии, а самой копии «${markerPath}» нет. Восстановите заметку вручную (история git).`
      );
    }
    content = await app.vault.read(copy);
    await app.vault.modify(file, content);
    await app.vault.delete(copy);
    await new Promise((resolve) => {
      const done = () => {
        clearTimeout(timer);
        app.metadataCache.offref(ref);
        resolve();
      };
      const ref = app.metadataCache.on("changed", (f) => {
        if (f.path === file.path) done();
      });
      const timer = setTimeout(done, 3e3);
    });
    new obsidian.Notice("Export: заметка восстановлена из технической копии прошлого, оборванного экспорта", 8e3);
  }
  if (app.vault.getAbstractFileByPath(techCopyPath)) {
    return stop(
      `Export прерван: в корне хранилища уже лежит «${techCopyPath}» от прерванного экспорта. Сверьте её с заметкой и удалите вручную.`
    );
  }
  await app.vault.create(techCopyPath, content);
  await app.vault.modify(file, content + markerFor(techCopyPath));
};
module.exports = module.exports.default;
