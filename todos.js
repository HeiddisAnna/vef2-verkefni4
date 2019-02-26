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

async function findByID(id) {
  if (typeof id !== 'number') {
    return {
      success: false,
      notFound: true,
      validation: [],
    };
  }
  const q = `SELECT * FROM assignment WHERE id = $1`;  
  const result = await query(q, [id]);

  return result.rows;
}

function isEmpty(s) {
  return s == null && !s;
}

async function validate(title, position, completed, due) {
  const errors = [];

  if(typeof title !== 'string' || title.length < 1 || title.length > 128) {
    errors.push({
      field: 'title',
      error: 'Titill verður að vera strengur sem er 1 til 128 stafir',
    });
  }

  console.log('errors er: ' + errors);
  console.log('errors length er: ' + errors.length);
  console.log('errors error er: ' + errors[0].error);

  return errors;
}

async function insertAssignment(title, position, completed, due) {
  const validationResult = await validate(title, position, completed, due);

  console.log('validationResult.length: ' + validationResult.length);

  if (validationResult.length > 0) {
    return {
      success: false,
      notFound: false,
      validation: validationResult,
    };
  }
  const q = `INSERT INTO assignment
  (title, position, completed, due)
  VALUES
  ($1, $2, $3, $4) RETURNING id, title, position, due, created, updated, completed `;
  const item = await query(q, [title, position, completed, due]);

  return {
    success: true,
    item: item.rows,
  };
}

module.exports = {
  getList,
  findByID,
  insertAssignment,
};
