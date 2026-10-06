/// <reference types="../../../.types/global.d.ts"/>
/// <reference types="../../../.types/dv-dataarray.d.ts"/>
/// <reference types="../../../.types/note-dv.d.ts"/>

/// <reference path="./viewComponent.ts"/>
/// <reference path="./searchTemplate.ts"/>
/// <reference path="./pinedNotes.ts"/>
/// <reference path="./recentNotes.ts"/>

interface SingleIndexViewProps {
  index: string;
  pagesWithIndex: DataArray<Note>;
  subindexes: { label: string; count: number }[];
}

class SingleIndexView extends Component<SingleIndexViewProps> {
  constructor(props: SingleIndexViewProps) {
    super([], props);
  }

  public render(): void {
    dv.header(1, `\`${this.props.index}\``);
    dv.list(this.buildQueries());
    dv.paragraph("\n\n");
    displayPinnedNotes(this.props.pagesWithIndex);
    displayRecentNotes(this.props.pagesWithIndex);
  }

  private buildQueries(): string[] {
    const { index, subindexes } = this.props;

    const mainIndexQuery = obsiduanQueryTemplate(
      `All notes with ${index}`,
      index,
      this.props.pagesWithIndex.length
    );
    const negativeQuery = subindexes
      .map((si) => `-["${index}":${si.label}]`)
      .join("");
    const emptyIndexQuery = `[All notes with empty ${index}](obsidian://search?query=["${index}"]${negativeQuery})`;
    const subindexesQueries = subindexes.map((si) =>
      obsiduanQueryTemplate(si.label, `"${index}":"${si.label}"`, si.count)
    );
    return [mainIndexQuery, emptyIndexQuery, ...subindexesQueries];
  }
}
