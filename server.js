const exp = require('express'),
	app = exp(),
	bodyParser = require('body-parser'),
	networkInterface = require('os')['networkInterfaces'],
	port = process.env.PORT || 5000,
	stopwords = require('./utils/stop-words').stopwords,
	Indexer = require('./utils/indexer').Indexer,
	indexerInstance = new Indexer('', stopwords),
	url = '0.0.0.0';

var requestedUsersSinceUP = 0;

// allow long document contents
app.use(bodyParser({
	limit: '50mb'
}));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
	extended: false,
}));

// prevent CORS issue
app.use((_,res,next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.set('view engine', 'ejs');

// respond to ping
app.get('/', (req, res) => {
	console.log('request count: ', ++requestedUsersSinceUP, ' ping request from ', req.connection.remoteAddress);
	res.sendFile(__dirname + '/view/index.html');
});

app.get('/css/main.css', (_, res) => {
	res.sendFile(__dirname + '/view/css/main.css')
});

app.get('/css/bootstrap.css', (_, res) => {
	res.sendFile(__dirname + '/view/css/bootstrap.css')
});

app.get('/contact', (_, res) => {
	res.sendFile(__dirname + '/view/contact.html')
});

app.get('/indexer', (_, res) => {
	res.sendFile(__dirname + '/view/indexer.html')
});

app.get('/searcher', (_, res) => {
	res.sendFile(__dirname + '/view/searcher.html')
});

app.post('/index', (req, res) => {
	let text = req.body.content;
	indexerInstance.insertContents(text);
	res.redirect('/');
});

app.post('/search', (req, res) => {
	// console.warn('req is ', req)
	let key = req.body.key;
	console.warn('key is ss ', req.params.key)
	// console.warn('key is ss ', req.body.key)
	// console.warn('key is ss ', req.query)
	let result = indexerInstance.getTOP10MatchingDocuments(key);
	console.warn('result is ')
	console.warn(result)
	res.render(__dirname + '/view/ejs-files/searcher.ejs', { result: result });
});

const server = app.listen(port, url, e => {
	if (e) {
		throw e;
	}

	// print self IP address
	const addr = networkInterface()['wlp3s0'];
	for (let inst of addr) {
		console.log('from: ', inst['address'], ' family: ', inst['family']);
	}

	console.log('up at ', server.address().address, ' at port ', server.address().port);
});