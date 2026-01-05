module.exports = async (params) => {
    const {app} = params;
    const quickAddApi = app.plugins.plugins["quickadd"].api
    const metadataMenuApi = app.plugins.plugins["metadata-menu"].api;

    // const file_ = app.workspace.getActiveFile();
    // console.log(file_.path)

    const promptFile = app.vault.getAbstractFileByPath('_.Settings/Prompts/Summary.md');
    const promptText = await app.vault.read(promptFile)
    
    const settings = {
        modelOptions: {
            temperature: 1,
            max_tokens: 600,
            frequency_penalty: 0.5,
            presence_penalty: 0.5
        },
        systemPrompt: 'As an AI assistant within Obsidian, your primary goal is to help users manage their ideas and knowledge more effectively. Format your responses using Markdown syntax. Please use the [[Obsidian]] link format. You can write aliases for the links by writing [[Obsidian|the alias after the pipe symbol]]. To use mathematical notation, use LaTeX syntax. LaTeX syntax for larger equations should be on separate lines, surrounded with double dollar signs ($$). You can also inline math expressions by wrapping it in $ symbols. For example, use $$w_{ij}^{	ext{new}}:=w_{ij}^{	ext{current}}+etacdotdelta_jcdot x_{ij}$$ on a separate line, but you can write "($eta$ = learning rate, $delta_j$ = error term, $x_{ij}$ = input)" inline.'
    };
    const model = {name: "gpt-4o"}

    const response = await quickAddApi.ai.prompt(promptText, model, settings)

    // console.log(response)

    const file = app.workspace.getActiveFile();
    await metadataMenuApi.postNamedFieldsValues(file, [{
        name: "summary",
        payload: {
            value: response.output
        }
    }])
}