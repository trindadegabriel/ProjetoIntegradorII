const API = '/api/atendimentos';

const formRecepcao = document.getElementById('form-recepcao');
const mensagemRecepcao = document.getElementById('mensagem-recepcao');
const tabelaAtendimentos = document.getElementById('tabela-atendimentos');
const buscaNumero = document.getElementById('busca-numero');

function mostrarMensagem(elemento, texto, tipo) {
    elemento.innerHTML = `<div class="mensagem ${tipo}">${texto}</div>`;
    setTimeout(() => { elemento.innerHTML = ''; }, 4000);
}

const STATUS_LABEL = {
    aguardando_triagem: 'Aguardando triagem',
    aguardando_medico: 'Aguardando médico',
    confirmado: 'Confirmado',
    cancelado: 'Cancelado'
};

async function carregarAtendimentos() {
    const numero = buscaNumero.value.trim();
    const url = numero ? `${API}?numero=${encodeURIComponent(numero)}` : API;
    const resposta = await fetch(url);
    const dados = await resposta.json();

    tabelaAtendimentos.innerHTML = '';
    dados.forEach(a => {
        const podeEditar = a.status !== 'confirmado' && a.status !== 'cancelado';
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${a.numero_atendimento}</td>
            <td>${a.nome_completo}</td>
            <td>${STATUS_LABEL[a.status] || a.status}</td>
            <td>
                ${podeEditar ? `<button data-id="${a.id}" class="btn-cancelar secundario">Cancelar</button>` : ''}
            </td>
        `;
        tabelaAtendimentos.appendChild(linha);
    });

    document.querySelectorAll('.btn-cancelar').forEach(botao => {
        botao.addEventListener('click', async () => {
            if (!confirm('Cancelar este atendimento?')) return;
            const resposta = await fetch(`${API}/${botao.dataset.id}`, { method: 'DELETE' });
            const dados = await resposta.json();
            mostrarMensagem(mensagemRecepcao, dados.mensagem || dados.erro, resposta.ok ? 'sucesso' : 'erro');
            carregarAtendimentos();
        });
    });
}

formRecepcao.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const corpo = {
        nome_completo: document.getElementById('nome_completo').value,
        data_nascimento: document.getElementById('data_nascimento').value,
        cpf: document.getElementById('cpf').value,
        rg: document.getElementById('rg').value,
        endereco: document.getElementById('endereco').value,
        nome_pai: document.getElementById('nome_pai').value,
        nome_mae: document.getElementById('nome_mae').value
    };

    const resposta = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo)
    });
    const dados = await resposta.json();

    if (resposta.ok) {
        mostrarMensagem(mensagemRecepcao, `Atendimento ${dados.numero_atendimento} registrado com sucesso.`, 'sucesso');
        formRecepcao.reset();
        carregarAtendimentos();
    } else {
        mostrarMensagem(mensagemRecepcao, dados.erro, 'erro');
    }
});

buscaNumero.addEventListener('input', carregarAtendimentos);

carregarAtendimentos();
