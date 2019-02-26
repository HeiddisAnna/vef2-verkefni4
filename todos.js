const xss = require('xss');
const isISO8601 = require('validator/lib/isISO8601');
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
  const q = 'SELECT * FROM assignment WHERE id = $1';  
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

  const thisPosition = parseInt(position, 10);
  console.log('(!isEmpty(position)): ' + (!isEmpty(position)));
  console.log('typeof thisPosition !== number : ' + (typeof thisPosition !== 'number'));
  console.log('thisPosition < 0 : ' + (thisPosition < 0));

  console.log('type thisPosition: ' + typeof thisPosition);
  console.log('thisPosition: ' + thisPosition);

  if(!isEmpty(position)) {
    if(typeof thisPosition !== 'number' || thisPosition < 0) {
      errors.push({
        field: 'position',
        error: 'Staðsetning verður að vera heiltala stærri eða jöfn 0',
      });
    }
  }
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

async function updateByID(id, item) {
  const result = await query('SELECT * FROM assignment where id = $1', [id]);

  if (result.rows.length === 0) {
    return {
      success: false,
      notFound: true,
      validation: [],
    };
  }

  const validationResult = validate(item.title, item.position, item.completed, item.due);

  if (validationResult.length > 0) {
    return {
      success: false,
      notFound: false,
      validation: validationResult,
    };
  }

  const changedColumns = [
    !isEmpty(item.title) ? 'title' : null,
    !isEmpty(item.position) ? 'position' : null,
    !isEmpty(item.completed) ? 'completed' : null,
    !isEmpty(item.due) ? 'due' : null,
  ].filter(Boolean);

  const changedValues = [
    !isEmpty(item.title) ? xss(item.title) : null,
    !isEmpty(item.position) ? xss(item.position) : null,
    !isEmpty(item.completed) ? xss(item.completed) : null,
    !isEmpty(item.due) ? xss(item.due) : null,
  ].filter(Boolean);

  const updates = [id, ...changedValues];

  const updatedColumnsQuery =
    changedColumns
      .map((column, i) => `${column} = $${i + 2}`);

  console.log(updates);
  console.log(updatedColumnsQuery);

  const q = `
    UPDATE assignment
    SET ${updatedColumnsQuery.join(', ')}
    WHERE id = $1
    RETURNING id, title, position, due, created, updated, completed`;
  console.log(q);

  const updateResult = await query(q, updates);
  console.log(updateResult);
  return {
    success: true,
    item: updateResult.rows[0],
  };
}

async function deletByID(id) {
  const findID = await query('SELECT * FROM assignment where id = $1', [id]);
  if (findID.rows.length === 0) {
    return {
      success: false,
      notFound: true,
      validation: [],
    };
  }

  const q = 'DELETE FROM assignment WHERE id = $1';
  const result = await query(q, [id]);
  return {
    success: true,
    notFound: false,
    validation: [],
  };
}

module.exports = {
  getList,
  findByID,
  insertAssignment,
  updateByID,
  deletByID, 
};
