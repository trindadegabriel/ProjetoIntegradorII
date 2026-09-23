const pool = require('../config/db');

const CLASSIFICACOES_VALIDAS = ['vermelho', 'laranja', 'amarelo', 'verde', 'azul'];

// Registra a triagem de enfermagem e a classificação de Manchester
async function registrarTriagem(req, res) {
    const { id } = req.params; // id do atendimento
    const {
        pressao_arterial, temperatura_corporal, batimentos_cardiacos,
        queixas, classificacao_manchester
    } = req.body;

    const classificacao = (classificacao_manchester || '').toLowerCase();
    if (!CLASSIFICACOES_VALIDAS.includes(classificacao)) {
        return res.status(400).json({
            erro: `classificacao_manchester inválida. Use uma das opções: ${CLASSIFICACOES_VALIDAS.join(', ')}.`
        });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const atendimento = await client.query('SELECT status FROM atendimentos WHERE id = $1 FOR UPDATE', [id]);
        if (atendimento.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ erro: 'Atendimento não encontrado.' });
        }
        if (atendimento.rows[0].status !== 'aguardando_triagem') {
            await client.query('ROLLBACK');
            return res.status(400).json({ erro: 'Este atendimento não está aguardando triagem.' });
        }

        await client.query(
            `INSERT INTO triagens (atendimento_id, pressao_arterial, temperatura_corporal, batimentos_cardiacos, queixas, classificacao_manchester)
             VALUES ($1,$2,$3,$4,$5,$6)`,
            [id, pressao_arterial, temperatura_corporal, batimentos_cardiacos, queixas, classificacao]
        );

        await client.query(
            `UPDATE atendimentos SET status = 'aguardando_medico', atualizado_em = NOW() WHERE id = $1`,
            [id]
        );

        await client.query('COMMIT');
        return res.status(201).json({ mensagem: 'Triagem registrada com sucesso.' });
    } catch (erro) {
        await client.query('ROLLBACK');
        console.error(erro);
        return res.status(500).json({ erro: 'Erro ao registrar triagem.' });
    } finally {
        client.release();
    }
}

module.exports = { registrarTriagem };
