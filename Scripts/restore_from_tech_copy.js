/// @ts-check 
// import {App} from './obsidian'

// @ts-ignore
module.exports = async (params) => {
    /** @type {App} */
    const app = params.app;
    const modFile = app.workspace.getActiveFile();
    if (modFile){
        const techCopyPath = (await app.vault.read(modFile)).match(/%%TECH_COPY_PATH--(.*)%%/u)
        if (techCopyPath) {
            const techCopy = app.vault.getAbstractFileByPath(techCopyPath[1])
            if (techCopy) {
                const modFilePath = modFile.path
                await app.vault.delete(modFile)
                await app.vault.rename(techCopy, modFilePath)

                const leaf = app.workspace.getLeaf(app.vault.getAbstractFileByPath(modFilePath))
                leaf.openFile(modFile)
            }
            else {
                throw Error('Ошибка при получении доступа к технической копии')
            }
        } else {
            throw Error('Утеряна техническая копия заметки. Пожалуйста посмотрите в корневой папке хранилища')
        }

    }
}