// «Для телефона»: узкая страница, Arial, без разрывов страниц и нумерации, акцентный цвет в заголовках.

import { cm, cstyle, ppr, pstyle, rpr, tstyle, type DocxConfig } from "../ooxml";

const ACC = "1F4E5F"; // акцентный цвет: заголовки, подписи

export const mobile = (): DocxConfig => {
  const s: Record<string, string> = {
    Normal: pstyle("Normal", "Normal", { based: null, isDefault: true }),
    BodyText: pstyle("BodyText", "Body Text", { p: ppr({ before: 0, after: 140, line: 276, first: 0, jc: "left" }) }),
    FirstParagraph: pstyle("FirstParagraph", "First Paragraph", { based: "BodyText", next: "BodyText" }),
    Compact: pstyle("Compact", "Compact", {
      custom: true,
      p: ppr({ before: 0, after: 60, line: 252, first: 0, jc: "left" }),
    }),
    Title: pstyle("Title", "Title", {
      next: "Subtitle",
      p: ppr({ before: 0, after: 120, line: 240, jc: "left" }),
      r: rpr({ b: true, sz: 32, color: ACC }),
    }),
    Subtitle: pstyle("Subtitle", "Subtitle", {
      next: "Author",
      p: ppr({ before: 0, after: 200, line: 252, jc: "left" }),
      r: rpr({ sz: 23, color: "444444" }),
    }),
    Author: pstyle("Author", "Author", {
      custom: true,
      p: ppr({ before: 0, after: 20, jc: "left" }),
      r: rpr({ i: true, sz: 19, color: "555555" }),
    }),
    Date: pstyle("Date", "Date", {
      custom: true,
      p: ppr({
        before: 60,
        after: 200,
        jc: "left",
        border: `<w:bottom w:val="single" w:sz="6" w:space="8" w:color="${ACC}"/>`,
      }),
      r: rpr({ sz: 19, color: "555555" }),
    }),
    Heading1: pstyle("Heading1", "heading 1", {
      next: "BodyText",
      p: ppr({
        before: 440,
        after: 160,
        line: 240,
        keepNext: true,
        keepLines: true,
        outline: 0,
        border: `<w:bottom w:val="single" w:sz="6" w:space="3" w:color="${ACC}"/>`,
      }),
      r: rpr({ b: true, sz: 28, color: ACC }),
    }),
    Heading2: pstyle("Heading2", "heading 2", {
      next: "BodyText",
      p: ppr({ before: 300, after: 100, line: 240, keepNext: true, keepLines: true, outline: 1 }),
      r: rpr({ b: true, sz: 24, color: ACC }),
    }),
    Heading3: pstyle("Heading3", "heading 3", {
      next: "BodyText",
      p: ppr({ before: 200, after: 80, line: 240, keepNext: true, keepLines: true, outline: 2 }),
      r: rpr({ b: true, sz: 22, color: "333333" }),
    }),
  };
  for (const n of [4, 5, 6]) {
    s[`Heading${n}`] = pstyle(`Heading${n}`, `heading ${n}`, {
      next: "BodyText",
      p: ppr({ before: 160, after: 60, keepNext: true, outline: n - 1 }),
      r: rpr({ b: true, i: true, sz: 22, color: "333333" }),
    });
  }
  Object.assign(s, {
    TOCHeading: pstyle("TOCHeading", "TOC Heading", { based: "Heading1", next: "BodyText", p: ppr({ outline: 9 }) }),
    TOC1: pstyle("TOC1", "toc 1", { next: "Normal", p: ppr({ before: 60, after: 20 }) }),
    TOC2: pstyle("TOC2", "toc 2", { next: "Normal", p: ppr({ before: 0, after: 0, left: 200 }) }),
    BlockText: pstyle("BlockText", "Block Text", {
      based: "BodyText",
      p: ppr({
        left: 170,
        first: 0,
        before: 60,
        after: 120,
        shade: "F1F5F7",
        border: '<w:left w:val="single" w:sz="18" w:space="6" w:color="9DB9C4"/>',
      }),
      r: rpr({ sz: 21 }),
    }),
    FootnoteText: pstyle("FootnoteText", "footnote text", { p: ppr({ after: 0, line: 240 }), r: rpr({ sz: 18 }) }),
    TableCaption: pstyle("TableCaption", "Table Caption", {
      custom: true,
      p: ppr({ before: 200, after: 80, line: 240, first: 0, jc: "left", keepNext: true }),
      r: rpr({ sz: 20, color: ACC }),
    }),
    ImageCaption: pstyle("ImageCaption", "Image Caption", {
      custom: true,
      p: ppr({ before: 60, after: 200, line: 240, first: 0, jc: "center" }),
      r: rpr({ i: true, sz: 18, color: "555555" }),
    }),
    Figure: pstyle("Figure", "Figure", {
      custom: true,
      p: ppr({ before: 120, after: 0, line: 240, first: 0, jc: "center", keepNext: true }),
    }),
    CaptionedFigure: pstyle("CaptionedFigure", "Captioned Figure", { based: "Figure", custom: true }),
    Bibliography: pstyle("Bibliography", "Bibliography", {
      next: "Bibliography",
      p: ppr({ before: 0, after: 100, line: 252 }),
      r: rpr({ sz: 19 }),
    }),
    Table: tstyle({ borderColor: "BFBFBF", cellV: 50, cellH: 70, sz: 18, headFill: "DCE8EC", headColor: ACC }),
    Hyperlink: cstyle("Hyperlink", "Hyperlink", rpr({ color: "1F6F8B", u: "single" })),
    VerbatimChar: cstyle("VerbatimChar", "Verbatim Char", rpr({ font: "Courier New", sz: 19 })),
  });
  return {
    font: "Arial",
    size: 22,
    color: "1A1A1A",
    styles: s,
    // 9,5 × 19 см — ширина колонки ≈ 8 см, ~35–40 знаков в строке на экране телефона
    page: { w: cm(9.5), h: cm(19), top: cm(0.8), bottom: cm(0.8), left: cm(0.7), right: cm(0.7), header: 284, footer: 284 },
    footer: false,
    updateFields: false,
  };
};
