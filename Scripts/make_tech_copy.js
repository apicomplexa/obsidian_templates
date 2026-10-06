/// @ts-check
// Первый шаг макроса «Export: DOC». Снимает техническую копию с ИСХОДНОЙ заметки —
// до того как convertLinks.js раскроет встроенные ссылки и format_with_regexp.js
// заменит синтаксис. Раньше копию снимал format_with_regexp.js, то есть уже после
// раскрытия, и restore_from_tech_copy.js «возвращал» раскрытый текст.
//
// В конец рабочей заметки дописывается маркер-комментарий с путём к копии.
// HTML-комментарий, а не %%…%%: pandoc в режиме markdown выбрасывает его из DOCX,
// а %%…%% попадал бы в документ обычным текстом.

const MARKER_RE = /(?:%%|<!--\s*)TECH_COPY_PATH--(.*?)(?:%%|\s*-->)/u

// @ts-ignore
module.exports = async (params) => {
    const { app, obsidian } = params
    const stop = (msg) => {
        new obsidian.Notice(msg, 15000)
        params.abort(msg)
    }

    const file = app.workspace.getActiveFile()
    if (!file) return stop('Export: нет активной заметки')

    let content = await app.vault.read(file)
    const techCopyPath = `TECH_COPY_${file.name}`
    const marker = content.match(MARKER_RE)

    // Прошлый экспорт оборвался (например, отменили выбор уровня рекурсии): заметка
    // раскрыта, исходник лежит в TECH_COPY. Маркер и копия на месте — значит, пара
    // целая: возвращаем исходник и продолжаем экспорт с него.
    if (marker) {
        const copy = app.vault.getAbstractFileByPath(marker[1].trim())
        if (!(copy instanceof obsidian.TFile)) {
            return stop(
                `Export прерван: в заметке маркер технической копии, а самой копии ` +
                `«${marker[1].trim()}» нет. Восстановите заметку вручную (история git).`
            )
        }
        content = await app.vault.read(copy)
        await app.vault.modify(file, content)
        await app.vault.delete(copy)
        // convertLinks.js берёт встроенные ссылки из metadataCache — дать ему переиндексировать файл
        await new Promise((resolve) => {
            const ref = app.metadataCache.on('changed', (f) => {
                if (f.path === file.path) done()
            })
            const timer = setTimeout(() => done(), 3000)
            const done = () => {
                clearTimeout(timer)
                app.metadataCache.offref(ref)
                resolve(undefined)
            }
        })
        new obsidian.Notice('Export: заметка восстановлена из технической копии прошлого, оборванного экспорта', 8000)
    }
    // Копия без маркера — непонятно, что из них исходник: решает человек.
    if (app.vault.getAbstractFileByPath(techCopyPath)) {
        return stop(
            `Export прерван: в корне хранилища уже лежит «${techCopyPath}» ` +
            `от прерванного экспорта. Сверьте её с заметкой и удалите вручную.`
        )
    }

    await app.vault.create(techCopyPath, content)
    await app.vault.modify(file, `${content}\n\n<!-- TECH_COPY_PATH--${techCopyPath} -->\n`)
}
