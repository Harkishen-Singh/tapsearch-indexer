const app = require('express')(),
	bodyParser = require('body-parser'),
	networkInterface = require('os')['networkInterfaces'],
	port = process.env.PORT || 5000,
	url = '0.0.0.0';

var requestedUsersSinceUP = 0;

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
	extended:true,
}));

// prevent CORS issue
app.use((_,res,next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

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

const server = app.listen(port, url, e => {
	if (e) {
		throw e;
	}

	// print self IP address
	const addr = networkInterface()['wlp3s0'];
	for (let inst of addr) {
		console.log('from: ', inst['address'], ' family: ', inst['family']);
	}

	console.log('Up at ', server.address().address, ' at port ', server.address().port);
});