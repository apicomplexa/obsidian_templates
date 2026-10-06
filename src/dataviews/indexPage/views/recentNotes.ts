export const displayRecentNotes = (notes: DataArray<Note>, limit = 10): void => {
  dv.header(2, "⌚ Recently updated");
  dv.list(
    notes
      .sort((note) => note.file.mtime, "desc")
      .slice(0, limit)
      .map((n) => `${n.file.link} \`(${new Date(n.file.mtime).toLocaleString()})\``)
  );
};
