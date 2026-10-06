/// @ts-check
// Последний шаг макроса «Export: DOC». Возвращает в заметку текст технической копии
// и удаляет копию. Содержимое переписывается в тот же файл (vault.modify), а не через
// delete + rename: файл не пересоздаётся, открытая вкладка остаётся на месте.
//
// Понимает оба вида маркера: <!-- TECH_COPY_PATH--… --> (make_tech_copy.js)
// и старый %%TECH_COPY_PATH--…%%.

const MARKER_RE = /(?:%%|<!--\s*)TECH_COPY_PATH--(.*?)(?:%%|\s*-->)/u

// @ts-ignore
module.exports = async (params) => {
    const { app, obsidian } = params
    const stop = (msg) => {
        new obsidian.Notice(msg, 15000)
        params.abort(msg)
    }

    const modFile = app.workspace.getActiveFile()
    if (!modFile) return stop('Restore: нет активной заметки')

    const match = (await app.vault.read(modFile)).match(MARKER_RE)
    if (!match) {
        return stop('Утеряна техническая копия заметки. Пожалуйста, посмотрите в корневой папке хранилища')
    }

    const techCopy = app.vault.getAbstractFileByPath(match[1].trim())
    if (!(techCopy instanceof obsidian.TFile)) {
        return stop(`Ошибка при получении доступа к технической копии «${match[1].trim()}»`)
    }

    await app.vault.modify(modFile, await app.vault.read(techCopy))
    await app.vault.delete(techCopy)
}
