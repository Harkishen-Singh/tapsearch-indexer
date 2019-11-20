// eslint-disable-next-line no-undef
var app = angular.module('tapsearch-indexer', ['ngRoute']);

var global = {
	username: '',
    serverUrl: '127.0.0.1:5000/'
};


app.config(function($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: './components/tapS-view.html',
			controller: 'tapS-view-controller',
			title: 'tapsearch-indexer',
		})
		.when('/contact', {
			templateUrl: './components/contact.html',
			title: 'Contact Info',
		});
});

app.controller('tapS-view-controller', function($scope) {
    console.log('tapS-view-controller');
});