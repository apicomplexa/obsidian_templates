declare type Frontmatter = Record<string, string | string[] | undefined>;

declare interface Note {
  file: {
    name: string;
    link: string;
    mtime: number;
    frontmatter: Frontmatter;
  };
  tags?: string[];
  summary: string;
}