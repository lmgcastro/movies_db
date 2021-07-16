const db = require('./db-conn');

async function getTotalCount() {
	let database = await db.openConnection();
	try {
		const sqlEditions = '(select count(*) from movies) as editions';
		const sqlMovies = '(select count(distinct imdb) from movies) as movies';
		return await database.queryGet(`select ${sqlEditions}, ${sqlMovies} from movies`);
	} catch (err) {
		return console.error(err.message);
	} finally {
		await db.closeConnection();
	}
}

async function getCount({ query }, PAGE_SIZE) {
	let database = await db.openConnection();
	try {
		let params = { ...query };
		delete params.page;
		const sql = getQuery({
										params: query, 
										count: true, 
										page_size: PAGE_SIZE
									});
		return await database.queryGet(sql,	Object.values(params));
	} catch (err) {
		return console.error(err.message);
	} finally {
		await db.closeConnection();
	}
}

async function getMovies({ query }, PAGE_SIZE) {
	let database = await db.openConnection();
	let result;
	try {
		const sql = getQuery({
									params: query, 
									page_size: PAGE_SIZE
								});
		result = await database.query(sql, Object.values(query));
	} catch (err) {
		return console.error(err.message);
	} finally {
		await db.closeConnection();
	}

	return { movies: result.rows };
}

function getQuery({ params, count, page_size}) {
	const select = `SELECT id, title, year, director, imdb, distributor, 
					strftime('%d/%m/%Y', buy_date) as buy_date FROM movies`;

	const selectCount = `SELECT COUNT(1) as count FROM movies`;

	let where = `ORDER BY title, year`;
	if (params.title)
		where = `WHERE title LIKE '%' || ? || '%' ORDER BY title, year`;
	if (params.year)
		where = `WHERE year = ? ORDER BY title`;
	if (params.director)
		where = `WHERE director LIKE '%' || ? || '%' ORDER BY year`;
	if (params.dist)
		where = `WHERE distributor LIKE '%' || ? || '%' ORDER BY title`;
	if (params.buy_date)
		where = `WHERE strftime('%d/%m/%Y', buy_date) LIKE '%' || ? || '%' ORDER BY date(buy_date) asc, title`;

	let limit = `LIMIT 0, ${page_size}`;
	if (params.page)
		limit = `LIMIT (? * ${page_size}), ${page_size}`;

	return count ? `${selectCount} ${where}` : `${select} ${where} ${limit}`;
}

module.exports = { getTotalCount, getCount, getMovies };