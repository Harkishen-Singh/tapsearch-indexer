const stopwords = require('./stop-words');

export class Indexer {

    constructor(content) {
        this.indexInvMap = {};
        this.content = content;
        this.stopwords = stopwords;
        this.documentHashMap = {};
    }

    /**
     * Converts the content into set of paragraphs or documents
     * @param {string} content - containing a combination of paragraphs in a unified string
     * @returns {[string]} array of strings representing each paragraph or document
     */
    getParagraphs(content) {
        let p = content.split('\n'),
            filtered = [];
        for (let para of p) {
            if (para.length) {
                filtered.push(para);
            }
        }
        return para;
    }

    isStopword(word) {
        return this.stopwords.includes(word);
    }

    isMapped(word) {
        return this.indexInvMap.hasOwnProperty(word);
    }

    gethashCode(s) {
        let hash = 0;
        if (s.length == 0) {
            return hash;
        }

        for (i = 0; i < s.length; i++) {
            char = s.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    }

    getDocumentHashMap(documents) {
        let map;
        for (const doc of documents) {
            map[this.gethashCode(doc)] = doc;
        }
        return map;
    }

    getDocumentFromHash(hash) {
        
    }

    /**
     * Creates inverted index from the received set of paragraphs or documents.
     * @param {[string]} documents - array of strings representing as paragraphs
     */
    createInvIndexMap(documents) {
        for (const doc of documents) {
            let hash = this.gethashCode(doc);
            for (const word of doc.split(' ')) {
                if(!this.isStopword(word)) {
                    if (this.isMapped(word)) {
                        this.indexInvMap[word].append(hash);
                    } else {
                        this.indexInvMap[word] = [hash];
                    }
                }
            }
        }
    }


}