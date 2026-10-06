// Та часть API Dataview, которой пользуются наши views. Пакет obsidian-dataview
// не подключаем: он тянет obsidian и codemirror через git-зависимости.

declare interface DataviewApi {
  current(): Note;
  page(path: string): Note | undefined;
  pages(query?: string): DataArray<Note>;

  header(level: number, text: string): void;
  paragraph(text: string): void;
  list(items: DataArray<unknown> | unknown[]): void;
  table(headers: string[], rows: DataArray<unknown[]> | unknown[][]): void;
}
