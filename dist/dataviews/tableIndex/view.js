// Собрано obsidian-kit из src/dataviews/tableIndex/view.ts — не править, правки вносить в исходник.
"use strict";
(() => {
  // src/dataviews/shared/getIndexes.ts
  var getIndexes = (fm) => Object.keys(fm).filter((key) => {
    if (key === "type") return false;
    const value = fm[key];
    return typeof value === "string" ? value.includes("index") : Array.isArray(value) && value.includes("index");
  });

  // src/dataviews/tableIndex/view.ts
  var toArray = (value) => value == null ? [] : Array.isArray(value) ? value.map(String) : [String(value)];
  var pill = (label) => `<span class="text_pill bordered" style="--pill-color: rgba(var(--ctp-accent), 0.5)">${label}</span>`;
  var getNoteProperties = (note) => {
    const properties = [];
    for (const field in note.file.frontmatter) {
      const indexPage = dv.page(field);
      if (indexPage?.file.tags.includes("#dv_exclude")) {
        properties.push(`${indexPage.file.link} <span>${toArray(note[field]).map(pill)}</span>`);
      }
    }
    return properties;
  };
  var currentFm = dv.current().file.frontmatter;
  for (const index of getIndexes(currentFm)) {
    const pagesWithIndex = dv.pages("-#dv_exclude").filter((p) => Object.keys(p.file.frontmatter).includes(index));
    for (const subindex of toArray(currentFm[index]).filter((si) => si !== "index")) {
      const pagesWithSubindex = pagesWithIndex.filter((p) => toArray(p.file.frontmatter[index]).includes(subindex));
      dv.table(
        [subindex, "Summary", "Properties"],
        pagesWithSubindex.map((p) => [
          p.file.link,
          `<span style="text-align: left !important">${p.summary}</span>`,
          getNoteProperties(p)
        ])
      );
    }
  }
})();
