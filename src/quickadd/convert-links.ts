// Шаг макроса «Export: DOC» (и самостоятельный макрос): превращает wiki-ссылки в markdown-ссылки,
// а встраивания ![[…]] заметок, их заголовков и блоков — в сам текст. Вложенные встраивания
// раскрываются за несколько проходов: глубина выбирается при запуске.

import type { App, Pos, ReferenceCache, TFile } from "obsidian";

enum EmbedVariant {
  FULL_NOTE = "full note",
  BLOCK = "block",
  HEADING = "heading",
  ERROR = "error",
}

interface Reference {
  link: ReferenceCache;
  file: TFile;
}

interface Replacement {
  searchValue: string;
  replaceValue: string;
  isEmbed: boolean;
  embedType?: EmbedVariant;
}

const DEFAULT_RECURSION_LEVEL = 3;
const MAX_RECURSION_LEVEL = 7;

export default async (params: QuickAddParams): Promise<void> => {
  const { app } = params;
  const file = app.workspace.getActiveFile();
  if (!file) return;

  const levels = [1, 2, 3, 4, 5, 6, 7];
  const recursionLevel = await params.quickAddApi.suggester(
    [`RECURSION LEVEL (def = ${DEFAULT_RECURSION_LEVEL})`, ...levels.map(String)],
    [DEFAULT_RECURSION_LEVEL, ...levels]
  );
  await convertAllReferencesToMark(file, app, recursionLevel ?? DEFAULT_RECURSION_LEVEL);
};

const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const logError = (message: string, details?: string): void => {
  console.error(details ? `${message}\n--------\n${details}` : message);
};

const convertAllReferencesToMark = async (note: TFile, app: App, depth: number): Promise<void> => {
  depth = Math.min(Math.max(depth, 1), MAX_RECURSION_LEVEL);
  for (let i = 0; i < depth; i++) {
    console.log(`convert-links: проход ${i + 1}/${depth}`);
    await app.vault.modify(note, await convertOnce(note, app));
  }
};

const convertOnce = async (note: TFile, app: App): Promise<string> => {
  let text = await app.vault.read(note);
  const metadata = app.metadataCache.getFileCache(note);
  if (!metadata) return text;

  const links = metadata.links?.filter((l) => /\[\[.*\]\]/.test(l.original));
  const embeds = metadata.embeds?.filter((e) => /!\[\[.*\]\]/.test(e.original));
  if (links) text = replaceReferences(findFiles(links, note.path, app), text);
  if (embeds) text = await convertEmbeds(note.path, text, embeds, app);
  return text;
};

const convertEmbeds = async (notePath: string, text: string, embeds: ReferenceCache[], app: App): Promise<string> => {
  const files = findFiles(embeds, notePath, app);
  const notes = files.filter((r) => r.file.extension === "md");
  const attachments = files.filter((r) => r.file.extension !== "md");
  text = replaceReferences(attachments, text, true);
  return multiReplace(text, await parseEmbeds(notes, app));
};

