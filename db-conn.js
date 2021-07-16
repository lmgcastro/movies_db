const sqlite3 = require('sqlite3').verbose();
const DB_PATH = 'db/movies.db';

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
	return db;
}

async function closeConnection() {
	db.close((err) => {
		if (err) {
			console.error(err.message);
		}
	});
}

module.exports = { db, openConnection, closeConnection };