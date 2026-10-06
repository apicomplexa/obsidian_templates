// Параметры, которые QuickAdd передаёт пользовательскому скрипту (module.exports = async (params) => …).

declare interface QuickAddApi {
  suggester<T>(displayItems: string[] | ((value: T) => string), actualItems: T[]): Promise<T | undefined>;
  inputPrompt(header: string, placeholder?: string, value?: string): Promise<string | undefined>;
}

declare interface QuickAddParams {
  app: import("obsidian").App;
  obsidian: typeof import("obsidian");
  quickAddApi: QuickAddApi;
  variables: Record<string, unknown>;
  /** Прерывает макрос: последующие шаги не выполняются. */
  abort(message?: string): never;
}
