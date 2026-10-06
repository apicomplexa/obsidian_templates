// Техническая копия заметки на время экспорта: исходник лежит в корне хранилища как TECH_COPY_<имя>,
// а в конец рабочей заметки дописан маркер с путём к нему.
//
// Маркер — HTML-комментарий, а не %%…%%: pandoc в режиме markdown выбрасывает его из DOCX,
// а %%…%% попадал бы в документ обычным текстом. Старый вид %%TECH_COPY_PATH--…%% тоже распознаётся.

import type { TFile } from "obsidian";

export const MARKER_RE = /(?:%%|<!--\s*)TECH_COPY_PATH--(.*?)(?:%%|\s*-->)/u;

export const techCopyPathFor = (file: TFile): string => `TECH_COPY_${file.name}`;

export const markerFor = (techCopyPath: string): string => `\n\n<!-- TECH_COPY_PATH--${techCopyPath} -->\n`;

/** Путь к технической копии из маркера в тексте заметки, если маркер есть. */
export const findMarker = (content: string): string | undefined => content.match(MARKER_RE)?.[1]?.trim();
