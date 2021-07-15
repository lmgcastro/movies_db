// back
const Async = require('async');
const axios = require('axios');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const movieData = require('./data/movie-data.json');
const request = require('request');
const sqlite3 = require('sqlite3').verbose();
const DB_PATH = 'db/movies.db';
const PAGE_SIZE = 25;
// front
const express = require('express');
const app = express();
const pug = require('pug');
app.set('views', './views');
app.set('view engine', 'pug');

// GET /movies
app.get('/movies', async (req, res) => {
	await openConnection();
	let totalSize = await getCount(req);
	let result = await getMovies(req);
	await closeConnection();
	const props = {
		text: 'Movies',
		items: result.rows,
		pages: parseInt(totalSize.count / PAGE_SIZE),
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

async function getCount({ query }) {
	try {
		let params = { ...query };
		delete params.page;
		return await db.queryGet(getQuery(query, true), 
			Object.values(params));
	} catch (err) {
		return console.error(err.message);
	}
}

async function getMovies({ query }) {
	let result;
	try {
		const sql = getQuery(query);
		result = await db.query(sql, Object.values(query));
	} catch (err) {
		return console.error(err.message);
	}

	return result;
}

function getQuery(query_params, count) {
	const select = `SELECT id, title, year, director, imdb, distributor, 
					strftime('%d/%m/%Y', buy_date) as buy_date FROM movies`;

	const selectCount = `SELECT COUNT(1) as count FROM movies`;

	let where = `ORDER BY title, year`;
	if (query_params.title)
		where = `WHERE title LIKE '%' || ? || '%' ORDER BY title, year`;
	if (query_params.year)
		where = `WHERE year = ? ORDER BY title`;
	if (query_params.director)
		where = `WHERE director LIKE '%' || ? || '%' ORDER BY year`;
	if (query_params.dist)
		where = `WHERE distributor LIKE '%' || ? || '%' ORDER BY title`;
	if (query_params.buy)
		where = `WHERE strftime('%Y-%m', buy_date) = ? ORDER BY buy_date, title`;

	let limit = `LIMIT 0, ${PAGE_SIZE}`;
	if (query_params.page)
		limit = `LIMIT (? * ${PAGE_SIZE}), ${PAGE_SIZE}`;

	return count ? `${selectCount} ${where}` : `${select} ${where} ${limit}`;
}

let db;
async function openConnection() {
	db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE, (err) => {
		if (err) {
			console.error(err.message);
		}
	});
	db.query = function (sql, params) {
		var that = this;
		return new Promise((resolve, reject) => {
			that.all(sql, params, function (error, rows) {
				if (error)
					reject(error);
				else
					resolve({ rows });
			});
		});
	};
	db.queryGet = function (sql, params) {
		var that = this;
		return new Promise((resolve, reject) => {
			that.get(sql, params, function (error, row) {
				if (error)
					reject(error);
				else
					resolve(row);
			});
		});
	};
}

async function closeConnection() {
	db.close((err) => {
		if (err) {
			console.error(err.message);
		}
	});
}
