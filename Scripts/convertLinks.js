"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var EmbedVariant;
(function (EmbedVariant) {
    EmbedVariant["FULL_NOTE"] = "full note";
    EmbedVariant["BLOCK"] = "block";
    EmbedVariant["HEADING"] = "heading";
    EmbedVariant["ERROR"] = "error";
})(EmbedVariant || (EmbedVariant = {}));
const DEFAULF_REQURSION_LEVEL = 3;
module.exports = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const app = params.app;
    const file = app.workspace.getActiveFile();
    if (file) {
        const reqursionLevel = yield params.quickAddApi.suggester([
            `REQURSION LEVEL (def = ${DEFAULF_REQURSION_LEVEL})`,
            1,
            2,
            3,
            4,
            5,
            6,
            7,
        ], [DEFAULF_REQURSION_LEVEL, 1, 2, 3, 4, 5, 6, 7]);
        yield convertAllReferencesToMark(file, app, reqursionLevel);
    }
});
const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
const convertAllReferencesToMark = (activeNote, appApi, recursionDepth = DEFAULF_REQURSION_LEVEL) => __awaiter(void 0, void 0, void 0, function* () {
    if (recursionDepth < 1) {
        recursionDepth = 1;
    }
    else if (recursionDepth > 7) {
        recursionDepth = 7;
    }
    for (let i = 0; i < recursionDepth; i++) {
        console.log(`req ${i}`);
        yield appApi.vault.modify(activeNote, yield __convertAllReferencesToMark(activeNote, appApi));
    }
});
const __convertAllReferencesToMark = (activeNote, appApi) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const metaApi = appApi.metadataCache;
    const noteMetadata = metaApi.getFileCache(activeNote);
    let noteMark = yield appApi.vault.read(activeNote);
    if (noteMetadata) {
        const markLinks = (_a = noteMetadata.links) === null || _a === void 0 ? void 0 : _a.filter((link) => /\[\[.*\]\]/.test(link.original));
        const markEmbeds = (_b = noteMetadata.embeds) === null || _b === void 0 ? void 0 : _b.filter((embed) => /!\[\[.*\]\]/.test(embed.original));
        if (markLinks) {
            noteMark = convertLinksToMark(activeNote.path, noteMark, markLinks, appApi);
        }
        if (markEmbeds) {
            noteMark = yield convertEmbedsToMark(activeNote.path, noteMark, markEmbeds, appApi);
        }
    }
    return noteMark;
});
const convertEmbedsToMark = (activeNotePath, activeNoteMark, embeds, appApi) => __awaiter(void 0, void 0, void 0, function* () {
    const embedFiles = findFilesByRefCaches(embeds, activeNotePath, appApi);
    const embedMarks = embedFiles.filter((ef) => { var _a; return ((_a = ef.file) === null || _a === void 0 ? void 0 : _a.extension) === 'md'; });
    const embedAttachments = embedFiles.filter((ef) => { var _a; return ((_a = ef.file) === null || _a === void 0 ? void 0 : _a.extension) !== 'md'; });
    activeNoteMark = replaceReferencesInFile(embedAttachments, activeNoteMark, true);
    activeNoteMark = yield replaceEmbedsInFile(embedMarks, activeNoteMark, appApi);
    return activeNoteMark;
});
const replaceEmbedsInFile = (embeds, activeNoteMark, appApi) => __awaiter(void 0, void 0, void 0, function* () {
    const replacements = yield parseEmbedNotes(embeds, appApi);
    activeNoteMark = multyReplace(activeNoteMark, replacements);
    return activeNoteMark;
});
const convertLinksToMark = (activeNotePath, activeNoteMark, links, appApi) => {
    const refencedFiles = findFilesByRefCaches(links, activeNotePath, appApi);
    return replaceReferencesInFile(refencedFiles, activeNoteMark);
};
const findFilesByRefCaches = (refCaches, activeNotePath, appApi) => {
    const posiblyBrokenRefs = refCaches.map((link) => {
        const lm = link.link.match(/([^#^]+)([#^].*)?/u);
        return {
            link: link,
            file: !lm
                ? null
                : appApi.metadataCache.getFirstLinkpathDest(lm[1], activeNotePath),
        };
    });
    return filterBrokenReferences(posiblyBrokenRefs);
};
const filterBrokenReferences = (references) => {
    const validReferences = references.filter((lf) => lf.file !== null);
    const brokenReferences = references.filter((lf) => lf.file === null);
    if (brokenReferences.length > 0) {
        logError('Ivalid links', brokenReferences
            .map((l) => `${l.link.original} on position: row ${l.link.position.start.line}, col ${l.link.position.start.col}`)
            .join('\n'));
    }
    return validReferences;
};
const logError = (messageLev1, messageLev2) => {
    messageLev2 = messageLev2 ? `\n--------\n${messageLev2}` : '';
    console.error(`${messageLev1}${messageLev2}`);
};
const parseEmbedNotes = (embeds, appApi) => __awaiter(void 0, void 0, void 0, function* () {
    const parseEmbedNote = (reference) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        let embedFileContent = yield appApi.vault.read(reference.file);
        const fileCache = appApi.metadataCache.getFileCache(reference.file);
        const embedFrontmatter = fileCache === null || fileCache === void 0 ? void 0 : fileCache.frontmatter;
        const frontmatterPosition = (_b = (_a = fileCache === null || fileCache === void 0 ? void 0 : fileCache.sections) === null || _a === void 0 ? void 0 : _a.find((s) => s.type === 'yaml')) === null || _b === void 0 ? void 0 : _b.position;
        if (frontmatterPosition) {
            embedFileContent = yield sliceNoteMarkByLines(reference.file, frontmatterPosition.end.line + 1, fileCache.sections[fileCache.sections.length - 1].position
                .end.line);
        }
        return {
            searchValue: reference.link.original,
            replaceValue: embedFileContent,
            frontmatters: embedFrontmatter,
            isEmbed: true,
            embedType: EmbedVariant.FULL_NOTE,
        };
    });
    const sliceNoteMarkByLines = (note, startLine, endLine) => __awaiter(void 0, void 0, void 0, function* () {
        var _c;
        const embedFileContentLines = (_c = (yield appApi.vault.read(note))) === null || _c === void 0 ? void 0 : _c.split(/\n/m);
        const embedLines = embedFileContentLines === null || embedFileContentLines === void 0 ? void 0 : embedFileContentLines.slice(startLine, endLine + 1);
        return embedLines === null || embedLines === void 0 ? void 0 : embedLines.join('\n');
    });
    const parseEmbedNotePart = (embed) => __awaiter(void 0, void 0, void 0, function* () {
        var _d, _e;
        const embedFileCache = appApi.metadataCache.getFileCache(embed.file);
        const blockIdMatch = embed.link.link.match(/[^#]#\^([^|]*)(?:\|.*)?/);
        if (blockIdMatch) {
            const blockPositionInEmbedFile = (_d = embedFileCache === null || embedFileCache === void 0 ? void 0 : embedFileCache.blocks) === null || _d === void 0 ? void 0 : _d[blockIdMatch[1]].position;
            const blockReplacement = yield composeNotePartReplacement(embed, blockPositionInEmbedFile, blockIdMatch[1], EmbedVariant.BLOCK);
            return blockReplacement;
        }
        const headingMatch = embed.link.link.match(/[^#]#([^|]*)(?:\|.*)?/);
        const headingIndex = (_e = embedFileCache === null || embedFileCache === void 0 ? void 0 : embedFileCache.headings) === null || _e === void 0 ? void 0 : _e.findIndex((h) => h.heading === (headingMatch === null || headingMatch === void 0 ? void 0 : headingMatch[1]));
        if (headingIndex !== undefined && (embedFileCache === null || embedFileCache === void 0 ? void 0 : embedFileCache.sections)) {
            const headings = embedFileCache.headings;
            const sections = embedFileCache.sections;
            const heading = headings[headingIndex];
            const hedingsCopy = headings.slice(headingIndex + 1);
            const nextSameLevelHedings = hedingsCopy.find((h) => h.level === heading.level) ||
                sections[sections.length - 1];
            const headingReplacement = yield composeNotePartReplacement(embed, {
                start: heading.position.start,
                end: nextSameLevelHedings.position.end,
            }, headingMatch[1], EmbedVariant.HEADING);
            return headingReplacement;
        }
        logError('Invalid Embed', `On line ${embed.link.position.start.line}.\nPloblems whis identifacation of type of this embed: block of headind link\nReferense was not changed`);
        return {
            searchValue: embed.link.original,
            replaceValue: embed.link.original,
            isEmbed: true,
            embedType: EmbedVariant.ERROR,
        };
    });
    const composeNotePartReplacement = (reference, blockPosImEmbedFile, embedName, embedType) => __awaiter(void 0, void 0, void 0, function* () {
        if (blockPosImEmbedFile) {
            const embedContent = yield sliceNoteMarkByLines(reference.file, blockPosImEmbedFile.start.line, blockPosImEmbedFile.end.line);
            return {
                searchValue: reference.link.original,
                replaceValue: embedContent,
                isEmbed: true,
                embedType: embedType,
            };
        }
        else {
            logError(`Reference to nonexistent ${embedType.toString()}`, `On line ${reference.link.position.start.line}:\n${embedName} to file ${reference.file.path}.\nReferense was not changed`);
            return {
                searchValue: reference.link.original,
                replaceValue: reference.link.original,
                isEmbed: true,
                embedType: EmbedVariant.ERROR,
            };
        }
    });
    const replacements = yield Promise.all(embeds.map((embed) => __awaiter(void 0, void 0, void 0, function* () {
        const isBlock = /[^#]#[^|]*(?:\|.*)?/.test(embed.link.original);
        if (isBlock) {
            return yield parseEmbedNotePart(embed);
        }
        else {
            return yield parseEmbedNote(embed);
        }
    })));
    return replacements;
});
const replaceReferencesInFile = (references, noteMarkString, isEmbed = false) => {
    const refReplasments = references.map((lf) => {
        return {
            searchValue: lf.link.original,
            replaceValue: formateReferenceTextToMark(lf.link, lf.file.path, isEmbed),
            isEmbed,
        };
    });
    let noteWithConvertedLinks = multyReplace(noteMarkString, refReplasments);
    return noteWithConvertedLinks;
};
const formateReferenceTextToMark = (refCache, linkedFilePath, isEmbed = false) => {
    return `${isEmbed ? '!' : ''}[${refCache.displayText}](${encodeURI(linkedFilePath)})`;
};
const multyReplace = (source, replacements) => {
    replacements.forEach((rep) => {
        source = source.replace(new RegExp(escapeRegExp(rep.searchValue), 'gu'), rep.replaceValue);
    });
    return source;
};
