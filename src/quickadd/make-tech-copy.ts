// Первый шаг макроса «Export: DOC». Снимает техническую копию с ИСХОДНОЙ заметки — до того как
// convert-links раскроет встроенные ссылки и format-with-regexp заменит синтаксис.

import { makeStop } from "./lib/common";
import { findMarker, markerFor, techCopyPathFor } from "./lib/techCopy";

export default async (params: QuickAddParams): Promise<void> => {
  const { app, obsidian } = params;
  const stop = makeStop(params);

  const file = app.workspace.getActiveFile();
  if (!file) return stop("Export: нет активной заметки");

  let content = await app.vault.read(file);
  const techCopyPath = techCopyPathFor(file);
  const markerPath = findMarker(content);

  // Прошлый экспорт оборвался (например, отменили выбор уровня рекурсии): заметка
  // раскрыта, исходник лежит в TECH_COPY. Маркер и копия на месте — значит, пара
  // целая: возвращаем исходник и продолжаем экспорт с него.
  if (markerPath !== undefined) {
    const copy = app.vault.getAbstractFileByPath(markerPath);
    if (!(copy instanceof obsidian.TFile)) {
      return stop(
        `Export прерван: в заметке маркер технической копии, а самой копии ` +
          `«${markerPath}» нет. Восстановите заметку вручную (история git).`
      );
    }
    content = await app.vault.read(copy);
    await app.vault.modify(file, content);
    await app.vault.delete(copy);
    // convert-links берёт встроенные ссылки из metadataCache — дать ему переиндексировать файл
    await new Promise<void>((resolve) => {
      const done = () => {
        clearTimeout(timer);
        app.metadataCache.offref(ref);
        resolve();
      };
      const ref = app.metadataCache.on("changed", (f) => {
        if (f.path === file.path) done();
      });
      const timer = setTimeout(done, 3000);
    });
    new obsidian.Notice("Export: заметка восстановлена из технической копии прошлого, оборванного экспорта", 8000);
  }

  // Копия без маркера — непонятно, что из них исходник: решает человек.
  if (app.vault.getAbstractFileByPath(techCopyPath)) {
    return stop(
      `Export прерван: в корне хранилища уже лежит «${techCopyPath}» ` +
        `от прерванного экспорта. Сверьте её с заметкой и удалите вручную.`
    );
  }

  await app.vault.create(techCopyPath, content);
  await app.vault.modify(file, content + markerFor(techCopyPath));
};
