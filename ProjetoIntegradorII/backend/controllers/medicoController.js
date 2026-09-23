const pool = require('../config/db');

// Ordem de prioridade do Protocolo de Manchester (menor número = mais urgente)
const ORDEM_MANCHESTER = `CASE t.classificacao_manchester
    WHEN 'vermelho' THEN 1
    WHEN 'laranja'  THEN 2
    WHEN 'amarelo'  THEN 3
    WHEN 'verde'    THEN 4
    WHEN 'azul'     THEN 5
    ELSE 6 END`;

// Painel de Atendimentos: fila ordenada pela classificação de Manchester
async function painelAtendimentos(req, res) {
    try {
        const resultado = await pool.query(
            `SELECT a.id, a.numero_atendimento, p.nome_completo, p.data_nascimento,
                    t.classificacao_manchester, t.queixas, a.criado_em
             FROM atendimentos a
             JOIN pacientes p ON p.id = a.paciente_id
             JOIN triagens t ON t.atendimento_id = a.id
             WHERE a.status = 'aguardando_medico'
             ORDER BY ${ORDEM_MANCHESTER}, a.criado_em ASC`
        );
        return res.json(resultado.rows);
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({ erro: 'Erro ao carregar o painel de atendimentos.' });
    }
}

// Consulta os dados completos de um atendimento para a tela do médico
async function detalheAtendimento(req, res) {
    const { id } = req.params;
    try {
        const resultado = await pool.query(
            `SELECT a.id, a.numero_atendimento, a.status,
                    p.nome_completo, p.data_nascimento, p.cpf,
                    t.pressao_arterial, t.temperatura_corporal, t.batimentos_cardiacos,
                    t.queixas, t.classificacao_manchester,
                    m.medicacoes, m.confirmado_em
             FROM atendimentos a
             JOIN pacientes p ON p.id = a.paciente_id
             LEFT JOIN triagens t ON t.atendimento_id = a.id
             LEFT JOIN atendimentos_medicos m ON m.atendimento_id = a.id
             WHERE a.id = $1`,
            [id]
        );
        if (resultado.rows.length === 0) {
            return res.status(404).json({ erro: 'Atendimento não encontrado.' });
        }
        return res.json(resultado.rows[0]);
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({ erro: 'Erro ao consultar atendimento.' });
    }
}

// Registra as medicações lançadas pelo médico
async function registrarMedicacoes(req, res) {
    const { id } = req.params;
    const { medicacoes } = req.body;

    try {
        await pool.query(
            `INSERT INTO atendimentos_medicos (atendimento_id, medicacoes)
             VALUES ($1, $2)
             ON CONFLICT (atendimento_id) DO UPDATE SET medicacoes = EXCLUDED.medicacoes`,
            [id, medicacoes]
        );
        return res.json({ mensagem: 'Medicações registradas com sucesso.' });
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({ erro: 'Erro ao registrar medicações.' });
    }
}

// Confirma o atendimento médico, encerrando o fluxo do paciente
async function confirmarAtendimento(req, res) {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const atendimento = await client.query('SELECT status FROM atendimentos WHERE id = $1 FOR UPDATE', [id]);
        if (atendimento.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ erro: 'Atendimento não encontrado.' });
        }
        if (atendimento.rows[0].status !== 'aguardando_medico') {
            await client.query('ROLLBACK');
            return res.status(400).json({ erro: 'Este atendimento não está aguardando confirmação médica.' });
        }

        await client.query(
            `INSERT INTO atendimentos_medicos (atendimento_id, confirmado_em)
             VALUES ($1, NOW())
             ON CONFLICT (atendimento_id) DO UPDATE SET confirmado_em = NOW()`,
            [id]
        );
        await client.query(`UPDATE atendimentos SET status = 'confirmado', atualizado_em = NOW() WHERE id = $1`, [id]);

        await client.query('COMMIT');
        return res.json({ mensagem: 'Atendimento confirmado com sucesso.' });
    } catch (erro) {
        await client.query('ROLLBACK');
        console.error(erro);
        return res.status(500).json({ erro: 'Erro ao confirmar atendimento.' });
    } finally {
        client.release();
    }
}

module.exports = { painelAtendimentos, detalheAtendimento, registrarMedicacoes, confirmarAtendimento };
