/// <reference types="../../../.types/note-dv.d.ts"/>

const getIndexes = (fm: Frontmatter): string[] =>
  Object.keys(fm).filter((key) => {
    if (key === "type") return false;
    const value = fm[key];
    return typeof value === "string" ? value.includes("index") : Array.isArray(value) && value.includes("index");
  });