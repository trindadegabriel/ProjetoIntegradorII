const express = require('express');
const router = express.Router();
const medicoController = require('../controllers/medicoController');

router.get('/painel', medicoController.painelAtendimentos);
router.get('/:id', medicoController.detalheAtendimento);
router.post('/:id/medicacoes', medicoController.registrarMedicacoes);
router.put('/:id/confirmar', medicoController.confirmarAtendimento);

module.exports = router;
