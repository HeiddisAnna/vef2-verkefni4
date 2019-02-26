const { query } = require('./db');


async function getList(completed, order = 'ASC') {

  const orderString = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  if(completed === 'false' || completed === 'true') {
    
  }
  
  console.log('order string: ' + orderString);
  const q = `SELECT * FROM assignment ORDER BY position ${orderString}`;

  
  const result = await query(q, []);

  return result.rows;

}

module.exports = {
  getList,
};
