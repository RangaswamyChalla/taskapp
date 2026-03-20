const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getTasks, createTask, updateTask, deleteTask, getStats } = require('../controllers/taskController');

router.get('/', auth, getTasks);
router.post('/', auth, createTask);
router.patch('/:id', auth, updateTask);
router.delete('/:id', auth, deleteTask);
router.get('/stats', auth, getStats);

module.exports = router;
