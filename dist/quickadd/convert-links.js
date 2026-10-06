// Собрано obsidian-kit из src/quickadd/convert-links.ts — не править, правки вносить в исходник.
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/quickadd/convert-links.ts
var convert_links_exports = {};
__export(convert_links_exports, {
  default: () => convert_links_default
});
module.exports = __toCommonJS(convert_links_exports);
var DEFAULT_RECURSION_LEVEL = 3;
var MAX_RECURSION_LEVEL = 7;
var convert_links_default = async (params) => {
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
var escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
var logError = (message, details) => {
  console.error(details ? `${message}
--------
${details}` : message);
};
var convertAllReferencesToMark = async (note, app, depth) => {
  depth = Math.min(Math.max(depth, 1), MAX_RECURSION_LEVEL);
  for (let i = 0; i < depth; i++) {
    console.log(`convert-links: проход ${i + 1}/${depth}`);
    await app.vault.modify(note, await convertOnce(note, app));
  }
};
var convertOnce = async (note, app) => {
  let text = await app.vault.read(note);
  const metadata = app.metadataCache.getFileCache(note);
  if (!metadata) return text;
  const links = metadata.links?.filter((l) => /\[\[.*\]\]/.test(l.original));
  const embeds = metadata.embeds?.filter((e) => /!\[\[.*\]\]/.test(e.original));
  if (links) text = replaceReferences(findFiles(links, note.path, app), text);
  if (embeds) text = await convertEmbeds(note.path, text, embeds, app);
  return text;
};
var convertEmbeds = async (notePath, text, embeds, app) => {
  const files = findFiles(embeds, notePath, app);
  const notes = files.filter((r) => r.file.extension === "md");
  const attachments = files.filter((r) => r.file.extension !== "md");
  text = replaceReferences(attachments, text, true);
  return multiReplace(text, await parseEmbeds(notes, app));
};
var findFiles = (refs, notePath, app) => {
  const valid = [];
  const broken = [];
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
var parseEmbeds = async (embeds, app) => {
  const sliceLines = async (note, startLine, endLine) => (await app.vault.read(note)).split(/\n/m).slice(startLine, endLine + 1).join("\n");
  const unchanged = (ref) => ({
    searchValue: ref.link.original,
    replaceValue: ref.link.original,
    isEmbed: true,
    embedType: "error" /* ERROR */
  });
  const parseWholeNote = async (ref) => {
    let content = await app.vault.read(ref.file);
    const cache = app.metadataCache.getFileCache(ref.file);
    const sections = cache?.sections;
    const fmPosition = sections?.find((s) => s.type === "yaml")?.position;
    if (sections && fmPosition) {
      content = await sliceLines(ref.file, fmPosition.end.line + 1, sections[sections.length - 1].position.end.line);
    }
    return { searchValue: ref.link.original, replaceValue: content, isEmbed: true, embedType: "full note" /* FULL_NOTE */ };
  };
  const composePart = async (ref, position, name, type) => {
    if (!position) {
      logError(
        `Reference to nonexistent ${type}`,
        `On line ${ref.link.position.start.line}:
${name} to file ${ref.file.path}.
Reference was not changed`
      );
      return unchanged(ref);
    }
    return {
      searchValue: ref.link.original,
      replaceValue: await sliceLines(ref.file, position.start.line, position.end.line),
      isEmbed: true,
      embedType: type
    };
  };
  const parseNotePart = async (ref) => {
    const cache = app.metadataCache.getFileCache(ref.file);
    const blockId = ref.link.link.match(/[^#]#\^([^|]*)(?:\|.*)?/)?.[1];
    if (blockId !== void 0) {
      return composePart(ref, cache?.blocks?.[blockId]?.position, blockId, "block" /* BLOCK */);
    }
    const headingName = ref.link.link.match(/[^#]#([^|]*)(?:\|.*)?/)?.[1];
    const headings = cache?.headings;
    const sections = cache?.sections;
    const headingIndex = headings?.findIndex((h) => h.heading === headingName) ?? -1;
    if (headings && sections && headingName !== void 0) {
      if (headingIndex < 0) return composePart(ref, void 0, headingName, "heading" /* HEADING */);
      const heading = headings[headingIndex];
      const next = headings.slice(headingIndex + 1).find((h) => h.level === heading.level) ?? sections[sections.length - 1];
      return composePart(ref, { start: heading.position.start, end: next.position.end }, headingName, "heading" /* HEADING */);
    }
    logError(
      "Invalid Embed",
      `On line ${ref.link.position.start.line}.
Problems with identification of type of this embed: block or heading link
Reference was not changed`
    );
    return unchanged(ref);
  };
  return Promise.all(
    embeds.map(
      (embed) => /[^#]#[^|]*(?:\|.*)?/.test(embed.link.original) ? parseNotePart(embed) : parseWholeNote(embed)
    )
  );
};
var replaceReferences = (refs, text, isEmbed = false) => multiReplace(
  text,
  refs.map((r) => ({
    searchValue: r.link.original,
    replaceValue: `${isEmbed ? "!" : ""}[${r.link.displayText}](${encodeURI(r.file.path)})`,
    isEmbed
  }))
);
var multiReplace = (source, replacements) => replacements.reduce(
  (text, r) => text.replace(new RegExp(escapeRegExp(r.searchValue), "gu"), () => r.replaceValue),
  source
);
module.exports = module.exports.default;
