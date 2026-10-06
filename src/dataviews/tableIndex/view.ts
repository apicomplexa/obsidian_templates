// Таблицы заметок по подиндексам: для каждого индекса текущей страницы и каждого
// его значения (кроме "index") — таблица «заметка / summary / в каких индексах лежит».

import { getIndexes } from "../shared/getIndexes";

const toArray = (value: unknown): string[] =>
  value == null ? [] : Array.isArray(value) ? value.map(String) : [String(value)];

const pill = (label: string): string =>
  `<span class="text_pill bordered" style="--pill-color: rgba(var(--ctp-accent), 0.5)">${label}</span>`;

/** Ссылки на индексные страницы (с тегом #dv_exclude), в которые входит заметка, с её значениями-пилюлями. */
const getNoteProperties = (note: Note): string[] => {
  const properties: string[] = [];
  for (const field in note.file.frontmatter) {
    const indexPage = dv.page(field);
    if (indexPage?.file.tags.includes("#dv_exclude")) {
      properties.push(`${indexPage.file.link} <span>${toArray(note[field]).map(pill)}</span>`);
    }
  }
  return properties;
};

const currentFm = dv.current().file.frontmatter;

for (const index of getIndexes(currentFm)) {
  const pagesWithIndex = dv
    .pages("-#dv_exclude")
    .filter((p) => Object.keys(p.file.frontmatter).includes(index));

  for (const subindex of toArray(currentFm[index]).filter((si) => si !== "index")) {
    const pagesWithSubindex = pagesWithIndex.filter((p) => toArray(p.file.frontmatter[index]).includes(subindex));

    dv.table(
      [subindex, "Summary", "Properties"],
      pagesWithSubindex.map((p) => [
        p.file.link,
        `<span style="text-align: left !important">${p.summary}</span>`,
        getNoteProperties(p),
      ])
    );
  }
}
