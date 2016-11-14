var express = require('express');
var alexa = require('alexa-app');
var tvmaze = require("tvmaze-node");
var bodyParser = require('body-parser');
// var intent = require('./template.js');

var server = express();
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.set('view engine','ejs');

var port = process.env.PORT || 3978;
var app = new alexa.app('TVSeries');

app.launch(function(request, response) {
    response.say('Welcome to TV series, you can ask me when is the next episode of a series, ' +
		'how many seasons it has, and how many episodes it has.');
	response.shouldEndSession(false);
});

app.intent("nextEpisodeIntent",
	{
		"slots":{"SeriesName": "SeriesNameType" },
		"utterances": [
			"When is the next episode of {-|SeriesName}",
			"Next episode of {-|SeriesName}",
			"When is the next {-|SeriesName} episode"
		]
	},
	function(request,response) {
		var seriesName = request.slot('SeriesName');
		if(seriesName){
			tvmaze.singleShow(seriesName, "episodes", function(err, res) {
				if(!err){
					var show = JSON.parse(res);
					var showId = show.id;
					tvmaze.showById(showId, "episodes", false, function(err1, res1) {
						var episodes = JSON.parse(res1);
						var last = episodes[episodes.length-1];
						var text;
						if(last.airdate){
							text = show.name + ' last episode '+  last.name + ' is emitted on ' + last.airdate;

						} else {
							text = show.name + ' last episode is ' + last.name + ', but I don\'t know when is emitted';
						}
						var card = createCard(text, show.image.medium, show.image.original);
						response.card(card);
						response.say(text);
						response.send();
						response.shouldEndSession(true);
					});
				} else {
					respondSeriesNotFound(seriesName);
				}
			});
			return false;
		} else {
			response.say('Sorry, I didn\'t understand the series name');
			response.shouldEndSession(true);
		}
	}
);

app.intent("howManySeasonsIntent",
	{
		"slots":{"SeriesName": "SeriesNameType" },
		"utterances": [
			"How many seasons does {-|SeriesName} have",
			"Seasons of {-|SeriesName}"
		]
	},
	function(request,response) {
		var seriesName = request.slot('SeriesName');
		if(seriesName){
			tvmaze.singleShow(seriesName, "episodes", function(err, res) {
				if(!err){
					var show = JSON.parse(res);
					var showId = show.id;
					tvmaze.showById(showId, "seasons", false, function(err1, res1) {
						var seasons = JSON.parse(res1);
						var text = show.name + ' has ' + seasons.length + ' seasons';
						var card = createCard(text, show.image.medium, show.image.original);
						response.card(card);
						response.say(text);
						response.send();
						response.shouldEndSession(true);
					});
				} else {
					respondSeriesNotFound(seriesName);
				}
			});
			return false;
		} else {
			response.say('Sorry, I didn\'t understand the series name');
			response.shouldEndSession(true);
		}
	}
);

app.intent("howManyEpisodesIntent",
	{
		"slots":{"SeriesName": "SeriesNameType" },
		"utterances": [
			"How many episodes does {-|SeriesName} have",
			"Episodes of {-|SeriesName}"
		]
	},
	function(request,response) {
		var seriesName = request.slot('SeriesName');
		if(seriesName){
			tvmaze.singleShow(seriesName, "episodes", function(err, res) {
				if(!err){
					var show = JSON.parse(res);
					var showId = show.id;
					tvmaze.showById(showId, "episodes", "specials", function(err1, res1) {
						var episodes = JSON.parse(res1);
						var text = show.name + ' has ' + episodes.length + ' episodes';
						var card = createCard(text, show.image.medium, show.image.original);
						response.card(card);
						response.say(text);
						response.send();
						response.shouldEndSession(true);
					});
				} else {
					respondSeriesNotFound(seriesName);
				}
			});
			return false;
		} else {
			response.say('Sorry, I didn\'t understand the series name');
			response.shouldEndSession(true);
		}
	}
);

function respondSeriesNotFound(series){
	response.say('Sorry, I didn\'t found ' + series + ' series');
	response.send();
	response.shouldEndSession(true);
}

function createCard(text, thumb, bigImage){
	var card = {};
	card['type'] = "Standard";
	card['title'] = "TV Series";
	card['text'] = text;
	if(thumb || bigImage) {
		card['image'] = {};
		card['image']['smallImageUrl'] = thumb;
		card['image']['largeImageUrl'] = bigImage;
	}
	return card;
}

app.express(server, "/echo/");

server.listen(port);
console.log("Listening on port "+port);

// async example
// app.request(intent.nextEpisodeIntent)
// 	.then(function(response) {
// 		console.log(JSON.stringify(response,null,3));
// 	});
