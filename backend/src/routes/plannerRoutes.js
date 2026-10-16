const express = require('express');
const router = express.Router();
const plannerController = require('../controllers/plannerController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', plannerController.index);
router.post('/', plannerController.store);
router.delete('/:id', plannerController.delete);

module.exports = router;