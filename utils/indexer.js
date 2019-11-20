// const stopwords = require('./stop-words').stopwords;

class Indexer {
    constructor(content, stopwords) {
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
        let p = content.split('\n\n'),
            filtered = [];
        for (let para of p) {
            if (para.length) {
                filtered.push(para);
            }
        }
        return filtered;
    }

    isStopword(word) {
        console.warn('word is ', word)
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

        for (let i = 0; i < s.length; i++) {
            let char = s.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    filterWords(w) {
        return w.replace('.', '')
            .replace(',', '')
            .replace("'", '')
            .replace('"', '');
    }

    createDocumentHashMap(documents) {
        for (const doc of documents) {
            this.documentHashMap[this.gethashCode(doc)] = doc;
        }
        return this.documentHashMap;
    }

    getHashFromDocument(map, doc) {
        return Object.keys(map).find(key => map[key] === doc);
    }

    getDocumentFromHash(hash) {
        return this.documentHashMap[hash];
    }

    clear() {
        this.indexInvMap = {};
        this.documentHashMap = {};
    }

    /**
     * Creates inverted index from the received set of paragraphs or documents.
     * @param {[string]} documents - array of strings representing as paragraphs
     */
    createInvIndexMap(documents) {
        for (const doc of documents) {
            // let hash = this.getHashFromDocument(this.documentHashMap, doc); // since hash has already been computed
            console.warn('replace the below line')
            let hash = this.gethashCode(doc);
            console.warn('hash is ', hash)
            for (let word of doc.split(' ')) {
                word = this.filterWords(word.toLowerCase());
                if(!this.isStopword(word)) {
                    if (this.isMapped(word)) {
                        if (!this.indexInvMap[word].includes(hash))
                            this.indexInvMap[word].push(hash);
                    } else {
                        this.indexInvMap[word] = [hash];
                    }
                }
            }
        }
        return this.indexInvMap;
    }

    getRelatedDocuments(word) {
        word = this.filterWords(word.toLowerCase());
        if (this.isStopword(word)) {
            return 'stop words not allowed';
        } else if (this.isMapped(word)) {
            let hashes = this.indexInvMap[word],
                docs  = [];
            for (const hash of hashes) {
                console.warn('hash is ', hash)
                docs.push(this.getDocumentFromHash(hash));
            }
            return docs;
        }
        return []; // if word not found in the existing indexes
    }

    getTOP10MatchingDocuments(word) {
        let docs = this.getRelatedDocuments(word);
        if (docs.length > 10) {
            let diff = docs.length - 10;
            for (let i = 0; i < diff; i++) {
                docs.pop();
            }
        }
        return docs;
    }

    insertContents(content) {
        let docs = this.getParagraphs(content);
        this.createDocumentHashMap(docs);
        this.createInvIndexMap(docs);
    }
}

module.exports = {
    Indexer
};
