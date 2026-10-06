/// @ts-check
// Первый шаг макроса «Export: DOC»: спрашивает стиль оформления DOCX и на время
// экспорта подменяет настройки плагина obsidian-pandoc (только в памяти, без сохранения):
//   • extraArguments += --defaults=_.Settings/Pandoc/<стиль>.yaml
//   • outputFolder    = временная папка — плагин всегда называет файл по имени заметки,
//     и без этого стили перезаписывали бы друг друга. Готовый файл переносит
//     в настоящую папку под нужным именем docx_style_finish.js.
// Отмена выбора прерывает макрос до того, как заметка тронута.
//
// Новый стиль: положить <имя>.yaml (+ reference-<имя>.docx) в _.Settings/Pandoc/
// и добавить строку в STYLES.

const STYLES = [
    {
        label: '📄 Официальный — A4, Times New Roman 12, разделы с новой страницы, оглавление',
        name: 'официальный',
        file: 'official.yaml',
        suffix: '',
    },
    {
        label: '📱 Для телефона — узкая страница, Arial, без разрывов и оглавления',
        name: 'для телефона',
        file: 'mobile.yaml',
        suffix: ' (телефон)',
    },
]

const STASH = '__quickaddDocxStyle'
const STYLE_ARG_RE = /^--defaults=.*[\\/]_\.Settings[\\/]Pandoc[\\/][^\\/]+\.yaml$/u

// @ts-ignore
module.exports = async (params) => {
    const { app, quickAddApi, obsidian } = params
    const fs = require('fs')
    const path = require('path')
    const os = require('os')
    const stop = (msg) => {
        new obsidian.Notice(msg, 15000)
        params.abort(msg)
    }

    const pandoc = app.plugins.plugins['obsidian-pandoc']
    if (!pandoc) return stop('Export: плагин Pandoc не включён')
    const file = app.workspace.getActiveFile()
    if (!file) return stop('Export: нет активной заметки')

    // Хвост прошлого оборванного запуска: вернуть настройки плагина
    const stale = window[STASH]
    if (stale) {
        Object.assign(pandoc.settings, stale.orig)
        delete window[STASH]
    }

    const style = await quickAddApi.suggester(STYLES.map((s) => s.label), STYLES)
    if (!style) return stop('Export: стиль не выбран')

    const base = app.vault.adapter.getBasePath()
    const yaml = path.join(base, '_.Settings', 'Pandoc', style.file)
    if (!fs.existsSync(yaml)) return stop(`Export: нет файла стиля ${yaml}`)
    // плагин режет extraArguments по пробелам
    if (/\s/u.test(yaml)) return stop(`Export: в пути к стилю есть пробел — плагин Pandoc его не передаст: ${yaml}`)

    const cleanArgs = (pandoc.settings.extraArguments || '')
        .split('\n')
        .filter((l) => !STYLE_ARG_RE.test(l.trim()))
        .join('\n')
    const orig = { extraArguments: cleanArgs, outputFolder: pandoc.settings.outputFolder }
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'obsidian-docx-'))

    window[STASH] = {
        orig,
        style,
        tmpDir,
        startedAt: Date.now(),
        outName: `${file.basename}.docx`,
        targetDir: orig.outputFolder || path.dirname(path.join(base, file.path)),
    }
    pandoc.settings.extraArguments = `${cleanArgs}\n--defaults=${yaml}`
    pandoc.settings.outputFolder = tmpDir
}
