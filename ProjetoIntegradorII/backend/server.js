const express = require('express');
const path = require('path');
require('dotenv').config();

const atendimentoRoutes = require('./routes/atendimentoRoutes');
const triagemRoutes = require('./routes/triagemRoutes');
const medicoRoutes = require('./routes/medicoRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve o front-end estático
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Rotas da API
app.use('/api/atendimentos', atendimentoRoutes);
app.use('/api/atendimentos', triagemRoutes); // POST /api/atendimentos/:id/triagem
app.use('/api/medico', medicoRoutes);

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
