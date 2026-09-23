const express = require('express');
const router = express.Router();
const atendimentoController = require('../controllers/atendimentoController');

router.post('/', atendimentoController.criarAtendimento);
router.get('/', atendimentoController.listarAtendimentos);
router.get('/:id', atendimentoController.consultarAtendimento);
router.put('/:id', atendimentoController.alterarAtendimento);
router.delete('/:id', atendimentoController.cancelarAtendimento);

module.exports = router;
