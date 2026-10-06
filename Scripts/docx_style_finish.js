/// @ts-check
// Шаг макроса «Export: DOC» после команды pandoc (пара к docx_style_begin.js).
// Ждёт, пока pandoc допишет файл во временную папку, переносит его в настоящую
// папку экспорта с суффиксом стиля и возвращает настройки плагина obsidian-pandoc.
// Настройки возвращаются в любом случае, даже если файл так и не появился.

const STASH = '__quickaddDocxStyle'
const TIMEOUT_MS = 180000
const POLL_MS = 400

// @ts-ignore
module.exports = async (params) => {
    const { app, obsidian } = params
    const fs = require('fs')
    const path = require('path')

    const s = window[STASH]
    if (!s) return // стиль не выбирался — делать нечего

    const pandoc = app.plugins.plugins['obsidian-pandoc']
    try {
        const out = path.join(s.tmpDir, s.outName)
        if (await waitForFile(fs, out, s.startedAt)) {
            const target = path.join(s.targetDir, s.outName.replace(/\.docx$/u, `${s.style.suffix}.docx`))
            fs.copyFileSync(out, target) // не rename: tmp и папка экспорта бывают на разных дисках
            new obsidian.Notice(`DOCX (${s.style.name}) сохранён:\n${target}`, 10000)
        } else {
            new obsidian.Notice(
                `Export: pandoc не создал файл за ${TIMEOUT_MS / 1000} с — смотрите уведомления плагина Pandoc`,
                15000
            )
        }
    } finally {
        if (pandoc) Object.assign(pandoc.settings, s.orig)
        delete window[STASH]
        try {
            fs.rmSync(s.tmpDir, { recursive: true, force: true })
        } catch (e) {
            console.error('docx_style_finish: не удалось удалить', s.tmpDir, e)
        }
    }
}

// Файл готов, когда он есть, свежее старта и его размер не меняется между опросами
const waitForFile = async (fs, file, startedAt) => {
    let lastSize = -1
    const deadline = Date.now() + TIMEOUT_MS
    while (Date.now() < deadline) {
        try {
            const st = fs.statSync(file)
            if (st.mtimeMs >= startedAt - 2000 && st.size > 0 && st.size === lastSize) return true
            lastSize = st.size
        } catch (e) {
            // ещё не создан
        }
        await new Promise((r) => setTimeout(r, POLL_MS))
    }
    return false
}
