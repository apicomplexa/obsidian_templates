const {fieldModifier: f} = MetadataMenu.api

const obsiduanQueryTemplate = (text, q, count) => `[${text}](obsidian://search?query=[${q}]) \`${count}\``

const displayPinedNotes = (notes) => {
	dv.header(2, '📌Pined notes')
	const pinedNotes = notes
		.filter(p => p.tags?.includes('📌pin'))
		.map(p => p.file.link)
	if (pinedNotes.length > 0) {
		dv.list(pinedNotes)
	} else (
		dv.paragraph("*no pined notes*")
	)
}

const displayLastNotes = (notes) => {
	dv.header(2, '⌚Recently updated')
	dv.list(notes
		.sort((p1) => -p1.file.mtime)
		.slice(0, 10)
		.map(p => `${p.file.link}`)
	)
} 

const currentFm = dv.current().file.frontmatter
const indexes = Object.keys(currentFm).filter(fm => {
	if (fm === 'type') {
		return false
	}
	try {
		return currentFm[fm].includes('index')
	} catch {
		return false
	}
})

const getNoteProperties = (note) => {
	const frontmatters = note.file.frontmatter
	const shoingProperties = []
	for (const fm in frontmatters) {
		const indexPage = dv.page(fm)
		if (indexPage !== undefined && indexPage.file.tags.includes('#dv_exclude')) {
			shoingProperties.push(`${indexPage.file.link} <span>${note[fm]?.map(fm => `<span class="text_pill bordered" style="--pill-color: rgba(var(--ctp-accent), 0.5)">${fm}</span>`) ?? ""}</span>`)
		}
	}
	return shoingProperties
}

for (let index of indexes) {
	const pagesWithIndex = dv.pages('-#dv_exclude')
		.filter(p => Object.keys(p.file.frontmatter).includes(index))

	
	for (let subindexToShow of dv.current().file.frontmatter[index].filter(si => si !== "index")) {
		
		let pagesWithSubIndex = pagesWithIndex.filter(page => page.file.frontmatter[index]?.includes(subindexToShow))
		
		dv.table(
			[subindexToShow, 'Summary', 'Properties'],
			pagesWithSubIndex.map(p => [
				p.file.link, 
				`<span style="text-align: left !important">${p['summary']}</span>`,
				getNoteProperties(p)
			])
		)
	}
}



