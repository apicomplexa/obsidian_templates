/// <reference types="../../.types/note-dv.d.ts"/>
/// <reference types="../../.types/dv-dataarray.d.ts"/>

/// <reference path="./views/pinedNotes.ts"/>
/// <reference path="./views/recentNotes.ts"/>
/// <reference path="./views/searchTemplate.ts"/>
/// <reference path="./dvWrappers/getIndexes.ts"/>
/// <reference path="./views/singleIndexView.ts"/>

/// Генерация подзапросов по подиндексам
const buildSubindexQueries = (
  index: string,
  subindexes: string[],
  subindexesRepeated: string[],
  pagesWithIndexCount: number
): string[] => {
  const subindQ = subindexes.map((si) => `-["${index}":${si}]`).join("");
  const queries = [
    obsiduanQueryTemplate(
      `All notes with ${index}`,
      index,
      pagesWithIndexCount
    ),
    `[All notes with empty ${index}](obsidian://search?query=["${index}"]${subindQ})`,
  ];

  const subQueries = subindexes.map((si) => {
    const count = subindexesRepeated.filter((s) => s === si).length;
    return obsiduanQueryTemplate(si, `"${index}":"${si}"`, count);
  });

  return queries.concat(subQueries);
};

/// Основная функция отображения индексов
const displayIndexes = (notes: Note[], currentFm: Frontmatter) => {
  const indexes = getIndexes(currentFm);

  // Общее описание текущей заметки
  dv.paragraph(
    `> [!$] ${dv.current().file.name}\n${dv
      .current()
      .summary.replace(/^/gm, "> ")}`
  );

  for (const index of indexes) {
    const pagesWithIndex: DataArray<Note> = dv
      .pages("-#dv_exclude")
      .filter((p: Note) => Object.keys(p.file.frontmatter).includes(index));

    const subindexesRepeated = pagesWithIndex.flatMap((p) => {
      const val = p.file.frontmatter[index];
      if (!val) return [];
      return Array.isArray(val) ? val : [val];
    }).array();

    const currentIndexValue = currentFm[index];
    if (!currentIndexValue) continue;

    if (!Array.isArray(currentIndexValue) || currentIndexValue.length === 1) {
      const uniqueSubindexes = [...new Set(subindexesRepeated)].sort((a, b) =>
        a.localeCompare(b)
      );
      (new SingleIndexView({
        index,
        pagesWithIndex,
        subindexes: uniqueSubindexes.map((si) => ({ label: si, count: subindexesRepeated.filter((s) => s === si).length })),
      })).render()
    } else {
      const subindexesToShow = currentIndexValue.filter((si) => si !== "index");
      dv.header(1, `\`${subindexesToShow.join(" + ")}\``);
      const filteredPages = pagesWithIndex.filter((p: Note) =>
        subindexesToShow.every((si) => p.file.frontmatter[index]?.includes(si))
      );
      dv.list(filteredPages.map((p) => p.file.link));
      displayPinnedNotes(filteredPages);
      displayRecentNotes(filteredPages);
    }
  }
};

displayIndexes(dv.pages("-#dv_exclude"), dv.current().file.frontmatter);
