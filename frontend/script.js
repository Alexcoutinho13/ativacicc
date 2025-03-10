let pacientes = [];
let pacienteEditando = null;
let paginaAtual = 1;
const pacientesPorPagina = 10;
let filtroAtual = 'todos';

const API_URL = '/pacientes'; // Relativo, funciona localmente e no Render

// Função para exibir alertas
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${type}`;
    alertDiv.innerHTML = `
        ${message}
        <span class="close-alert">×</span>
    `;
    document.body.appendChild(alertDiv);

    setTimeout(() => alertDiv.classList.add('show'), 10);
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 300);
    }, 5000);

    alertDiv.querySelector('.close-alert').addEventListener('click', () => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 300);
    });
}

// Função para abrir o modal do formulário
document.getElementById('abrirModalFormulario').addEventListener('click', function () {
    document.getElementById('modalFormulario').style.display = 'flex';
});

// Fechar modais
document.querySelectorAll('.close').forEach(close => {
    close.addEventListener('click', () => {
        const modal = close.closest('.modal');
        if (modal) modal.style.display = 'none';
    });
});



// Adicionar paciente ao enviar o formulário
document.getElementById('avaliacaoForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const paciente = {
        nome: document.getElementById('nome').value,
        matricula: document.getElementById('matricula').value,
        dataNascimento: document.getElementById('dataNascimento').value,
        forcaOperativa: document.getElementById('forcaOperativa').value,
        peso: parseFloat(document.getElementById('peso').value),
        altura: parseInt(document.getElementById('altura').value),
        circAbdominal: parseInt(document.getElementById('circAbdominal').value),
        pressaoArterial: document.getElementById('pressaoArterial').value,
        batimentos: parseInt(document.getElementById('batimentos').value),
        glicemia: parseInt(document.getElementById('glicemia').value),
        observacoesMedicas: "",
        status: 0
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paciente)
        });
        if (response.ok) {
            showAlert('Paciente cadastrado com sucesso!');
            event.target.reset();
            document.getElementById('modalFormulario').style.display = 'none';
            await carregarPacientes();
        } else {
            throw new Error('Erro ao cadastrar paciente');
        }
    } catch (error) {
        showAlert(error.message || 'Erro ao cadastrar paciente', 'error');
    }
});

// Carregar pacientes do backend
async function carregarPacientes() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Erro ao carregar pacientes');
        pacientes = await response.json();
        pacientes.forEach(p => p.idade = calcularIdade(p.dataNascimento));
        pacientes.sort((a, b) => a.nome.localeCompare(b.nome));
        atualizarTabela();
    } catch (error) {
        showAlert(error.message || 'Erro ao carregar pacientes', 'error');
    }
}

function calcularIdade(dataNascimento) {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) idade--;
    return idade;
}

function atualizarTabela() {
    const tabela = document.getElementById('tabelaPacientes').getElementsByTagName('tbody')[0];
    tabela.innerHTML = "";

    let pacientesFiltrados = pacientes;
    if (filtroAtual === 'ligado') {
        pacientesFiltrados = pacientes.filter(p => p.status);
    } else if (filtroAtual === 'desligado') {
        pacientesFiltrados = pacientes.filter(p => !p.status);
    }

    const inicio = (paginaAtual - 1) * pacientesPorPagina;
    const fim = inicio + pacientesPorPagina;
    const pacientesPagina = pacientesFiltrados.slice(inicio, fim);

    pacientesPagina.forEach((paciente, index) => {
        const newRow = tabela.insertRow();
        newRow.innerHTML = `
            <td>${paciente.nome}</td>
            <td>${paciente.matricula}</td>
            <td>${paciente.idade}</td>
            <td>${paciente.forcaOperativa}</td>
            <td>
                <button class="toggle-btn ${paciente.status ? 'ligado' : 'desligado'}" onclick="alternarStatus(${paciente.id})">
                    ${paciente.status ? 'Sim' : 'Não'}
                </button>
            </td>
            <td class="acoes">
                <button class="editar" onclick="abrirModalEditar(${paciente.id})"><i class="fas fa-edit"></i></button>
                <button class="excluir" onclick="abrirModalExcluir(${paciente.id})"><i class="fas fa-trash"></i></button>
                <button class="detalhar" onclick="abrirModalDetalhar(${paciente.id})"><i class="fas fa-info-circle"></i></button>
                <button class="medico" onclick="abrirModalInfoMedicas(${paciente.id})"><i class="fas fa-user-md"></i></button>
            </td>
        `;
    });

    atualizarPaginacao(pacientesFiltrados.length);
}

async function alternarStatus(id) {
    const paciente = pacientes.find(p => p.id === id);
    paciente.status = paciente.status ? 0 : 1;
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paciente)
        });
        if (response.ok) {
            showAlert('Status atualizado com sucesso!');
            atualizarTabela();
        } else {
            throw new Error('Erro ao atualizar status');
        }
    } catch (error) {
        showAlert(error.message || 'Erro ao atualizar status', 'error');
    }
}

function atualizarPaginacao(totalPacientes) {
    const paginacao = document.querySelector('.paginacao');
    paginacao.innerHTML = "";
    const totalPaginas = Math.ceil(totalPacientes / pacientesPorPagina);

    for (let i = 1; i <= totalPaginas; i++) {
        const botao = document.createElement('button');
        botao.textContent = i;
        botao.addEventListener('click', () => {
            paginaAtual = i;
            atualizarTabela();
        });
        if (i === paginaAtual) botao.classList.add('ativo');
        paginacao.appendChild(botao);
    }
}

function filtrarPorToggle(filtro) {
    filtroAtual = filtro;
    paginaAtual = 1;
    atualizarTabela();

    document.querySelectorAll('.filtro-btn').forEach(btn => btn.classList.remove('ativo'));
    document.getElementById(`filtro${filtro.charAt(0).toUpperCase() + filtro.slice(1)}`).classList.add('ativo');
}

function abrirModalEditar(id) {
    pacienteEditando = pacientes.find(p => p.id === id);

    document.getElementById('editarNomeTexto').textContent = pacienteEditando.nome;
    document.getElementById('editarMatriculaTexto').textContent = pacienteEditando.matricula;
    document.getElementById('editarDataNascimentoTexto').textContent = pacienteEditando.dataNascimento;
    document.getElementById('editarForcaOperativaTexto').textContent = pacienteEditando.forcaOperativa;
    document.getElementById('editarPesoTexto').textContent = pacienteEditando.peso;
    document.getElementById('editarAlturaTexto').textContent = pacienteEditando.altura;
    document.getElementById('editarCircAbdominalTexto').textContent = pacienteEditando.circAbdominal;
    document.getElementById('editarPressaoArterialTexto').textContent = pacienteEditando.pressaoArterial;
    document.getElementById('editarBatimentosTexto').textContent = pacienteEditando.batimentos;
    document.getElementById('editarGlicemiaTexto').textContent = pacienteEditando.glicemia;

    document.getElementById('modalEditar').style.display = 'flex';
}

function editarCampo(idCampo) {
    const campoTexto = document.getElementById(`${idCampo}Texto`);
    const campoInput = document.getElementById(idCampo);
    campoTexto.style.display = 'none';
    campoInput.style.display = 'inline-block';
    campoInput.value = campoTexto.textContent;
    campoInput.focus();
}

async function salvarEdicao() {
    const campos = [
        { id: 'editarNome', chave: 'nome' },
        { id: 'editarMatricula', chave: 'matricula' },
        { id: 'editarDataNascimento', chave: 'dataNascimento' },
        { id: 'editarForcaOperativa', chave: 'forcaOperativa' },
        { id: 'editarPeso', chave: 'peso' },
        { id: 'editarAltura', chave: 'altura' },
        { id: 'editarCircAbdominal', chave: 'circAbdominal' },
        { id: 'editarPressaoArterial', chave: 'pressaoArterial' },
        { id: 'editarBatimentos', chave: 'batimentos' },
        { id: 'editarGlicemia', chave: 'glicemia' }
    ];

    campos.forEach(({ id, chave }) => {
        const campoInput = document.getElementById(id);
        if (campoInput.style.display !== 'none') {
            const campoTexto = document.getElementById(`${id}Texto`);
            campoTexto.textContent = campoInput.value;
            campoTexto.style.display = 'inline-block';
            campoInput.style.display = 'none';
            pacienteEditando[chave] = campoInput.value;
        }
    });

    pacienteEditando.idade = calcularIdade(pacienteEditando.dataNascimento);

    try {
        const response = await fetch(`${API_URL}/${pacienteEditando.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pacienteEditando)
        });
        if (response.ok) {
            showAlert('Paciente atualizado com sucesso!');
            await carregarPacientes();
            document.getElementById('modalEditar').style.display = 'none';
        } else {
            throw new Error('Erro ao atualizar paciente');
        }
    } catch (error) {
        showAlert(error.message || 'Erro ao atualizar paciente', 'error');
    }
}

