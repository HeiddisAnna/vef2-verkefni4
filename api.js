const express = require('express');
const { getList, findByID } = require('./todos');

/* todo importa frá todos.js */

const router = express.Router();

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

/* todo útfæra vefþjónustuskil */

async function listRouter(req, res) {
  const { order, completed } = req.query;
  const result = await getList(completed, order);
  res.status(200).json(result);
}

async function findID(req, res) {
  const { id } = req.params;

  const result = await findByID(parseInt(id, 10));

  if (!result.success && result.notFound) {
    return res.status(404).json({ error: 'Item not found' });
  }
  if (!result.success && result.length === 0) {
    return res.status(400).json({ error: 'Verkefnið er ekki til' });
  }
  res.status(200).json(result);
}

router.get('/', catchErrors(listRouter));
router.get('/:id', catchErrors(findID));

module.exports = router;
