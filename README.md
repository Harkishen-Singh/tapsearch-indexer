## TapSearch-Indexer

TapSearch-Indexer forms an inverted indexing of the words against the corresponding documents, similar to what elasticsearch does. It uses local node-json-db which is used to load and store the inverted indexes along with the document hashes.

It supports:

1. General text
2. PDFs files (Bonus 1)

Hosted at: [https://tapsearch-indexer.herokuapp.com/](https://tapsearch-indexer.herokuapp.com/)

Explanatory video link: [link (google-drive)](https://drive.google.com/file/d/1GDlk_ilnQhMliPu_wI9hHEmUiIy-Nc9a/view)

### How to run

1. Install dependencies via `npm install`.
2. Run the application via `node server.js`.
3. Open your browser and visit `https://127.0.0.1:5000` in order to use the application.
