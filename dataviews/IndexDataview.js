const obsiduanQueryTemplate = (text, q, count) =>
  `[${text}](obsidian://search?query=[${q}]) \`${count}\``;

const displayPinedNotes = (notes) => {
  dv.header(2, "📌Pined notes");
  const pinedNotes = notes
    .filter((p) => p.tags?.includes("📌pin"))
    .map((p) => p.file.link);
  if (pinedNotes.length > 0) {
    dv.list(pinedNotes);
  } else dv.paragraph("*no pined notes*");
};

const displayLastNotes = (notes) => {
  dv.header(2, "⌚Recently updated");
  dv.list(
    notes
      .sort((p1) => -p1.file.mtime)
      .slice(0, 10)
      .map((p) => `${p.file.link}`)
  );
};

const currentFm = dv.current().file.frontmatter;
const indexes = Object.keys(currentFm).filter((fm) => {
  if (fm === "type") {
    return false;
  }
  try {
    return currentFm[fm].includes("index");
  } catch {
    return false;
  }
});

dv.paragraph(
  `> [!$] ${dv.current().file.name}\n ${dv
    .current()
    .summary.replaceAll(/^/gm, "> ")}`
);

for (let index of indexes) {
  const pagesWithIndex = dv
    .pages("-#dv_exclude")
    .filter((p) => Object.keys(p.file.frontmatter).includes(index));
  let subindexesRepeated = pagesWithIndex.flatMap((p) => {
    try {
      let fms = p.file.frontmatter[index];
      return fms;
    } catch (e) {}
  });

  if (dv.current().file.frontmatter[index].length === 1) {
    let subindexes = [...new Set(subindexesRepeated)].sort((a, b) =>
      a.localeCompare(b)
    );
    let subindQ = subindexes
      .map((si) => `-["${index}":${si}]`)
      .toString()
      .replaceAll(",", "");
    dv.header(1, `\`${index}\``);
    let subindexQuerys = [
      obsiduanQueryTemplate(
        `All notes with ${index}`,
        index,
        pagesWithIndex.length
      ),
      `[All notes with empty ${index}](obsidian://search?query=["${index}"]${subindQ})`,
    ];
    subindexQuerys = subindexQuerys.concat(
      subindexes.map((si) => {
        let indexCount = subindexesRepeated.filter((s) => s === si).length;
        return obsiduanQueryTemplate(si, `"${index}":"${si}"`, indexCount);
      })
    );
    dv.list(subindexQuerys);
    dv.paragraph("\n\n");

    displayPinedNotes(pagesWithIndex);
    displayLastNotes(pagesWithIndex);
  } else {
    const subindexesToShow = dv
      .current()
      .file.frontmatter[index].filter((si) => si !== "index");

    dv.header(1, `\`${subindexesToShow.join(" + ")}\``);
    let pagesWithSubIndexes = pagesWithIndex.filter((page) =>
      subindexesToShow.every((si) => page.file.frontmatter[index]?.includes(si))
    );
    dv.list(pagesWithSubIndexes.map((p) => p.file.link));
    displayPinedNotes(pagesWithSubIndexes);
    displayLastNotes(pagesWithSubIndexes);
  }
}