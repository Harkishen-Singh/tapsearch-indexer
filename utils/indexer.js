// const stopwords = require('./stop-words').stopwords;
const JsonDB = require('node-json-db').JsonDB,
    Config = require('node-json-db/dist/lib/JsonDBConfig').Config;

class Indexer {
    constructor(content, stopwords) {
        this.indexInvMap = {};
        this.content = content;
        this.db = new JsonDB(new Config('store/tapsearch', true, true, '/'));
        this.stopwords = stopwords;
        this.documentHashMap = {};

        // load previous maps
        this.initMapsFromDB();
    }

    /**
     * Loads maps from the local database.
     */
    initMapsFromDB() {
        if (Object.keys(this.db.getData('/')).length) {
            this.indexInvMap = this.db.getData('/indexInvMap');
            this.documentHashMap = this.db.getData('/documentHashMap');
            console.log('indexer is up ..');
        }
    }

    /**
     * Converts the content into set of paragraphs or documents
     * @param {string} content - containing a combination of paragraphs in a unified string
     * @returns {[string]} array of strings representing each paragraph or document
     */
    getParagraphs(content) {
        let p = content.split('\r\n\r\n'),
            filtered = [];
        for (let para of p) {
            if (para.length) {
                filtered.push(para);
            }
        }
        return filtered;
    }

    /**
     * Saves the map to the corresponding name.
     * @param {string} name - name of the collection
     * @param {string map} map - specified data as map
     */
    save(name, map) {
        this.db.push('/' + name, map);
    }

    /**
     * Checks if the given word is stopword.
     * @param {string} word
     */
    isStopword(word) {
        return this.stopwords.includes(word);
    }

    /**
     * Checks if the given word is already mapped or not.
     * @param {string} word
     */
    isMapped(word) {
        return this.indexInvMap.hasOwnProperty(word);
    }

    /**
     * Generate hash code for the specified string or document.
     * @param {string} s - given document or string
     */
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

    /**
     * Filter the words from invalid characters.
     * @param {string} w
     */
    filterWords(w) {
        return w.replace('.', '')
            .replace(',', '')
            .replace("'", '')
            .replace('"', '');
    }

    /**
     * Create a hash map of set of documents.
     * @param {[string]} documents - array of documents or paragraphs
     */
    createDocumentHashMap(documents) {
        for (const doc of documents) {
            this.documentHashMap[this.gethashCode(doc)] = doc;
        }
        this.save('documentHashMap', this.documentHashMap);
        return this.documentHashMap;
    }

    /**
     * Get hash code of the specified document.
     * @param {string : string} map
     * @param {string} doc
     */
    getHashFromDocument(map, doc) {
        return Object.keys(map).find(key => map[key] === doc);
    }

    /**
     * Get document from the corresponding hash.
     * @param {string} hash
     */
    getDocumentFromHash(hash) {
        return this.documentHashMap[hash];
    }

    /**
     * Deletes the indexes.
     * @returns the length of the deleted indexes.
     */
    clear() {
        let lI = Object.keys(this.indexInvMap).length,
            lD = Object.keys(this.documentHashMap).length;
        this.indexInvMap = {};
        this.documentHashMap = {};
        return {
            lI,
            lD
        };
    }

    /**
     * Creates inverted index from the received set of paragraphs or documents.
     * @param {[string]} documents - array of strings representing as paragraphs
     */
    createInvIndexMap(documents) {
        for (const doc of documents) {
            let hash = this.gethashCode(doc);
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
        this.save('indexInvMap', this.indexInvMap);
        return this.indexInvMap;
    }

    /**
     * Fetch documents from the related word
     * @param {string} word
     */
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

    /**
     * Fetch Top 10 documents of the related word.
     * @param {string} word
     */
    getTOP10MatchingDocuments(word) {
        let docs = this.getRelatedDocuments(word);
        console.log('length : ', docs.length)
        if (docs.length > 10) {
            let diff = docs.length - 10;
            for (let i = 0; i < diff; i++) {
                docs.pop();
            }
        }
        return docs;
    }

    /**
     * Injects the documents into the inverted index engine in order
     * to create inverted indexes against the corresponding document.
     * @param {*} content
     */
    insertContents(content) {
        let docs = this.getParagraphs(content);
        this.createDocumentHashMap(docs);
        this.createInvIndexMap(docs);
    }
}

module.exports = {
    Indexer
};
