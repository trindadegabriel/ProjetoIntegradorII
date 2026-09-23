const pool = require('../config/db');

// Cria o paciente e abre um novo atendimento (Recepção)
async function criarAtendimento(req, res) {
    const {
        nome_completo, endereco, rg, cpf,
        nome_pai, nome_mae, data_nascimento
    } = req.body;

    if (!nome_completo || !cpf || !data_nascimento) {
        return res.status(400).json({ erro: 'nome_completo, cpf e data_nascimento são obrigatórios.' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const paciente = await client.query(
            `INSERT INTO pacientes (nome_completo, endereco, rg, cpf, nome_pai, nome_mae, data_nascimento)
             VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
            [nome_completo, endereco, rg, cpf, nome_pai, nome_mae, data_nascimento]
        );

        const atendimentoInsert = await client.query(
            `INSERT INTO atendimentos (numero_atendimento, paciente_id, status)
             VALUES ('TEMP', $1, 'aguardando_triagem') RETURNING id`,
            [paciente.rows[0].id]
        );

        const numeroAtendimento = 'AT' + String(atendimentoInsert.rows[0].id).padStart(4, '0');

        await client.query(
            `UPDATE atendimentos SET numero_atendimento = $1 WHERE id = $2`,
            [numeroAtendimento, atendimentoInsert.rows[0].id]
        );

        await client.query('COMMIT');

        return res.status(201).json({
            id: atendimentoInsert.rows[0].id,
            numero_atendimento: numeroAtendimento,
            paciente_id: paciente.rows[0].id
        });
    } catch (erro) {
        await client.query('ROLLBACK');
        console.error(erro);
        return res.status(500).json({ erro: 'Erro ao criar atendimento.' });
    } finally {
        client.release();
    }
}

// Lista todos os atendimentos (com filtro opcional por status ou número)
async function listarAtendimentos(req, res) {
    const { status, numero } = req.query;
    const condicoes = [];
    const valores = [];

    if (status) {
        valores.push(status);
        condicoes.push(`a.status = $${valores.length}`);
    }
    if (numero) {
        valores.push(`%${numero}%`);
        condicoes.push(`a.numero_atendimento ILIKE $${valores.length}`);
    }

    const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';

    try {
        const resultado = await pool.query(
            `SELECT a.id, a.numero_atendimento, a.status, a.criado_em,
                    p.nome_completo, p.data_nascimento, p.cpf
             FROM atendimentos a
             JOIN pacientes p ON p.id = a.paciente_id
             ${where}
             ORDER BY a.criado_em DESC`,
            valores
        );
        return res.json(resultado.rows);
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({ erro: 'Erro ao listar atendimentos.' });
    }
}

// Consulta um atendimento específico
async function consultarAtendimento(req, res) {
    const { id } = req.params;
    try {
        const resultado = await pool.query(
            `SELECT a.*, p.nome_completo, p.endereco, p.rg, p.cpf, p.nome_pai, p.nome_mae, p.data_nascimento
             FROM atendimentos a
             JOIN pacientes p ON p.id = a.paciente_id
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

// Altera os dados do paciente/atendimento (somente se ainda não confirmado pelo médico)
async function alterarAtendimento(req, res) {
    const { id } = req.params;
    const { nome_completo, endereco, rg, cpf, nome_pai, nome_mae, data_nascimento } = req.body;

    try {
        const atendimento = await pool.query('SELECT status, paciente_id FROM atendimentos WHERE id = $1', [id]);
        if (atendimento.rows.length === 0) {
            return res.status(404).json({ erro: 'Atendimento não encontrado.' });
        }
        if (atendimento.rows[0].status === 'confirmado') {
            return res.status(400).json({ erro: 'Não é possível alterar um atendimento já confirmado pelo médico.' });
        }

        await pool.query(
            `UPDATE pacientes SET nome_completo=$1, endereco=$2, rg=$3, cpf=$4, nome_pai=$5, nome_mae=$6, data_nascimento=$7
             WHERE id = $8`,
            [nome_completo, endereco, rg, cpf, nome_pai, nome_mae, data_nascimento, atendimento.rows[0].paciente_id]
        );
        await pool.query(`UPDATE atendimentos SET atualizado_em = NOW() WHERE id = $1`, [id]);

        return res.json({ mensagem: 'Atendimento atualizado com sucesso.' });
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({ erro: 'Erro ao alterar atendimento.' });
    }
}

// Cancela um atendimento (somente se ainda não confirmado pelo médico)
async function cancelarAtendimento(req, res) {
    const { id } = req.params;
    try {
        const atendimento = await pool.query('SELECT status FROM atendimentos WHERE id = $1', [id]);
        if (atendimento.rows.length === 0) {
            return res.status(404).json({ erro: 'Atendimento não encontrado.' });
        }
        if (atendimento.rows[0].status === 'confirmado') {
            return res.status(400).json({ erro: 'Não é possível cancelar um atendimento já confirmado pelo médico.' });
        }

        await pool.query(`UPDATE atendimentos SET status = 'cancelado', atualizado_em = NOW() WHERE id = $1`, [id]);
        return res.json({ mensagem: 'Atendimento cancelado com sucesso.' });
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({ erro: 'Erro ao cancelar atendimento.' });
    }
}

module.exports = {
    criarAtendimento,
    listarAtendimentos,
    consultarAtendimento,
    alterarAtendimento,
    cancelarAtendimento
};
