// Собрано obsidian-kit из src/dataviews/indexPage/view.ts — не править, правки вносить в исходник.
"use strict";
(() => {
  // src/dataviews/indexPage/views/viewComponent.ts
  var Component = class {
    constructor(children = [], props = {}) {
      this.children = children;
      this.props = props;
    }
    children;
    props;
    render() {
      this.children.forEach((c) => c.render());
    }
  };

  // src/dataviews/indexPage/views/searchTemplate.ts
  var obsidianQueryTemplate = (text, q, count) => `[${text}](obsidian://search?query=[${q}]) \`${count}\``;

  // src/dataviews/indexPage/views/pinnedNotes.ts
  var displayPinnedNotes = (notes) => {
    dv.header(2, "📌 Pinned notes");
    const pinned = notes.filter((n) => n.tags?.includes("📌pin") ?? false).map((n) => n.file.link);
    if (pinned.length > 0) dv.list(pinned);
    else dv.paragraph("*no pinned notes*");
  };

  // src/dataviews/indexPage/views/recentNotes.ts
  var displayRecentNotes = (notes, limit = 10) => {
    dv.header(2, "⌚ Recently updated");
    dv.list(
      notes.sort((note) => note.file.mtime, "desc").slice(0, limit).map((n) => `${n.file.link} \`(${new Date(n.file.mtime).toLocaleString()})\``)
    );
  };

  // src/dataviews/indexPage/views/singleIndexView.ts
  var SingleIndexView = class extends Component {
    constructor(props) {
      super([], props);
    }
    render() {
      dv.header(1, `\`${this.props.index}\``);
      dv.list(this.buildQueries());
      dv.paragraph("\n\n");
      displayPinnedNotes(this.props.pagesWithIndex);
      displayRecentNotes(this.props.pagesWithIndex);
    }
    buildQueries() {
      const { index, subindexes } = this.props;
      const mainIndexQuery = obsidianQueryTemplate(
        `All notes with ${index}`,
        index,
        this.props.pagesWithIndex.length
      );
      const negativeQuery = subindexes.map((si) => `-["${index}":${si.label}]`).join("");
      const emptyIndexQuery = `[All notes with empty ${index}](obsidian://search?query=["${index}"]${negativeQuery})`;
      const subindexesQueries = subindexes.map(
        (si) => obsidianQueryTemplate(si.label, `"${index}":"${si.label}"`, si.count)
      );
      return [mainIndexQuery, emptyIndexQuery, ...subindexesQueries];
    }
  };

  // src/dataviews/shared/getIndexes.ts
  var getIndexes = (fm) => Object.keys(fm).filter((key) => {
    if (key === "type") return false;
    const value = fm[key];
    return typeof value === "string" ? value.includes("index") : Array.isArray(value) && value.includes("index");
  });

  // src/dataviews/indexPage/views/commonIndexPageView.ts
  var IndexPageTemplate = class extends Component {
    constructor(props, children) {
      super(children, props);
    }
    render() {
      const { currentFm } = this.props;
      const indexes = getIndexes(currentFm);
      const indexesWithSubindexes = {};
      const pages = dv.pages("-#dv_exclude");
      for (const page of pages) {
        const pageFm = page.file.frontmatter;
        const pageIndexes = getIndexes(pageFm);
        for (const pageIndex of pageIndexes) {
          const subindexes = pageFm[pageIndex];
          if (subindexes) {
            if (!indexesWithSubindexes[pageIndex]) {
              indexesWithSubindexes[pageIndex] = /* @__PURE__ */ new Set();
            }
            indexesWithSubindexes[pageIndex] = /* @__PURE__ */ new Set([
              ...indexesWithSubindexes[pageIndex],
              ...Array.isArray(subindexes) ? subindexes : [subindexes]
            ]);
          }
        }
      }
      const currentPageIndexes = indexes.map((index) => ({
        index,
        subIndexes: indexesWithSubindexes[index] ?? /* @__PURE__ */ new Set()
      }));
      new IndexPageTemplateView([], { indexes: currentPageIndexes, currentFm }).render();
    }
  };
  var IndexPageTemplateView = class extends Component {
    render() {
      const { indexes, currentFm } = this.props;
      dv.paragraph(
        `> [!$] ${dv.current().file.name}
${dv.current().summary.replace(/^/gm, "> ")}`
      );
      const allPages = dv.pages("-#dv_exclude");
      for (const { index, subIndexes } of indexes) {
        const pagesWithIndex = allPages.filter(
          (p) => Object.keys(p.file.frontmatter).includes(index)
        );
        const subindexesRepeated = pagesWithIndex.flatMap((p) => {
          const val = p.file.frontmatter[index];
          if (!val) return [];
          return Array.isArray(val) ? val : [val];
        }).array();
        const currentIndexValue = currentFm[index];
        if (!currentIndexValue) continue;
        if (!Array.isArray(currentIndexValue) || currentIndexValue.length === 1) {
          const uniqueSubindexes = [...subIndexes].sort((a, b) => a.localeCompare(b));
          new SingleIndexView({
            index,
            pagesWithIndex,
            subindexes: uniqueSubindexes.map((si) => ({
              label: si,
              count: subindexesRepeated.filter((s) => s === si).length
            }))
          }).render();
        } else {
          const subindexesToShow = currentIndexValue.filter(
            (si) => si !== "index"
          );
          dv.header(1, `\`${subindexesToShow.join(" + ")}\``);
          const filteredPages = pagesWithIndex.filter(
            (p) => subindexesToShow.every((si) => p.file.frontmatter[index]?.includes(si))
          );
          dv.list(filteredPages.map((p) => p.file.link));
          displayPinnedNotes(filteredPages);
          displayRecentNotes(filteredPages);
        }
      }
    }
  };

  // src/dataviews/indexPage/view.ts
  new IndexPageTemplate({ currentFm: dv.current().file.frontmatter }, []).render();
})();
