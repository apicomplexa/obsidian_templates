declare type Frontmatter = Record<string, string | string[] | undefined>;

/** Страница в представлении Dataview (dv.page / dv.pages). */
declare interface Note {
  file: {
    name: string;
    path: string;
    link: string;
    mtime: number;
    tags: string[];
    frontmatter: Frontmatter;
  };
  tags?: string[];
  summary: string;
  [field: string]: unknown;
}
