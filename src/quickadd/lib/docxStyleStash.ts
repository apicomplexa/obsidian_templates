// Состояние между docx-style-begin и docx-style-finish: шаги макроса — отдельные скрипты,
// поэтому выбранный стиль и исходные настройки плагина pandoc живут в window.

import type { PandocStyle } from "../../pandoc/styles";

export interface PandocPluginSettings {
  extraArguments: string;
  outputFolder: string | null;
}

export interface PandocPlugin {
  settings: PandocPluginSettings;
}

export interface DocxStyleStash {
  orig: PandocPluginSettings;
  style: PandocStyle;
  tmpDir: string;
  startedAt: number;
  outName: string;
  targetDir: string;
}

declare global {
  interface Window {
    __quickaddDocxStyle?: DocxStyleStash;
  }
}

export const getPandocPlugin = (params: QuickAddParams): PandocPlugin | undefined =>
  params.app.plugins.plugins["obsidian-pandoc"] as PandocPlugin | undefined;
