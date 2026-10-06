// Генерация стилей экспорта DOCX: для каждого стиля из styles.ts — reference-<id>.docx и <id>.yaml.
// Вызывается из build.mjs; базовый reference.docx берётся у pandoc из PATH (в pixi-окружении — закреплённый).

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { mobile } from "./docx/mobile";
import { official } from "./docx/official";
import type { DocxConfig } from "./ooxml";
import { buildReferenceDocx } from "./referenceDocx";
import { STYLES, type PandocStyle } from "./styles";

const DOCX_CONFIGS: Record<string, () => DocxConfig> = { official, mobile };

// ${.} — папка самого defaults-файла: пути не зависят от машины и расположения хранилища
const defaultsYaml = (style: PandocStyle): string => {
  const lines = [
    `# Стиль экспорта «${style.name}» — подключается макросом «Export: DOC» (docx-style-begin)`,
    "# поверх pandoc-defaults.yaml хранилища. Собрано obsidian-kit из src/pandoc — не править.",
    `reference-doc: \${.}/reference-${style.id}.docx`,
    "filters:",
    "  - ${.}/docx-captions.lua",
  ];
  if (style.metadata) {
    lines.push("metadata:");
    for (const [key, value] of Object.entries(style.metadata)) lines.push(`  ${key}: ${JSON.stringify(value)}`);
  }
  return lines.join("\n") + "\n";
};

export const buildPandocStyles = (outDir: string): string[] => {
  let base: Uint8Array;
  try {
    base = execFileSync("pandoc", ["--print-default-data-file", "reference.docx"]);
  } catch (e) {
    throw new Error(`не удалось получить reference.docx от pandoc (запускать через \`pixi run build\`): ${e}`);
  }
  return STYLES.map((style) => {
    const config = DOCX_CONFIGS[style.id];
    if (!config) throw new Error(`для стиля «${style.id}» нет оформления в src/pandoc/docx/`);
    fs.writeFileSync(path.join(outDir, `reference-${style.id}.docx`), buildReferenceDocx(base, config()));
    fs.writeFileSync(path.join(outDir, `${style.id}.yaml`), defaultsYaml(style));
    return style.id;
  });
};
