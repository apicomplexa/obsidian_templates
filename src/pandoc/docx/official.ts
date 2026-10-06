// «Официальный»: Times New Roman 12, A4, поля 2/1/1,5/1,5 см, каждый раздел первого уровня с новой страницы.

import { cm, cstyle, ppr, pstyle, rpr, tstyle, type DocxConfig, type ParaProps } from "../ooxml";

export const official = (): DocxConfig => {
  const body: ParaProps = { before: 0, after: 120, line: 276, first: 425, jc: "both" };
  const s: Record<string, string> = {
    Normal: pstyle("Normal", "Normal", { based: null, isDefault: true }),
    BodyText: pstyle("BodyText", "Body Text", { p: ppr(body) }),
    FirstParagraph: pstyle("FirstParagraph", "First Paragraph", { based: "BodyText", next: "BodyText" }),
    // Compact — пункты тесных списков и текст в ячейках таблиц
    Compact: pstyle("Compact", "Compact", {
      custom: true,
      p: ppr({ before: 0, after: 60, line: 264, first: 0, jc: "left" }),
    }),
    Title: pstyle("Title", "Title", {
      next: "Subtitle",
      p: ppr({ before: 3400, after: 240, line: 240, jc: "center", keepNext: true }),
      r: rpr({ b: true, sz: 40, color: "000000" }),
    }),
    Subtitle: pstyle("Subtitle", "Subtitle", {
      next: "Author",
      p: ppr({ before: 0, after: 900, jc: "center", keepNext: true }),
      r: rpr({ sz: 28 }),
    }),
    Author: pstyle("Author", "Author", {
      custom: true,
      p: ppr({ before: 0, after: 120, jc: "center", keepNext: true }),
      r: rpr({ i: true, sz: 26 }),
    }),
    Date: pstyle("Date", "Date", { custom: true, p: ppr({ before: 2400, after: 0, jc: "center" }), r: rpr({ sz: 24 }) }),
    Heading1: pstyle("Heading1", "heading 1", {
      next: "BodyText",
      p: ppr({ before: 0, after: 240, line: 240, jc: "left", keepNext: true, keepLines: true, pageBreak: true, outline: 0 }),
      r: rpr({ b: true, sz: 30, color: "000000" }),
    }),
    Heading2: pstyle("Heading2", "heading 2", {
      next: "BodyText",
      p: ppr({ before: 260, after: 140, line: 240, keepNext: true, keepLines: true, outline: 1 }),
      r: rpr({ b: true, sz: 26, color: "000000" }),
    }),
    Heading3: pstyle("Heading3", "heading 3", {
      next: "BodyText",
      p: ppr({ before: 200, after: 80, line: 240, keepNext: true, keepLines: true, outline: 2 }),
      r: rpr({ b: true, i: true, sz: 24, color: "000000" }),
    }),
  };
  for (const n of [4, 5, 6]) {
    s[`Heading${n}`] = pstyle(`Heading${n}`, `heading ${n}`, {
      next: "BodyText",
      p: ppr({ before: 160, after: 60, keepNext: true, outline: n - 1 }),
      r: rpr({ i: true, sz: 24, color: "000000" }),
    });
  }
  Object.assign(s, {
    TOCHeading: pstyle("TOCHeading", "TOC Heading", {
      based: "Heading1",
      next: "BodyText",
      p: ppr({ outline: 9 }),
      r: rpr({ b: true, color: "000000" }),
    }),
    TOC1: pstyle("TOC1", "toc 1", { next: "Normal", p: ppr({ before: 60, after: 40 }) }),
    TOC2: pstyle("TOC2", "toc 2", { next: "Normal", p: ppr({ before: 0, after: 20, left: 280 }) }),
    TOC3: pstyle("TOC3", "toc 3", { next: "Normal", p: ppr({ before: 0, after: 0, left: 560 }) }),
    BlockText: pstyle("BlockText", "Block Text", {
      based: "BodyText",
      p: ppr({ left: 567, first: 0, before: 60, after: 120 }),
      r: rpr({ sz: 22 }),
    }),
    FootnoteText: pstyle("FootnoteText", "footnote text", {
      p: ppr({ after: 0, line: 240, jc: "both" }),
      r: rpr({ sz: 20 }),
    }),
    TableCaption: pstyle("TableCaption", "Table Caption", {
      custom: true,
      p: ppr({ before: 200, after: 80, line: 240, first: 0, jc: "left", keepNext: true }),
      r: rpr({ sz: 22 }),
    }),
    ImageCaption: pstyle("ImageCaption", "Image Caption", {
      custom: true,
      p: ppr({ before: 80, after: 240, line: 240, first: 0, jc: "center" }),
      r: rpr({ i: true, sz: 20 }),
    }),
    Figure: pstyle("Figure", "Figure", {
      custom: true,
      p: ppr({ before: 120, after: 0, line: 240, first: 0, jc: "center", keepNext: true }),
    }),
    CaptionedFigure: pstyle("CaptionedFigure", "Captioned Figure", { based: "Figure", custom: true }),
    Bibliography: pstyle("Bibliography", "Bibliography", {
      next: "Bibliography",
      p: ppr({ before: 0, after: 80, line: 264, jc: "both" }),
    }),
    Table: tstyle({ borderColor: "000000", cellV: 40, cellH: 85, sz: 20, headFill: "E8E8E8" }),
    Hyperlink: cstyle("Hyperlink", "Hyperlink", rpr({ color: "000000" })),
    VerbatimChar: cstyle("VerbatimChar", "Verbatim Char", rpr({ font: "Courier New", sz: 20 })),
  });
  return {
    font: "Times New Roman",
    size: 24,
    color: "000000",
    styles: s,
    page: { w: 11906, h: 16838, top: cm(1.5), bottom: cm(1.5), left: cm(2), right: cm(1), header: 425, footer: 425 },
    footer: true,
    updateFields: true,
  };
};
