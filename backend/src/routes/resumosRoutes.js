const express = require('express');
const router = express.Router();
const resumosController = require('../controllers/resumosController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', resumosController.index);
router.post('/', resumosController.store);
router.delete('/:id', resumosController.delete);

module.exports = router;