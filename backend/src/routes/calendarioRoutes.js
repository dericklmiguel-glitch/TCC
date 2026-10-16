const express = require('express');
const router = express.Router();
const calendarioController = require('../controllers/calendarioController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', calendarioController.index);
router.post('/', calendarioController.store);
router.delete('/:id', calendarioController.delete);

module.exports = router;