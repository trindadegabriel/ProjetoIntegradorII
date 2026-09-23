const express = require('express');
const router = express.Router();
const triagemController = require('../controllers/triagemController');

router.post('/:id/triagem', triagemController.registrarTriagem);

module.exports = router;
