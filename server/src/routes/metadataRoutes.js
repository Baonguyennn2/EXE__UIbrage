const express = require('express');
const router = express.Router();
const { Category, Tag } = require('../models/mysql');

router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/tags', async (req, res) => {
  try {
    const tags = await Tag.findAll({ order: [['name', 'ASC']] });
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