const findFiles = (refs: ReferenceCache[], notePath: string, app: App): Reference[] => {
  const valid: Reference[] = [];
  const broken: ReferenceCache[] = [];
  for (const link of refs) {
    const m = link.link.match(/([^#^]+)([#^].*)?/u);
    const file = m ? app.metadataCache.getFirstLinkpathDest(m[1], notePath) : null;
    if (file) valid.push({ link, file });
    else broken.push(link);
  }
  if (broken.length > 0) {
    logError(
      "Invalid links",
      broken.map((l) => `${l.original} on position: row ${l.position.start.line}, col ${l.position.start.col}`).join("\n")
    );
  }
  return valid;
};

const parseEmbeds = async (embeds: Reference[], app: App): Promise<Replacement[]> => {
  const sliceLines = async (note: TFile, startLine: number, endLine: number): Promise<string> =>
    (await app.vault.read(note))
      .split(/\n/m)
      .slice(startLine, endLine + 1)
      .join("\n");

  const unchanged = (ref: Reference): Replacement => ({
    searchValue: ref.link.original,
    replaceValue: ref.link.original,
    isEmbed: true,
    embedType: EmbedVariant.ERROR,
  });

  // Вся заметка без frontmatter
  const parseWholeNote = async (ref: Reference): Promise<Replacement> => {
    let content = await app.vault.read(ref.file);
    const cache = app.metadataCache.getFileCache(ref.file);
    const sections = cache?.sections;
    const fmPosition = sections?.find((s) => s.type === "yaml")?.position;
    if (sections && fmPosition) {
      content = await sliceLines(ref.file, fmPosition.end.line + 1, sections[sections.length - 1].position.end.line);
    }
    return { searchValue: ref.link.original, replaceValue: content, isEmbed: true, embedType: EmbedVariant.FULL_NOTE };
  };

  const composePart = async (
    ref: Reference,
    position: Pos | undefined,
    name: string,
    type: EmbedVariant
  ): Promise<Replacement> => {
    if (!position) {
      logError(
        `Reference to nonexistent ${type}`,
        `On line ${ref.link.position.start.line}:\n${name} to file ${ref.file.path}.\nReference was not changed`
      );
      return unchanged(ref);
    }
    return {
      searchValue: ref.link.original,
      replaceValue: await sliceLines(ref.file, position.start.line, position.end.line),
      isEmbed: true,
      embedType: type,
    };
  };

  // Блок (#^id) или раздел под заголовком (#Заголовок)
  const parseNotePart = async (ref: Reference): Promise<Replacement> => {
    const cache = app.metadataCache.getFileCache(ref.file);

    const blockId = ref.link.link.match(/[^#]#\^([^|]*)(?:\|.*)?/)?.[1];
    if (blockId !== undefined) {
      return composePart(ref, cache?.blocks?.[blockId]?.position, blockId, EmbedVariant.BLOCK);
    }

    const headingName = ref.link.link.match(/[^#]#([^|]*)(?:\|.*)?/)?.[1];
    const headings = cache?.headings;
    const sections = cache?.sections;
    const headingIndex = headings?.findIndex((h) => h.heading === headingName) ?? -1;
    if (headings && sections && headingName !== undefined) {
      if (headingIndex < 0) return composePart(ref, undefined, headingName, EmbedVariant.HEADING);
      const heading = headings[headingIndex];
      const next =
        headings.slice(headingIndex + 1).find((h) => h.level === heading.level) ?? sections[sections.length - 1];
      return composePart(ref, { start: heading.position.start, end: next.position.end }, headingName, EmbedVariant.HEADING);
    }

    logError(
      "Invalid Embed",
      `On line ${ref.link.position.start.line}.\n` +
        "Problems with identification of type of this embed: block or heading link\nReference was not changed"
    );
    return unchanged(ref);
  };

  return Promise.all(
    embeds.map((embed) =>
      /[^#]#[^|]*(?:\|.*)?/.test(embed.link.original) ? parseNotePart(embed) : parseWholeNote(embed)
    )
  );
};

const replaceReferences = (refs: Reference[], text: string, isEmbed = false): string =>
  multiReplace(
    text,
    refs.map((r) => ({
      searchValue: r.link.original,
      replaceValue: `${isEmbed ? "!" : ""}[${r.link.displayText}](${encodeURI(r.file.path)})`,
      isEmbed,
    }))
  );

// Замена функцией, а не строкой: иначе $$, $& и $1 в тексте встраиваемой заметки
// интерпретируются как шаблоны замены (и $$-формулы превращаются в $).
const multiReplace = (source: string, replacements: Replacement[]): string =>
  replacements.reduce(
    (text, r) => text.replace(new RegExp(escapeRegExp(r.searchValue), "gu"), () => r.replaceValue),
    source
  );
