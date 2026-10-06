// Шаг макроса «Export: DOC» перед командой pandoc: спрашивает стиль оформления DOCX и на время
// экспорта подменяет настройки плагина obsidian-pandoc (только в памяти, без сохранения):
//   • extraArguments += --defaults=<кит>/dist/pandoc/<стиль>.yaml
//   • outputFolder    = временная папка — плагин всегда называет файл по имени заметки,
//     и без этого стили перезаписывали бы друг друга. Готовый файл переносит
//     в настоящую папку под нужным именем docx-style-finish.
// Отмена выбора прерывает макрос до того, как заметка тронута.
//
// Список стилей — src/pandoc/styles.ts.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { STYLES } from "../pandoc/styles";
import { KIT_DIR, makeStop } from "./lib/common";
import { getPandocPlugin } from "./lib/docxStyleStash";

const STYLE_ARG_RE = /^--defaults=.*[\\/]dist[\\/]pandoc[\\/][^\\/]+\.yaml$/u;

export default async (params: QuickAddParams): Promise<void> => {
  const { app, quickAddApi } = params;
  const stop = makeStop(params);

  const pandoc = getPandocPlugin(params);
  if (!pandoc) return stop("Export: плагин Pandoc не включён");
  const file = app.workspace.getActiveFile();
  if (!file) return stop("Export: нет активной заметки");

  // Хвост прошлого оборванного запуска: вернуть настройки плагина
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
  const yaml = path.join(base, KIT_DIR, "dist", "pandoc", `${style.id}.yaml`);
  if (!fs.existsSync(yaml)) return stop(`Export: нет файла стиля ${yaml} — пересоберите кит (pixi run build)`);
  // плагин режет extraArguments по пробелам
  if (/\s/u.test(yaml)) return stop(`Export: в пути к стилю есть пробел — плагин Pandoc его не передаст: ${yaml}`);

  const cleanArgs = (pandoc.settings.extraArguments || "")
    .split("\n")
    .filter((l) => !STYLE_ARG_RE.test(l.trim()))
    .join("\n");
  const orig = { extraArguments: cleanArgs, outputFolder: pandoc.settings.outputFolder };
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "obsidian-docx-"));

  window.__quickaddDocxStyle = {
    orig,
    style,
    tmpDir,
    startedAt: Date.now(),
    outName: `${file.basename}.docx`,
    targetDir: orig.outputFolder || path.dirname(path.join(base, file.path)),
  };
  pandoc.settings.extraArguments = `${cleanArgs}\n--defaults=${yaml}`;
  pandoc.settings.outputFolder = tmpDir;
};
