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

const currentTags = dv.current().file.tags
const tags = currentTags
	.filter(tag => tag !== '#dv_exclude')

for (let tag of tags) {
	const pagesWithTag = dv.pages(`-#dv_exclude & ${tag}`)
		// .filter(p => p => p.tags?.includes(tag))

	dv.header(1, `\`${tag}\``)

	if (tag !== '#📌pin') {
		displayPinedNotes(pagesWithTag)
	}
	displayLastNotes(pagesWithTag)
	
	dv.header(2, `All notes with\`${tag}\``)
	dv.list(pagesWithTag
		.map(p => p.file.link)
	)


}

