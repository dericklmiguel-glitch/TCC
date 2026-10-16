const express = require('express');
const router = express.Router();
const questoesController = require('../controllers/questoesController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', questoesController.index);
router.post('/', questoesController.store);

module.exports = router;