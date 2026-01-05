/// @ts-check 
// import {App} from './obsidian'

// @ts-ignore
module.exports = async (params) => {


    /** @type {App} */
    const app = params.app;
    const file = app.workspace.getActiveFile();

    if (file) {
        const techCopyPath = `TECH_COPY_${file.name}`
        const oldTechCopy = app.vault.getAbstractFileByPath(techCopyPath)
        if (oldTechCopy) {
            await app.vault.delete(oldTechCopy)
        }
        const rawOrigMarkdown = await app.vault.read(file)

        const techCopy = await app.vault.create(techCopyPath, rawOrigMarkdown, {ctime: file.stat.ctime})

        await app.vault.modify(file, formateNote(rawOrigMarkdown, techCopy.path))
    }
    
}

const REPLACEMENTS = [
    [/\[!\$\][+-]?/gu, '➡️'],
    [/\[!def\][+-]?/gu, '➡️'],
    [/\[!note\][+-]?/gu, '🖋️'],
    [/\[!abstract\][+-]?/gu, '🗒️'],
    [/\[!info\][+-]?/gu, '❕'],
    [/\[!todo\][+-]?/gu, '✅'],
    [/\[!tip\][+-]?/gu, '🔥'],
    [/\[!success\][+-]?/gu, '✔️'],
    [/\[!warning\][+-]?/gu, '⚠️'],
    [/\[!failure\][+-]?/gu, '❌'],
    [/\[!danger\][+-]?/gu, '⚡'],
    [/\[!bug\][+-]?/gu, '🪲'],
    [/\[!example\][+-]?/gu, '🟰'],

    [/- \[ \]/gu, '\n\n◯'],
    [/- \[x\]/gu, '\n\n●'],
    [/- \[\/\]/gu, '\n\n◑'],
    [/- \[-\]/gu, '\n\n⊝'],
    [/- \[>\]/gu, '\n\n➤'],
    [/- \[<\]/gu, '\n\n📅'],
    [/- \[\?\]/gu, '\n\n❓'],
    [/- \[!\]/gu, '\n\n⚠️'],
    [/- \[\*\]/gu, '\n\n⭐'],
    [/- \["\]/gu, '\n\n💬'],
    [/- \[l\]/gu, '\n\n📍'],
    [/- \[b\]/gu, '\n\n🔖'],
    [/- \[i\]/gu, '\n\nℹ️'],
    [/- \[S\]/gu, '\n\n💾'],
    [/- \[I\]/gu, '\n\n💡'],
    [/- \[p\]/gu, '\n\n👍'],
    [/- \[c\]/gu, '\n\n👎'],
    [/- \[f\]/gu, '\n\n🔥'],
    [/- \[k\]/gu, '\n\n🗝️'],
    [/- \[w\]/gu, '\n\n🏆'],
    [/- \[u\]/gu, '\n\n⬆️'],
    [/- \[d\]/gu, '\n\n⬇️'],

    [/<span class="\w*">(\w*)<\/span>/gu, '==$1=='],
]
/**
 * @param {string} noteMark 
 * @param {string} tech_copy_path
 * @returns {string}
 */
const formateNote = (noteMark, tech_copy_path) => {
    for (let replacement of REPLACEMENTS) {
        // @ts-ignore
        noteMark = noteMark.replace(replacement[0], replacement[1])
    }
    noteMark += `\n\n%%TECH_COPY_PATH--${tech_copy_path}%%`
    return noteMark
}
