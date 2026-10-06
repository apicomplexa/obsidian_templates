const obsiduanQueryTemplate = (text: string, q: string, count: number): string =>
  `[${text}](obsidian://search?query=[${q}]) \`${count}\``;