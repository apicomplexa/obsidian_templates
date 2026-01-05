# Оглавление

```dataviewjs
function escapeRegExp(string){ return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
const path  = dv.current().file.path
const paragraphs = (await dv.io.load(path)).split('\n')

const headers = paragraphs
	.filter((p) => p[0] === '#')
	.map(h => h.match(`(#*).*`))
	.map(h => [h[1].length, escapeRegExp(h[0].replaceAll('#', '').replace(' ', ''))])
// var(--h${i+1}-color), var(--h${i+2}-color)
for (let h in headers) {
	let header = headers[h]
	let spacer = [...Array(header[0]-1).keys()].map(i => `<span style="color: var(--h${i+2}-color);">⸺</span>`).join(' ')
	
	dv.paragraph(`> ${spacer} ${dv.sectionLink(path, header[1], false, header[1])}`)
}
```
