// Сборка obsidian-kit: src/ → dist/. Запуск: `pixi run build` (или `npm run build` при node и pandoc в PATH).
//
//   src/dataviews/<name>/view.ts → dist/dataviews/<name>/view.js   (+ view.css)   для dv.view(".../<name>")
//   src/quickadd/<name>.ts       → dist/quickadd/<name>.js                        пользовательские скрипты QuickAdd
//   src/pandoc/build.ts          → dist/pandoc/{<style>.yaml, reference-<style>.docx}, docx-captions.lua

import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(ROOT, "src");
const DIST = path.join(ROOT, "dist");
const CACHE = path.join(ROOT, "node_modules", ".cache", "obsidian-kit");

const banner = (src) => `// Собрано obsidian-kit из ${src} — не править, правки вносить в исходник.`;

const common = {
  bundle: true,
  target: "es2022",
  charset: "utf8",
  legalComments: "none",
  logLevel: "warning",
};

const listDirs = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);

async function buildDataviews() {
  const dir = path.join(SRC, "dataviews");
  for (const name of listDirs(dir)) {
    const entry = path.join(dir, name, "view.ts");
    if (!fs.existsSync(entry)) continue; // shared/ и прочие библиотеки
    const outDir = path.join(DIST, "dataviews", name);
    await build({
      ...common,
      entryPoints: [entry],
      outfile: path.join(outDir, "view.js"),
      // dv.view() исполняет файл как тело функции с dv и input в области видимости
      format: "iife",
      platform: "browser",
      banner: { js: banner(`src/dataviews/${name}/view.ts`) },
    });
    const css = path.join(dir, name, "view.css");
    if (fs.existsSync(css)) fs.copyFileSync(css, path.join(outDir, "view.css"));
    console.log(`dataview  ${name}`);
  }
}

async function buildQuickAdd() {
  const dir = path.join(SRC, "quickadd");
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".ts"))) {
    const name = path.basename(file, ".ts");
    await build({
      ...common,
      entryPoints: [path.join(dir, file)],
      outfile: path.join(DIST, "quickadd", `${name}.js`),
      // QuickAdd исполняет скрипт с require/module/exports и ждёт функцию в module.exports
      format: "cjs",
      platform: "node",
      banner: { js: banner(`src/quickadd/${file}`) },
      footer: { js: "module.exports = module.exports.default;" },
    });
    console.log(`quickadd  ${name}`);
  }
}

async function buildPandoc() {
  const outfile = path.join(CACHE, "pandoc-build.mjs");
  await build({
    ...common,
    entryPoints: [path.join(SRC, "pandoc", "build.ts")],
    outfile,
    format: "esm",
    platform: "node",
    packages: "external",
  });
  const { buildPandocStyles } = await import(`${pathToFileURL(outfile).href}?t=${Date.now()}`);
  const outDir = path.join(DIST, "pandoc");
  fs.mkdirSync(outDir, { recursive: true });
  fs.copyFileSync(path.join(ROOT, "pandoc", "docx-captions.lua"), path.join(outDir, "docx-captions.lua"));
  for (const id of buildPandocStyles(outDir)) console.log(`pandoc    ${id}`);
}

fs.rmSync(DIST, { recursive: true, force: true });
await buildDataviews();
await buildQuickAdd();
await buildPandoc();
console.log("obsidian-kit: сборка завершена");
