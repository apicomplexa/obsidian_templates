// Непубличные части Obsidian API, которыми пользуются скрипты.
import "obsidian";

declare module "obsidian" {
  interface App {
    plugins: { plugins: Record<string, unknown> };
  }
  interface DataAdapter {
    getBasePath(): string;
  }
}
