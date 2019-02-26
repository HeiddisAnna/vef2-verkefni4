const express = require('express');
const { getList } = require('./todos');

/* todo importa frá todos.js */

const router = express.Router();

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

/* todo útfæra vefþjónustuskil */

async function listRouter(req, res) {
  const { order, completed } = req.query;

  const result = await getList(completed, order);

  console.log(result);

  res.status(200).json(result);
}

router.get('/', catchErrors(listRouter));

module.exports = router;
