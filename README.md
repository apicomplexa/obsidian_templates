# obsidian-kit

Код для хранилищ Obsidian: Dataview-представления, пользовательские скрипты QuickAdd, экспорт в DOCX через pandoc и шаблоны Templater, которые этим пользуются. Всё пишется на TypeScript в `src/`, собирается в `dist/`, а `dist/` коммитится, чтобы хранилище работало без сборки.

Кит подключается к хранилищу как git-подмодуль по пути `_.Settings/obsidian-kit`.

## Сборка

Окружение задаёт [pixi](https://pixi.sh): Node и pandoc зафиксированы в `pixi.toml` и `pixi.lock`, так что на Linux и Windows сборка одинаковая.

```sh
pixi run build       # npm ci (если нужно) + src/ → dist/
pixi run typecheck   # tsc --noEmit
```

После правок в `src/` пересоберите кит и закоммитьте `dist/` вместе с исходниками.

## Структура

| Исходник | Результат | Как подключается в хранилище |
|---|---|---|
| `src/dataviews/<name>/view.ts` | `dist/dataviews/<name>/view.js` | ` dv.view("_.Settings/obsidian-kit/dist/dataviews/<name>") ` в блоке `dataviewjs` |
| `src/quickadd/<name>.ts` | `dist/quickadd/<name>.js` | шаг «User Script» в макросе QuickAdd |
| `src/pandoc/` | `dist/pandoc/<style>.yaml`, `reference-<style>.docx` | `--defaults=…` для pandoc, подставляется `docx-style-begin` |
| `pandoc/docx-captions.lua` | `dist/pandoc/docx-captions.lua` | фильтр из `<style>.yaml` |
| `Templater/` | — | папка шаблонов Templater |

Общий код лежит в `src/dataviews/shared/` и `src/quickadd/lib/`, esbuild вклеивает его в каждый собранный файл. Типы глобалов (`dv`, параметры QuickAdd, непубличные части Obsidian API) описаны в `types/`.

### Dataview

Файл собирается в формате `iife`. `dv.view()` выполняет его как тело функции, в которой доступны `dv` и `input`.

- `indexPage` — индексная страница по полям frontmatter со значением `index`;
- `tagIndexPage` — страница по тегам текущей заметки;
- `tableIndex` — таблицы заметок по подиндексам.

### QuickAdd

Каждый скрипт собирается в CommonJS: `module.exports = async (params) => …`. В исходнике это `export default`.

Макрос «Export: DOC» выполняет шаги в таком порядке:

1. `make-tech-copy` — снимает техническую копию заметки;
2. `convert-links` — раскрывает встраивания и переводит ссылки в markdown;
3. `format-with-regexp` — заменяет callout'ы и чекбоксы на эмодзи;
4. `docx-style-begin` — спрашивает стиль и подменяет настройки плагина pandoc;
5. команда плагина pandoc;
6. `docx-style-finish` — переносит готовый docx и возвращает настройки плагина;
7. `restore-tech-copy` — возвращает исходный текст заметки.

### Стили DOCX

Стили перечислены в `src/pandoc/styles.ts`, их оформление описано в `src/pandoc/docx/<id>.ts`. Сборка берёт штатный `reference.docx` у pandoc и переписывает в нём стили, тему, параметры страницы и колонтитулы. Пути в сгенерированных yaml заданы через `${.}`, поэтому не зависят от машины. Правка `reference-*.docx` в Word бесполезна: при следующей сборке файл перезапишется.

Чтобы добавить стиль:

1. добавьте строку в `STYLES`;
2. создайте файл `src/pandoc/docx/<id>.ts`;
3. добавьте запись в `DOCX_CONFIGS` (`src/pandoc/build.ts`);
4. выполните `pixi run build`.

## Что остаётся в хранилище

Кит не хранит данные конкретного хранилища. В ObsiNotes они лежат в `_.Settings/Pandoc/`: общий `pandoc-defaults.yaml` (подключается в настройках плагина obsidian-pandoc), стили библиографии `.csl` и шаблон `article.tplx`.

Скрипты, которым нужна файловая система, ищут кит по пути `_.Settings/obsidian-kit` относительно корня хранилища. Эта константа `KIT_DIR` задана в `src/quickadd/lib/common.ts`.
