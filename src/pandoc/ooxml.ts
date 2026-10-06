// Генераторы фрагментов WordprocessingML для styles.xml.
// Единицы: размеры шрифта в половинах пункта (24 = 12 pt), отступы и поля в twips (567 = 1 см, 20 twips = 1 pt).

export const CM = 567; // twips в сантиметре

/** Сантиметры → twips. Округление к чётному, как round() в Python, на котором генератор был написан изначально. */
export const cm = (value: number): number => {
  const x = value * CM;
  const floor = Math.floor(x);
  const diff = x - floor;
  if (diff > 0.5) return floor + 1;
  if (diff < 0.5) return floor;
  return floor % 2 === 0 ? floor : floor + 1;
};

export interface RunProps {
  font?: string;
  sz?: number;
  b?: boolean;
  i?: boolean;
  color?: string;
  u?: string;
  caps?: boolean;
}

export const rpr = ({ font, sz, b, i, color, u, caps = false }: RunProps = {}): string => {
  let x = "";
  if (font) x += `<w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:eastAsia="${font}" w:cs="${font}"/>`;
  if (b !== undefined) x += b ? "<w:b/><w:bCs/>" : '<w:b w:val="0"/><w:bCs w:val="0"/>';
  if (i !== undefined) x += i ? "<w:i/><w:iCs/>" : '<w:i w:val="0"/><w:iCs w:val="0"/>';
  if (caps) x += "<w:caps/>";
  if (color) x += `<w:color w:val="${color}"/>`;
  if (sz) x += `<w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/>`;
  if (u !== undefined) x += `<w:u w:val="${u}"/>`;
  return x ? `<w:rPr>${x}</w:rPr>` : "";
};

export interface ParaProps {
  before?: number;
  after?: number;
  line?: number;
  first?: number;
  left?: number;
  hanging?: number;
  jc?: "left" | "center" | "right" | "both";
  keepNext?: boolean;
  keepLines?: boolean;
  pageBreak?: boolean;
  outline?: number;
  border?: string;
  shade?: string;
  widow?: boolean;
}

export const ppr = ({
  before,
  after,
  line,
  first,
  left,
  hanging,
  jc,
  keepNext = false,
  keepLines = false,
  pageBreak = false,
  outline,
  border,
  shade,
  widow = true,
}: ParaProps = {}): string => {
  let x = "";
  if (keepNext) x += "<w:keepNext/>";
  if (keepLines) x += "<w:keepLines/>";
  if (pageBreak) x += "<w:pageBreakBefore/>";
  if (widow) x += "<w:widowControl/>";
  if (border) x += `<w:pBdr>${border}</w:pBdr>`;
  if (shade) x += `<w:shd w:val="clear" w:color="auto" w:fill="${shade}"/>`;

  let sp = "";
  if (before !== undefined) sp += ` w:before="${before}"`;
  if (after !== undefined) sp += ` w:after="${after}"`;
  if (line !== undefined) sp += ` w:line="${line}" w:lineRule="auto"`;
  if (sp) x += `<w:spacing${sp}/>`;

  let ind = "";
  if (left !== undefined) ind += ` w:left="${left}"`;
  if (first !== undefined) ind += ` w:firstLine="${first}"`;
  if (hanging !== undefined) ind += ` w:hanging="${hanging}"`;
  if (ind) x += `<w:ind${ind}/>`;

  if (jc) x += `<w:jc w:val="${jc}"/>`;
  if (outline !== undefined) x += `<w:outlineLvl w:val="${outline}"/>`;
  return x ? `<w:pPr>${x}</w:pPr>` : "";
};

export interface ParaStyleOptions {
  /** Родительский стиль; null — без basedOn. По умолчанию Normal. */
  based?: string | null;
  next?: string;
  p?: string;
  r?: string;
  custom?: boolean;
  isDefault?: boolean;
}

export const pstyle = (
  sid: string,
  name: string,
  { based = "Normal", next, p = "", r = "", custom = false, isDefault = false }: ParaStyleOptions = {}
): string => {
  let attrs = `w:type="paragraph" w:styleId="${sid}"`;
  if (isDefault) attrs += ' w:default="1"';
  if (custom) attrs += ' w:customStyle="1"';
  let x = `<w:style ${attrs}><w:name w:val="${name}"/>`;
  if (based) x += `<w:basedOn w:val="${based}"/>`;
  if (next) x += `<w:next w:val="${next}"/>`;
  if (sid.startsWith("TOC")) x += '<w:uiPriority w:val="39"/><w:unhideWhenUsed/>';
  return `${x}<w:qFormat/>${p}${r}</w:style>`;
};

export const cstyle = (sid: string, name: string, r = ""): string =>
  `<w:style w:type="character" w:styleId="${sid}"><w:name w:val="${name}"/>` +
  `<w:basedOn w:val="DefaultParagraphFont"/>${r}</w:style>`;

export const borders = (
  color: string,
  sz = 4,
  tag = "tblBorders",
  sides = ["top", "left", "bottom", "right", "insideH", "insideV"]
): string => {
  const inner = sides.map((s) => `<w:${s} w:val="single" w:sz="${sz}" w:space="0" w:color="${color}"/>`).join("");
  return `<w:${tag}>${inner}</w:${tag}>`;
};

export interface TableStyleOptions {
  borderColor: string;
  cellV: number;
  cellH: number;
  sz: number;
  headFill: string;
  headColor?: string;
  line?: number;
}

export const tstyle = ({ borderColor, cellV, cellH, sz, headFill, headColor, line }: TableStyleOptions): string => {
  const headR = rpr({ b: true, color: headColor });
  const cellP = line ? ppr({ before: 0, after: 0, line, first: 0, jc: "left" }) : "";
  return (
    '<w:style w:type="table" w:default="1" w:styleId="Table"><w:name w:val="Table"/>' +
    '<w:basedOn w:val="TableNormal"/><w:qFormat/>' +
    `${cellP}${rpr({ sz })}` +
    '<w:tblPr><w:tblInd w:w="0" w:type="dxa"/>' +
    borders(borderColor) +
    `<w:tblCellMar><w:top w:w="${cellV}" w:type="dxa"/><w:left w:w="${cellH}" w:type="dxa"/>` +
    `<w:bottom w:w="${cellV}" w:type="dxa"/><w:right w:w="${cellH}" w:type="dxa"/></w:tblCellMar>` +
    "</w:tblPr>" +
    '<w:tblStylePr w:type="firstRow">' +
    '<w:pPr><w:keepNext/><w:jc w:val="center"/></w:pPr>' +
    headR +
    "<w:tblPr/><w:trPr><w:tblHeader/></w:trPr>" +
    `<w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="${headFill}"/><w:vAlign w:val="center"/></w:tcPr>` +
    "</w:tblStylePr></w:style>"
  );
};

/** Оформление reference.docx одного стиля экспорта. */
export interface DocxConfig {
  font: string;
  /** Кегль по умолчанию, в половинах пункта. */
  size: number;
  color: string;
  /** styleId → полный элемент <w:style>; существующие в базовом reference.docx заменяются, новые дописываются. */
  styles: Record<string, string>;
  page: { w: number; h: number; top: number; bottom: number; left: number; right: number; header: number; footer: number };
  /** Номер страницы внизу по центру (кроме титула). */
  footer: boolean;
  /** Word при открытии предложит обновить поля — оглавление заполнится само. */
  updateFields: boolean;
}
