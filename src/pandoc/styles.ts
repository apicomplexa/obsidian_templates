// Стили экспорта DOCX (макрос QuickAdd «Export: DOC»). Каждый стиль собирается в
// dist/pandoc/<id>.yaml + reference-<id>.docx; оформление — в docx/<id>.ts.
// Новый стиль: строка здесь + файл docx/<id>.ts + запись в DOCX_CONFIGS (build.ts), затем `pixi run build`.

export interface PandocStyle {
  id: string;
  /** Строка в меню выбора стиля. */
  label: string;
  /** Как стиль называется в уведомлениях. */
  name: string;
  /** Добавляется к имени файла: «Заметка<suffix>.docx». */
  suffix: string;
  /** Метаданные pandoc, которые стиль навязывает поверх frontmatter заметки. */
  metadata?: Record<string, string | boolean>;
  /** Комментарий в шапке yaml. */
  comment?: string;
}

export const STYLES: PandocStyle[] = [
  {
    id: "official",
    label: "📄 Официальный — A4, Times New Roman 12, разделы с новой страницы, оглавление",
    name: "официальный",
    suffix: "",
  },
  {
    id: "mobile",
    label: "📱 Для телефона — узкая страница, Arial, без разрывов и оглавления",
    name: "для телефона",
    suffix: " (телефон)",
    // Оглавление-поле на телефоне не обновить (нет F9); навигация по заголовкам
    // в мобильном Word есть и без него. Значение из defaults перекрывает toc во frontmatter.
    metadata: { toc: false },
  },
];