function abrirModalExcluir(id) {
    const modal = document.getElementById('modalExcluir');
    modal.style.display = 'flex';

    document.getElementById('confirmarExclusao').onclick = async function () {
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (response.ok) {
                showAlert('Paciente excluído com sucesso!');
                await carregarPacientes();
                modal.style.display = 'none';
            } else {
                throw new Error('Erro ao excluir paciente');
            }
        } catch (error) {
            showAlert(error.message || 'Erro ao excluir paciente', 'error');
        }
    };

    document.getElementById('cancelarExclusao').onclick = function () {
        modal.style.display = 'none';
    };
}

function abrirModalDetalhar(id) {
    const paciente = pacientes.find(p => p.id === id);
    if (!paciente) {
        showAlert('Paciente não encontrado.', 'error');
        return;
    }

    const detalhes = `
        <p><strong>Nome:</strong> ${paciente.nome}</p>
        <p><strong>Idade:</strong> ${paciente.idade}</p>
        <p><strong>Força Operativa:</strong> ${paciente.forcaOperativa}</p>
        <p><strong>Peso:</strong> ${paciente.peso} kg</p>
        <p><strong>Altura:</strong> ${paciente.altura} cm</p>
        <p><strong>Circunferência Abdominal:</strong> ${paciente.circAbdominal} cm</p>
        <p><strong>Pressão Arterial:</strong> ${paciente.pressaoArterial}</p>
        <p><strong>Batimentos Cardíacos:</strong> ${paciente.batimentos} bpm</p>
        <p><strong>Glicemia:</strong> ${paciente.glicemia} mg/dL</p>
        <p><strong>Observações Médicas:</strong> ${paciente.observacoesMedicas || 'Nenhuma'}</p>
        <button onclick="imprimirInformacoes(${paciente.id})">Imprimir</button>
    `;
    document.getElementById('detalhesPaciente').innerHTML = detalhes;
    document.getElementById('modalDetalhar').style.display = 'flex';
}

