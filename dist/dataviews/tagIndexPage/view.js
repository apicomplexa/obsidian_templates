// Собрано obsidian-kit из src/dataviews/tagIndexPage/view.ts — не править, правки вносить в исходник.
"use strict";
(() => {
  // src/dataviews/tagIndexPage/view.ts
  var currentTags = dv.current().file.tags ?? [];
  var tags = currentTags.filter((tag) => tag !== "#dv_exclude");
  for (const tag of tags) {
    const pagesWithTag = dv.pages(`-#dv_exclude & ${tag}`);
    dv.header(1, `\`${tag}\``);
    if (tag !== "#📌pin") {
      dv.header(2, "📌 Pinned notes");
      const pinned = pagesWithTag.filter((n) => n.tags?.includes("📌pin") ?? false).map((n) => n.file.link);
      if (pinned.length > 0) dv.list(pinned);
      else dv.paragraph("*no pinned notes*");
    }
    dv.header(2, "⌚ Recently updated");
    dv.list(
      pagesWithTag.sort((note) => note.file.mtime, "desc").slice(0, 10).map((n) => `${n.file.link} \`(${new Date(n.file.mtime).toLocaleString()})\``)
    );
    dv.header(2, `All notes with \`${tag}\``);
    dv.list(pagesWithTag.map((p) => p.file.link));
  }
})();
