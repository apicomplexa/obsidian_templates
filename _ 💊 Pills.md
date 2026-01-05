<%*
async function color(text) {
    let color =await tp.system.suggester([
    "Цвет страницы",
    "⚪️ | gray | серый ", 
    "🟤 | brown | коричневый", 
    "🟠 | orange | оранжевый", 
    "🟡 | yellow | желтый", 
    "🟢 | green | зеленый", 
    "🔵 | blue | синий", 
    "🟣 | purple | фиолетовый", 
    "🌸 | pink | розовый", 
    "🔴 | red | красный"], ["", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"], "цвет");
    if (text.includes(`\n`)) {
        let textLines = text.split(`\n`)
        return textLines.map((line) => `<span class="text_pill ${color}">${line}</span>`).join(`\n`)
    }
    return `<span class="text_pill ${color}">${text}</span>`
}
let a = await color(tp.file.selection())
%><% a %>