function abrirModalInfoMedicas(id) {
    const paciente = pacientes.find(p => p.id === id);
    document.getElementById('observacoesMedicas').value = paciente.observacoesMedicas;

    const modal = document.getElementById('modalInfoMedicas');
    modal.style.display = 'flex';

    document.getElementById('formInfoMedicas').onsubmit = async function (event) {
        event.preventDefault();
        paciente.observacoesMedicas = document.getElementById('observacoesMedicas').value;
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paciente)
            });
            if (response.ok) {
                showAlert('Observações médicas salvas com sucesso!');
                await carregarPacientes();
                modal.style.display = 'none';
            } else {
                throw new Error('Erro ao salvar observações');
            }
        } catch (error) {
            showAlert(error.message || 'Erro ao salvar observações', 'error');
        }
    };
}

function filtrarPacientes() {
    const termo = document.getElementById('busca').value.toLowerCase();
    const pacientesFiltrados = pacientes.filter(p => p.nome.toLowerCase().includes(termo));
    atualizarTabelaComFiltro(pacientesFiltrados);
}

function atualizarTabelaComFiltro(pacientesFiltrados) {
    const tabela = document.getElementById('tabelaPacientes').getElementsByTagName('tbody')[0];
    tabela.innerHTML = "";

    const inicio = (paginaAtual - 1) * pacientesPorPagina;
    const fim = inicio + pacientesPorPagina;
    const pacientesPagina = pacientesFiltrados.slice(inicio, fim);

    pacientesPagina.forEach((paciente, index) => {
        const newRow = tabela.insertRow();
        newRow.innerHTML = `
            <td>${paciente.nome}</td>
            <td>${paciente.matricula}</td>
            <td>${paciente.idade}</td>
            <td>${paciente.forcaOperativa}</td>
            <td>
                <button class="toggle-btn ${paciente.status ? 'ligado' : 'desligado'}" onclick="alternarStatus(${paciente.id})">
                    ${paciente.status ? 'Sim' : 'Não'}
                </button>
            </td>
            <td class="acoes">
                <button class="editar" onclick="abrirModalEditar(${paciente.id})"><i class="fas fa-edit"></i></button>
                <button class="excluir" onclick="abrirModalExcluir(${paciente.id})"><i class="fas fa-trash"></i></button>
                <button class="detalhar" onclick="abrirModalDetalhar(${paciente.id})"><i class="fas fa-info-circle"></i></button>
                <button class="medico" onclick="abrirModalInfoMedicas(${paciente.id})"><i class="fas fa-user-md"></i></button>
            </td>
        `;
    });

    atualizarPaginacao(pacientesFiltrados.length);
}

