// Последний шаг макроса «Export: DOC». Возвращает в заметку текст технической копии и удаляет копию.
// Содержимое переписывается в тот же файл (vault.modify), а не через delete + rename:
// файл не пересоздаётся, открытая вкладка остаётся на месте.

import { makeStop } from "./lib/common";
import { findMarker } from "./lib/techCopy";

export default async (params: QuickAddParams): Promise<void> => {
  const { app, obsidian } = params;
  const stop = makeStop(params);

  const modFile = app.workspace.getActiveFile();
  if (!modFile) return stop("Restore: нет активной заметки");

  const markerPath = findMarker(await app.vault.read(modFile));
  if (markerPath === undefined) {
    return stop("Утеряна техническая копия заметки. Пожалуйста, посмотрите в корневой папке хранилища");
  }

  const techCopy = app.vault.getAbstractFileByPath(markerPath);
  if (!(techCopy instanceof obsidian.TFile)) {
    return stop(`Ошибка при получении доступа к технической копии «${markerPath}»`);
  }

  await app.vault.modify(modFile, await app.vault.read(techCopy));
  await app.vault.delete(techCopy);
};
