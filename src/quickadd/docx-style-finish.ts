// Шаг макроса «Export: DOC» после команды pandoc (пара к docx-style-begin).
// Ждёт, пока pandoc допишет файл во временную папку, переносит его в настоящую
// папку экспорта с суффиксом стиля и возвращает настройки плагина obsidian-pandoc.
// Настройки возвращаются в любом случае, даже если файл так и не появился.

import fs from "node:fs";
import path from "node:path";
import { getPandocPlugin } from "./lib/docxStyleStash";

const TIMEOUT_MS = 180000;
const POLL_MS = 400;

// Файл готов, когда он есть, свежее старта и его размер не меняется между опросами
const waitForFile = async (file: string, startedAt: number): Promise<boolean> => {
  let lastSize = -1;
  const deadline = Date.now() + TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const st = fs.statSync(file);
      if (st.mtimeMs >= startedAt - 2000 && st.size > 0 && st.size === lastSize) return true;
      lastSize = st.size;
    } catch {
      // ещё не создан
    }
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
  return false;
};

export default async (params: QuickAddParams): Promise<void> => {
  const { obsidian } = params;

  const s = window.__quickaddDocxStyle;
  if (!s) return; // стиль не выбирался — делать нечего

  const pandoc = getPandocPlugin(params);
  try {
    const out = path.join(s.tmpDir, s.outName);
    if (await waitForFile(out, s.startedAt)) {
      const target = path.join(s.targetDir, s.outName.replace(/\.docx$/u, `${s.style.suffix}.docx`));
      fs.copyFileSync(out, target); // не rename: tmp и папка экспорта бывают на разных дисках
      new obsidian.Notice(`DOCX (${s.style.name}) сохранён:\n${target}`, 10000);
    } else {
      new obsidian.Notice(
        `Export: pandoc не создал файл за ${TIMEOUT_MS / 1000} с — смотрите уведомления плагина Pandoc`,
        15000
      );
    }
  } finally {
    if (pandoc) Object.assign(pandoc.settings, s.orig);
    delete window.__quickaddDocxStyle;
    try {
      fs.rmSync(s.tmpDir, { recursive: true, force: true });
    } catch (e) {
      console.error("docx-style-finish: не удалось удалить", s.tmpDir, e);
    }
  }
};
