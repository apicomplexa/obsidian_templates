// Собрано obsidian-kit из src/quickadd/format-with-regexp.ts — не править, правки вносить в исходник.
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

// src/quickadd/format-with-regexp.ts
var format_with_regexp_exports = {};
__export(format_with_regexp_exports, {
  default: () => format_with_regexp_default
});
module.exports = __toCommonJS(format_with_regexp_exports);

// src/quickadd/lib/techCopy.ts
var MARKER_RE = /(?:%%|<!--\s*)TECH_COPY_PATH--(.*?)(?:%%|\s*-->)/u;
var techCopyPathFor = (file) => `TECH_COPY_${file.name}`;
var markerFor = (techCopyPath) => `

<!-- TECH_COPY_PATH--${techCopyPath} -->
`;
var findMarker = (content) => content.match(MARKER_RE)?.[1]?.trim();

// src/quickadd/format-with-regexp.ts
var REPLACEMENTS = [
  [/\[!\$\][+-]?/gu, "➡️"],
  [/\[!def\][+-]?/gu, "➡️"],
  [/\[!note\][+-]?/gu, "🖋️"],
  [/\[!abstract\][+-]?/gu, "🗒️"],
  [/\[!info\][+-]?/gu, "❕"],
  [/\[!todo\][+-]?/gu, "✅"],
  [/\[!tip\][+-]?/gu, "🔥"],
  [/\[!success\][+-]?/gu, "✔️"],
  [/\[!warning\][+-]?/gu, "⚠️"],
  [/\[!failure\][+-]?/gu, "❌"],
  [/\[!danger\][+-]?/gu, "⚡"],
  [/\[!bug\][+-]?/gu, "🪲"],
  [/\[!example\][+-]?/gu, "🟰"],
  [/- \[ \]/gu, "\n\n◯"],
  [/- \[x\]/gu, "\n\n●"],
  [/- \[\/\]/gu, "\n\n◑"],
  [/- \[-\]/gu, "\n\n⊝"],
  [/- \[>\]/gu, "\n\n➤"],
  [/- \[<\]/gu, "\n\n📅"],
  [/- \[\?\]/gu, "\n\n❓"],
  [/- \[!\]/gu, "\n\n⚠️"],
  [/- \[\*\]/gu, "\n\n⭐"],
  [/- \["\]/gu, "\n\n💬"],
  [/- \[l\]/gu, "\n\n📍"],
  [/- \[b\]/gu, "\n\n🔖"],
  [/- \[i\]/gu, "\n\nℹ️"],
  [/- \[S\]/gu, "\n\n💾"],
  [/- \[I\]/gu, "\n\n💡"],
  [/- \[p\]/gu, "\n\n👍"],
  [/- \[c\]/gu, "\n\n👎"],
  [/- \[f\]/gu, "\n\n🔥"],
  [/- \[k\]/gu, "\n\n🗝️"],
  [/- \[w\]/gu, "\n\n🏆"],
  [/- \[u\]/gu, "\n\n⬆️"],
  [/- \[d\]/gu, "\n\n⬇️"],
  [/<span class="\w*">(\w*)<\/span>/gu, "==$1=="]
];
var formatNote = (markdown) => REPLACEMENTS.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), markdown);
var format_with_regexp_default = async (params) => {
  const { app } = params;
  const file = app.workspace.getActiveFile();
  if (!file) return;
  const original = await app.vault.read(file);
  const markerPath = findMarker(original);
  if (markerPath !== void 0 && app.vault.getAbstractFileByPath(markerPath)) {
    await app.vault.modify(file, formatNote(original));
    return;
  }
  const techCopyPath = techCopyPathFor(file);
  const oldTechCopy = app.vault.getAbstractFileByPath(techCopyPath);
  if (oldTechCopy) await app.vault.delete(oldTechCopy);
  const techCopy = await app.vault.create(techCopyPath, original, { ctime: file.stat.ctime });
  await app.vault.modify(file, formatNote(original) + markerFor(techCopy.path));
};
module.exports = module.exports.default;
