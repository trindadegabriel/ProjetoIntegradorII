const inputNumero = document.getElementById('numero_atendimento');
const dadosPaciente = document.getElementById('dados-paciente');
const cardTriagem = document.getElementById('card-triagem');
const formTriagem = document.getElementById('form-triagem');
const mensagemTriagem = document.getElementById('mensagem-triagem');

let atendimentoAtual = null;

function mostrarMensagem(elemento, texto, tipo) {
    elemento.innerHTML = `<div class="mensagem ${tipo}">${texto}</div>`;
}

document.getElementById('btn-buscar').addEventListener('click', async () => {
    const numero = inputNumero.value.trim();
    if (!numero) return;

    const resposta = await fetch(`/api/atendimentos?numero=${encodeURIComponent(numero)}`);
    const lista = await resposta.json();
    const encontrado = lista.find(a => a.numero_atendimento.toUpperCase() === numero.toUpperCase());

    if (!encontrado) {
        dadosPaciente.innerHTML = '<div class="mensagem erro">Atendimento não encontrado.</div>';
        cardTriagem.style.display = 'none';
        return;
    }

    if (encontrado.status !== 'aguardando_triagem') {
        dadosPaciente.innerHTML = `<div class="mensagem erro">Este atendimento não está aguardando triagem (status atual: ${encontrado.status}).</div>`;
        cardTriagem.style.display = 'none';
        return;
    }

    atendimentoAtual = encontrado;
    dadosPaciente.innerHTML = `
        <div class="mensagem sucesso">
            Paciente: <strong>${encontrado.nome_completo}</strong><br>
            Nascimento: ${encontrado.data_nascimento}
        </div>`;
    cardTriagem.style.display = 'block';
});

formTriagem.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    if (!atendimentoAtual) return;

    const corpo = {
        pressao_arterial: document.getElementById('pressao_arterial').value,
        temperatura_corporal: document.getElementById('temperatura_corporal').value || null,
        batimentos_cardiacos: document.getElementById('batimentos_cardiacos').value || null,
        queixas: document.getElementById('queixas').value,
        classificacao_manchester: document.getElementById('classificacao_manchester').value
    };

    const resposta = await fetch(`/api/atendimentos/${atendimentoAtual.id}/triagem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo)
    });
    const dados = await resposta.json();

    if (resposta.ok) {
        mostrarMensagem(mensagemTriagem, 'Triagem registrada. Paciente encaminhado ao médico.', 'sucesso');
        formTriagem.reset();
        cardTriagem.style.display = 'none';
        dadosPaciente.innerHTML = '';
        inputNumero.value = '';
        atendimentoAtual = null;
    } else {
        mostrarMensagem(mensagemTriagem, dados.erro, 'erro');
    }
});
