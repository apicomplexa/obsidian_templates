/// <reference types="../../.types/note-dv.d.ts"/>
/// <reference types="../../.types/dv-dataarray.d.ts"/>

/// <reference path="./views/commonIndexPageVIew.ts"/>

new IndexPageTemplate(
  { currentFm: dv.current().file.frontmatter },
  []
).render();
