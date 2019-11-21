const exp = require('express'),
	app = exp(),
	bodyParser = require('body-parser'),
	fs = require('fs'),
	pdf = require('pdf-parse'),
	{  performance } = require('perf_hooks'),
	multer = require('multer'),
	networkInterface = require('os')['networkInterfaces'],
	port = process.env.PORT || 5000,
	stopwords = require('./utils/stop-words').stopwords,
	Indexer = require('./utils/indexer').Indexer,
	indexerInstance = new Indexer('', stopwords),
	url = '0.0.0.0';

var requestedUsersSinceUP = 0,
	storage = multer.diskStorage({
		destination: function (_, _, cb) {
			cb(null, 'uploads')
		},
		filename: function (_, file, cb) {
			cb(null, file.fieldname + '-' + Date.now() + '.pdf')
		}
	}),
	upload = multer({ storage });

// allow long document contents
app.use(bodyParser({
	limit: '50mb'
}));

app.use(bodyParser.urlencoded({
	extended: true
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

app.post('/indexPDF', upload.single('myFile'), function (req, res, next) {
	const file = req.file.path
	console.log('received file name: ', file);
	if (!file) {
		const error = new Error('Please upload a file')
		error.httpStatusCode = 400
		return next(error)
	}
	let buffer = fs.readFileSync(file);
	pdf(buffer).then(data => {
		indexerInstance.insertContents(data.text);
	});
	res.send(file)
});

app.post('/search', (req, res) => {
	let key = req.body.key;
	let bef = performance.now();
	let result = indexerInstance.getTOP10MatchingDocuments(key);
	let aft = performance.now();
	res.render(__dirname + '/view/ejs-files/searcher.ejs', { result: result, time: Math.round((aft - bef) * 100) / 100 });
});

const server = app.listen(port, url, err => {
	if (err) {
		throw err;
	}

	// print self IP address
	const addr = networkInterface()['wlp3s0'];
	for (let inst of addr) {
		console.log('from: ', inst['address'], ' family: ', inst['family']);
	}

	console.log('up at ', server.address().address, ' at port ', server.address().port);
});