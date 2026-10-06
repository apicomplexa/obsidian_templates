/// <reference types="../../.types/note-dv.d.ts"/>
/// <reference types="../../.types/dv-dataarray.d.ts"/>

const currentTags: string[] = dv.current().file.tags ?? [];
const tags = currentTags.filter((tag) => tag !== "#dv_exclude");

for (const tag of tags) {
  const pagesWithTag: DataArray<Note> = dv.pages(`-#dv_exclude & ${tag}`);

  dv.header(1, `\`${tag}\``);

  if (tag !== "#📌pin") {
    dv.header(2, "📌 Pinned notes");
    const pinned = pagesWithTag
      .filter((n: Note) => n.tags?.includes("📌pin") ?? false)
      .map((n: Note) => n.file.link);
    if (pinned.length > 0) dv.list(pinned);
    else dv.paragraph("*no pinned notes*");
  }

  dv.header(2, "⌚ Recently updated");
  dv.list(
    pagesWithTag
      .sort((note: Note) => note.file.mtime, "desc")
      .slice(0, 10)
      .map((n: Note) => `${n.file.link} \`(${new Date(n.file.mtime).toLocaleString()})\``)
  );

  dv.header(2, `All notes with \`${tag}\``);
  dv.list(pagesWithTag.map((p: Note) => p.file.link));
}
