// Заменяет синтаксис Obsidian, который не переживает экспорт: callout'ы и расширенные чекбоксы — на эмодзи,
// <span class="…"> — на ==выделение==.
//
// В макросе «Export: DOC» техкопию уже снял make-tech-copy, и здесь только заменяется синтаксис.
// При самостоятельном запуске (макрос «🖨️Make tech copy») копию снимает сам.

import { findMarker, markerFor, techCopyPathFor } from "./lib/techCopy";

const REPLACEMENTS: [RegExp, string][] = [
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

  [/<span class="\w*">(\w*)<\/span>/gu, "==$1=="],
];

const formatNote = (markdown: string): string =>
  REPLACEMENTS.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), markdown);

export default async (params: QuickAddParams): Promise<void> => {
  const { app } = params;
  const file = app.workspace.getActiveFile();
  if (!file) return;

  const original = await app.vault.read(file);

  // Копию уже снял make-tech-copy — она содержит исходник ДО раскрытия ссылок,
  // перезаписывать её нельзя: здесь в файле уже раскрытый текст.
  const markerPath = findMarker(original);
  if (markerPath !== undefined && app.vault.getAbstractFileByPath(markerPath)) {
    await app.vault.modify(file, formatNote(original));
    return;
  }

  const techCopyPath = techCopyPathFor(file);
  const oldTechCopy = app.vault.getAbstractFileByPath(techCopyPath);
  if (oldTechCopy) await app.vault.delete(oldTechCopy);

  const techCopy = await app.vault.create(techCopyPath, original, { ctime: file.stat.ctime });
  await app.vault.modify(file, formatNote(original) + markerFor(techCopy.path));
};
