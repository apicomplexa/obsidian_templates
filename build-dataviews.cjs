const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const SRC_ROOT = path.join(__dirname, "dataviews");
const DIST_ROOT = path.join(__dirname, "dist", "dataviews");

if (!fs.existsSync(DIST_ROOT)) fs.mkdirSync(DIST_ROOT, { recursive: true });

const folders = fs.readdirSync(SRC_ROOT, { withFileTypes: true })
  .filter(f => f.isDirectory())
  .map(f => f.name);

folders.forEach(folder => {
  const srcFolder = path.join(SRC_ROOT, folder);
  const distFolder = path.join(DIST_ROOT, folder);

  if (!fs.existsSync(distFolder)) fs.mkdirSync(distFolder, { recursive: true });

  const tsconfig = path.join(srcFolder, "tsconfig.json");
  if (!fs.existsSync(tsconfig)) {
    console.warn(`Пропущена папка ${folder}: tsconfig.json не найден`);
    return;
  }

  const outFile = path.join(distFolder, "view.js");

  const cmd = `tsc --project "${tsconfig}" --outFile "${outFile}"`;
  console.log(`Сборка ${folder}: ${cmd}`);
  execSync(cmd, { stdio: "inherit" });

  // Копируем CSS
  const cssFile = path.join(srcFolder, "view.css");
  if (fs.existsSync(cssFile)) {
    fs.copyFileSync(cssFile, path.join(distFolder, "view.css"));
  }
});

console.log("Сборка dataviews завершена.");
