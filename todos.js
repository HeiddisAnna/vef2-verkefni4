const { query } = require('./db');
const isISO8601 = require('validator/lib/isISO8601');

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

  if(!isEmpty(due)) {
    if(!isISO8601(due)) {
      errors.push({
        field: 'due',
        error: 'Dagsetning verður að vera gild ISO 8601 dagsetning',
      });
    }
  }

  if(!isEmpty(position)) {
    if(typeof position !== 'number' || position < 0) {
      errors.push({
        field: 'position',
        error: 'Staðsetning verður að vera heiltala stærri eða jöfn 0',
      });
    }
  }

  console.log('completed: ' + completed);
  console.log('completed === true: ' + (completed === true));
  if(!(completed === true || completed === false)) {
    errors.push({
      field: 'completed',
      error: 'Lokið verður að vera boolean gildi',
    });
  }

  return errors;
}

async function insertAssignment(title, position, completed, due) {
  const validationResult = await validate(title, position, completed, due);

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