function imprimirInformacoes(id) {
    const paciente = pacientes.find(p => p.id === id);
    if (!paciente) {
        console.error('Paciente não encontrado');
        showAlert('Paciente não encontrado. Selecione um paciente válido.', 'error');
        return;
    }

    const conteudo = `
        <h2>Informações do Paciente</h2>
        <table>
            <tr><th>Campo</th><th>Valor</th></tr>
            <tr><td>Nome</td><td>${paciente.nome}</td></tr>
            <tr><td>Idade</td><td>${paciente.idade}</td></tr>
            <tr><td>Força Operativa</td><td>${paciente.forcaOperativa}</td></tr>
            <tr><td>Peso</td><td>${paciente.peso} kg</td></tr>
            <tr><td>Altura</td><td>${paciente.altura} cm</td></tr>
            <tr><td>Circunferência Abdominal</td><td>${paciente.circAbdominal} cm</td></tr>
            <tr><td>Pressão Arterial</td><td>${paciente.pressaoArterial}</td></tr>
            <tr><td>Batimentos Cardíacos</td><td>${paciente.batimentos} bpm</td></tr>
            <tr><td>Glicemia</td><td>${paciente.glicemia} mg/dL</td></tr>
            <tr><td>Observações Médicas</td><td class="observacoes">${paciente.observacoesMedicas || 'Nenhuma'}</td></tr>
        </table>
    `;

    const janelaImpressao = window.open('', '', 'width=600,height=600');
    if (!janelaImpressao) {
        showAlert('A janela de impressão foi bloqueada. Desative o bloqueador de pop-ups e tente novamente.', 'error');
        return;
    }

    janelaImpressao.document.write(`
<html>
        <head>
            <title>Informações do Paciente - ${paciente.nome}</title>
            <style>
                @page {
                    size: A4;
                    margin: 20mm;
                }
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20mm;
                }
                h2 {
                    color: #007bff;
                    text-align: center;
                    margin-bottom: 20px;
                    font-size: 20px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 14px;
                }
                th, td {
                    border: 1px solid #000;
                    padding: 8px;
                    text-align: left;
                    vertical-align: top;
                }
                th {
                    background-color: #f2f2f2;
                    font-weight: bold;
                    width: 40%; /* Primeira coluna com largura fixa razoável */
                    min-width: 120px; /* Garante um tamanho mínimo para evitar compressão excessiva */
                }
                td {
                    width: 60%; /* Segunda coluna com mais espaço */
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    white-space: normal; /* Quebra de linha natural */
                    min-width: 200px; /* Evita que a coluna fique muito estreita */
                }
                .observacoes {
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    white-space: normal;
                }
                @media print {
                    body {
                        margin: 0;
                    }
                    table {
                        page-break-inside: auto;
                    }
                    tr {
                        page-break-inside: avoid;
                        page-break-after: auto;
                    }
                }
            </style>
        </head>
        <body>
            <h2>Informações do Paciente</h2>
            <table>
                <tr><th>Campo</th><th>Valor</th></tr>
                <tr><td>Nome</td><td>ALEX COITINHO ARALUO</td></tr>
                <tr><td>Idade</td><td>38</td></tr>
                <tr><td>Força Operativa</td><td>Corpo de Bombeiros Militar</td></tr>
                <tr><td>Peso</td><td>96 kg</td></tr>
                <tr><td>Altura</td><td>176 cm</td></tr>
                <tr><td>Circunferência Abdominal</td><td>1 cm</td></tr>
                <tr><td>Pressão Arterial</td><td>1</td></tr>
                <tr><td>Batimentos Cardíacos</td><td>1 bpm</td></tr>
                <tr><td>Glicemia</td><td>1 mg/dL</td></tr>
                <tr><td>Observações Médicas</td><td class="observacoes"></td></tr>
            </table>
        </body>
    </html>
    `);
    janelaImpressao.document.close();

    janelaImpressao.onload = function () {
        janelaImpressao.print();
        janelaImpressao.onafterprint = function () {
            janelaImpressao.close();
        };
    };
}

// Carrega os pacientes ao iniciar
carregarPacientes();