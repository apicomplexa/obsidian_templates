export const displayPinnedNotes = (notes: DataArray<Note>): void => {
  dv.header(2, "📌 Pinned notes");
  const pinned = notes
    .filter((n) => n.tags?.includes("📌pin") ?? false)
    .map((n) => n.file.link);

  if (pinned.length > 0) dv.list(pinned);
  else dv.paragraph("*no pinned notes*");
};
