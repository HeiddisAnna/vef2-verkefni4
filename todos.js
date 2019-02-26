const { query } = require('./db');


async function getList(completed, order = 'ASC') {
  const orderString = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  if (completed === 'false' || completed === 'true') {
    const completedQ = `SELECT * FROM assignment WHERE completed = $1 ORDER BY position ${ orderString }`;
    const completedResult = await query(completedQ, [completed]);
    return completedResult.rows;
  }

  const q = `SELECT * FROM assignment ORDER BY position ${ orderString }`;
  const result = await query(q, []);

  return result.rows;
}

module.exports = {
  getList,
};
