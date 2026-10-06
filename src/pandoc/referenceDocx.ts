// Берёт штатный reference.docx pandoc и переписывает в нём стили, тему, параметры страницы и колонтитулы.

import { strFromU8, strToU8, unzipSync, zipSync, type Zippable } from "fflate";
import type { DocxConfig } from "./ooxml";

// Фиксированная дата в zip-заголовках: одинаковый вход даёт побайтно одинаковый docx, без шума в git
const ZIP_MTIME = new Date("2000-01-01T00:00:00Z");

const FOOTER_XML =
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" ' +
  'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
  '<w:p><w:pPr><w:jc w:val="center"/></w:pPr>' +
  '<w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r>' +
  '<w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r>' +
  '<w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:fldChar w:fldCharType="separate"/></w:r>' +
  '<w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t>1</w:t></w:r>' +
  '<w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r>' +
  "</w:p></w:ftr>";

const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Заменяет единственное вхождение; иначе — ошибка (структура базового docx не та, что ожидалась). */
const replaceOnce = (xml: string, re: RegExp, replacement: string, what: string): string => {
  const count = xml.match(new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g"))?.length ?? 0;
  if (count !== 1) throw new Error(`${what}: ожидалось одно вхождение, найдено ${count}`);
  return xml.replace(re, () => replacement);
};

const patchStyles = (xml: string, cfg: DocxConfig): string => {
  const { font, size, color } = cfg;
  const defaults =
    "<w:docDefaults><w:rPrDefault><w:rPr>" +
    `<w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:eastAsia="${font}" w:cs="${font}"/>` +
    `<w:color w:val="${color}"/><w:sz w:val="${size}"/><w:szCs w:val="${size}"/>` +
    '<w:lang w:val="ru-RU" w:eastAsia="ru-RU" w:bidi="ar-SA"/>' +
    "</w:rPr></w:rPrDefault>" +
    '<w:pPrDefault><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr></w:pPrDefault>' +
    "</w:docDefaults>";
  xml = replaceOnce(xml, /<w:docDefaults>.*?<\/w:docDefaults>/s, defaults, "docDefaults");
  for (const [sid, style] of Object.entries(cfg.styles)) {
    const re = new RegExp(`<w:style\\b[^>]*w:styleId="${escapeRegExp(sid)}".*?</w:style>`, "s");
    xml = re.test(xml) ? xml.replace(re, () => style) : xml.replace("</w:styles>", () => style + "</w:styles>");
  }
  return xml;
};

// Всё, что ссылается на шрифты темы (asciiTheme=…), тоже получает нужный шрифт
const patchTheme = (xml: string, font: string): string =>
  xml.replace(/<a:(major|minor)Font>.*?<\/a:\1Font>/gs, (block) =>
    block.replace(/<a:latin typeface="[^"]*"/g, () => `<a:latin typeface="${font}"`)
  );

const patchDocument = (xml: string, cfg: DocxConfig): string => {
  const p = cfg.page;
  const footer = cfg.footer ? '<w:footerReference w:type="default" r:id="rIdStyleFooter1"/>' : "";
  const titlePg = cfg.footer ? "<w:titlePg/>" : ""; // без номера на титуле
  const sect =
    `<w:sectPr>${footer}` +
    '<w:footnotePr><w:numRestart w:val="eachSect"/></w:footnotePr>' +
    `<w:pgSz w:w="${p.w}" w:h="${p.h}"/>` +
    `<w:pgMar w:top="${p.top}" w:right="${p.right}" w:bottom="${p.bottom}" w:left="${p.left}" ` +
    `w:header="${p.header}" w:footer="${p.footer}" w:gutter="0"/>` +
    `<w:cols w:space="720"/>${titlePg}</w:sectPr>`;
  xml = replaceOnce(xml, /<w:sectPr>.*?<\/w:sectPr>/s, sect, "sectPr");
  if (!xml.slice(0, 2000).includes("xmlns:r=")) {
    xml = xml.replace(
      "<w:document ",
      '<w:document xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
    );
  }
  return xml;
};

const patchSettings = (xml: string, cfg: DocxConfig): string => {
  xml = xml.replace(/<w:updateFields[^>]*\/>/g, "");
  if (cfg.updateFields) {
    // По схеме CT_Settings элемент стоит перед footnotePr/compat
    const tag = '<w:updateFields w:val="true"/>';
    const m = /<w:(hdrShapeDefaults|footnotePr|endnotePr|compat|docVars|rsids|m:mathPr|themeFontLang)\b/.exec(xml);
    xml = m ? xml.slice(0, m.index) + tag + xml.slice(m.index) : xml.replace("</w:settings>", tag + "</w:settings>");
  }
  return xml;
};

export const buildReferenceDocx = (base: Uint8Array, cfg: DocxConfig): Uint8Array => {
  const patchers: Record<string, (xml: string) => string> = {
    "word/styles.xml": (x) => patchStyles(x, cfg),
    "word/theme/theme1.xml": (x) => patchTheme(x, cfg.font),
    "word/document.xml": (x) => patchDocument(x, cfg),
    "word/settings.xml": (x) => patchSettings(x, cfg),
  };
  if (cfg.footer) {
    patchers["word/_rels/document.xml.rels"] = (x) =>
      x.replace(
        "</Relationships>",
        '<Relationship Id="rIdStyleFooter1" ' +
          'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" ' +
          'Target="footer1.xml"/></Relationships>'
      );
    patchers["[Content_Types].xml"] = (x) =>
      x.replace(
        "</Types>",
        '<Override PartName="/word/footer1.xml" ' +
          'ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>' +
          "</Types>"
      );
  }

  const out: Zippable = {};
  for (const [name, data] of Object.entries(unzipSync(base))) {
    const patch = patchers[name];
    out[name] = [patch ? strToU8(patch(strFromU8(data))) : data, { mtime: ZIP_MTIME }];
  }
  if (cfg.footer) out["word/footer1.xml"] = [strToU8(FOOTER_XML), { mtime: ZIP_MTIME }];
  return zipSync(out, { level: 6 });
};
