import { Component } from "./viewComponent";
import { SingleIndexView } from "./singleIndexView";
import { displayPinnedNotes } from "./pinnedNotes";
import { displayRecentNotes } from "./recentNotes";
import { getIndexes } from "../../shared/getIndexes";

export class IndexPageTemplate extends Component<{ currentFm: Frontmatter }> {
  constructor(
    props: { currentFm: Frontmatter },
    children: IndexPageTemplateView[]
  ) {
    super(children, props);
  }

  public render(): void {
    const { currentFm } = this.props;
    const indexes = getIndexes(currentFm);

    const indexesWithSubindexes: { [index: string]: Set<string> } = {};

    const pages: DataArray<Note> = dv.pages("-#dv_exclude");

    for (const page of pages) {
      const pageFm = page.file.frontmatter;
      const pageIndexes = getIndexes(pageFm);
      for (const pageIndex of pageIndexes) {
        const subindexes = pageFm[pageIndex];
        if (subindexes) {
          if (!indexesWithSubindexes[pageIndex]) {
            indexesWithSubindexes[pageIndex] = new Set<string>();
          }
          indexesWithSubindexes[pageIndex] = new Set<string>([
            ...indexesWithSubindexes[pageIndex],
            ...(Array.isArray(subindexes) ? subindexes : [subindexes]),
          ]);
        }
      }
    }

    const currentPageIndexes = indexes.map((index) => ({
      index,
      subIndexes: indexesWithSubindexes[index] ?? new Set<string>(),
    }));

    new IndexPageTemplateView([], { indexes: currentPageIndexes, currentFm }).render();
  }
}

class IndexPageTemplateView extends Component<{
  indexes: { index: string; subIndexes: Set<string> }[];
  currentFm: Frontmatter;
}> {
  public render(): void {
    const { indexes, currentFm } = this.props;

    dv.paragraph(
      `> [!$] ${dv.current().file.name}\n${dv.current().summary.replace(/^/gm, "> ")}`
    );

    const allPages: DataArray<Note> = dv.pages("-#dv_exclude");

    for (const { index, subIndexes } of indexes) {
      const pagesWithIndex = allPages.filter(
        (p: Note) => Object.keys(p.file.frontmatter).includes(index)
      );

      const subindexesRepeated = pagesWithIndex
        .flatMap((p: Note): string[] => {
          const val = p.file.frontmatter[index];
          if (!val) return [];
          return Array.isArray(val) ? val : [val];
        })
        .array();

      const currentIndexValue = currentFm[index];
      if (!currentIndexValue) continue;

      if (!Array.isArray(currentIndexValue) || currentIndexValue.length === 1) {
        const uniqueSubindexes = [...subIndexes].sort((a, b) => a.localeCompare(b));
        new SingleIndexView({
          index,
          pagesWithIndex,
          subindexes: uniqueSubindexes.map((si) => ({
            label: si,
            count: subindexesRepeated.filter((s) => s === si).length,
          })),
        }).render();
      } else {
        const subindexesToShow = (currentIndexValue as string[]).filter(
          (si) => si !== "index"
        );
        dv.header(1, `\`${subindexesToShow.join(" + ")}\``);
        const filteredPages = pagesWithIndex.filter((p: Note) =>
          subindexesToShow.every((si) => p.file.frontmatter[index]?.includes(si))
        );
        dv.list(filteredPages.map((p: Note) => p.file.link));
        displayPinnedNotes(filteredPages);
        displayRecentNotes(filteredPages);
      }
    }
  }
}
