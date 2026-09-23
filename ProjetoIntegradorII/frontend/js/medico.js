const tabelaPainel = document.getElementById('tabela-painel');
const cardAtendimento = document.getElementById('card-atendimento');
const detalhesAtendimento = document.getElementById('detalhes-atendimento');
const numeroAtual = document.getElementById('numero-atual');
const mensagemMedico = document.getElementById('mensagem-medico');

let atendimentoId = null;

function mostrarMensagem(texto, tipo) {
    mensagemMedico.innerHTML = `<div class="mensagem ${tipo}">${texto}</div>`;
    setTimeout(() => { mensagemMedico.innerHTML = ''; }, 4000);
}

async function carregarPainel() {
    const resposta = await fetch('/api/medico/painel');
    const dados = await resposta.json();

    tabelaPainel.innerHTML = '';
    dados.forEach(a => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${a.numero_atendimento}</td>
            <td>${a.nome_completo}</td>
            <td>${a.data_nascimento}</td>
            <td><span class="badge ${a.classificacao_manchester}">${a.classificacao_manchester}</span></td>
            <td><button data-id="${a.id}" class="btn-chamar">Chamar</button></td>
        `;
        tabelaPainel.appendChild(linha);
    });

    document.querySelectorAll('.btn-chamar').forEach(botao => {
        botao.addEventListener('click', () => abrirAtendimento(botao.dataset.id));
    });
}

async function abrirAtendimento(id) {
    const resposta = await fetch(`/api/medico/${id}`);
    const a = await resposta.json();

    atendimentoId = id;
    numeroAtual.textContent = a.numero_atendimento;
    detalhesAtendimento.innerHTML = `
        <p><strong>Paciente:</strong> ${a.nome_completo} — Nascimento: ${a.data_nascimento}</p>
        <p><strong>Pressão arterial:</strong> ${a.pressao_arterial || '-'} |
           <strong>Temperatura:</strong> ${a.temperatura_corporal || '-'} °C |
           <strong>Batimentos:</strong> ${a.batimentos_cardiacos || '-'} bpm</p>
        <p><strong>Queixas:</strong> ${a.queixas || '-'}</p>
        <p><strong>Classificação:</strong> <span class="badge ${a.classificacao_manchester}">${a.classificacao_manchester}</span></p>
    `;
    document.getElementById('medicacoes').value = a.medicacoes || '';
    cardAtendimento.style.display = 'block';
}

document.getElementById('btn-salvar-medicacoes').addEventListener('click', async () => {
    if (!atendimentoId) return;
    const medicacoes = document.getElementById('medicacoes').value;

    const resposta = await fetch(`/api/medico/${atendimentoId}/medicacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicacoes })
    });
    const dados = await resposta.json();
    mostrarMensagem(dados.mensagem || dados.erro, resposta.ok ? 'sucesso' : 'erro');
});

document.getElementById('btn-confirmar').addEventListener('click', async () => {
    if (!atendimentoId) return;
    if (!confirm('Confirmar este atendimento? Ele sairá da fila do painel.')) return;

    const resposta = await fetch(`/api/medico/${atendimentoId}/confirmar`, { method: 'PUT' });
    const dados = await resposta.json();
    mostrarMensagem(dados.mensagem || dados.erro, resposta.ok ? 'sucesso' : 'erro');

    if (resposta.ok) {
        cardAtendimento.style.display = 'none';
        atendimentoId = null;
        carregarPainel();
    }
});

carregarPainel();
setInterval(carregarPainel, 15000); // atualiza o painel a cada 15s
