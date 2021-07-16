// back
const Async = require('async');
const axios = require('axios');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const request = require('request');
const { getTotalCount, getCount, getMovies } = require('./database');
// front
const express = require('express');
const app = express();
const pug = require('pug');
app.set('views', './views');
app.set('view engine', 'pug');

const PAGE_SIZE = 20;

// GET /movies
app.get('/movies', async (req, res) => {
	const totalCount = await getTotalCount();
	let { count } = await getCount(req, PAGE_SIZE);
	let { movies } = await getMovies(req, PAGE_SIZE);
	const props = {
		text: 'Movies',
		movieCount: `count: ${totalCount.movies}`,
		editionCount: `editions: ${totalCount.editions}`,
		results: count === 1 ? '1 result' : `${count} results`,
		items: movies,
		pages: parseInt(count / PAGE_SIZE),
		page: 0
	};
	res.render('movies', props);
});

app.listen(3000, () => {
	console.log('Example app listening on port 3000!');
});

app.post('/movie-data', jsonParser, async (req, res) => {
	try {
		const resp = await getMovieData(req.body.imdbID);
		let poster = resp.data.Poster;
		let ratings = resp.data.Ratings.reduce(
			(str, rating) => `${str} | ${rating.Source}: ${rating.Value}`, '★');
		res.send(JSON.stringify({ poster, ratings }));
	} catch (err) {
    console.error(err);
    res.send('Ratings not found!');
  }
});

async function getMovieData(imdbID) {
	try {
    const resp = await axios.get(`http://www.omdbapi.com/?i=${imdbID}&apikey=a63ad81f`);
    return resp;
  } catch (err) {
    return console.error(err);
  }
}
