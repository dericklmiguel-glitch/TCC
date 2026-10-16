const express = require('express');

const router = express.Router();

const authController =
    require('../controllers/authController');


// LOGIN
router.post(
    '/login',
    authController.login
);


// CADASTRO
router.post(
    '/register',
    authController.register
);


// LISTAR ALUNOS
router.get(
    '/alunos',
    authController.listarAlunos
);


// LISTAR ALUNOS + PROGRESSO
router.get(
    '/alunos/progresso',
    authController.listarAlunosComProgresso
);


module.exports = router;