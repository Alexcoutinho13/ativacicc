const API_URL = 'http://localhost:3000'; // URL da API local (substitua pela URL do Render/Heroku depois)

let pacientes = []; // Array para armazenar os pacientes
let pacienteEditandoIndex = null; // Índice do paciente sendo editado (mantido para edição, mas ajustado para outros usos)
let paginaAtual = 1; // Página atual da paginação
const pacientesPorPagina = 10; // Número de pacientes por página
let filtroAtual = 'todos'; // Filtro atual: 'todos', 'ligado', 'desligado'

// Função para abrir o modal do formulário
document.getElementById('abrirModalFormulario').addEventListener('click', function () {
    document.getElementById('modalFormulario').style.display = 'flex';
});

// Fechar o modal do formulário ao clicar no "X"
document.querySelector('#modalFormulario .close').addEventListener('click', function () {
    document.getElementById('modalFormulario').style.display = 'none';
});

// Fechar o modal do formulário ao clicar fora dele
window.addEventListener('click', function (event) {
    const modal = document.getElementById('modalFormulario');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Adicionar paciente ao enviar o formulário
document.getElementById('avaliacaoForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Impede o envio do formulário

    // Coleta os dados do formulário
    const paciente = {
        nome: document.getElementById('nome').value,
        matricula: document.getElementById('matricula').value,
        dataNascimento: document.getElementById('dataNascimento').value,
        forcaOperativa: document.getElementById('forcaOperativa').value,
        peso: document.getElementById('peso').value,
        altura: document.getElementById('altura').value,
        circAbdominal: document.getElementById('circAbdominal').value,
        pressaoArterial: document.getElementById('pressaoArterial').value,
        batimentos: document.getElementById('batimentos').value,
        glicemia: document.getElementById('glicemia').value,
        observacoesMedicas: "", // Inicialmente vazio
        status: false // Status inicial desligado
    };

    // Calcula a idade
    paciente.idade = calcularIdade(paciente.dataNascimento);

    // Adiciona o paciente via API
    await adicionarPaciente(paciente);

    // Atualiza a tabela
    await atualizarTabela();

    // Limpa o formulário e fecha o modal
    event.target.reset();
    document.getElementById('modalFormulario').style.display = 'none';
});

// Função para calcular a idade
function calcularIdade(dataNascimento) {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    return idade;
}

// Função para buscar pacientes da API
async function buscarPacientes() {
    try {
        const response = await fetch(`${API_URL}/pacientes`);
        if (!response.ok) throw new Error('Erro ao buscar pacientes');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro:', error);
        return [];
    }
}

// Função para adicionar um paciente via API
async function adicionarPaciente(paciente) {
    try {
        const response = await fetch(`${API_URL}/pacientes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paciente),
        });
        if (!response.ok) throw new Error('Erro ao adicionar paciente');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        return null;
    }
}

// Função para atualizar um paciente via API
async function atualizarPaciente(id, novosDados) {
    try {
        const response = await fetch(`${API_URL}/pacientes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novosDados),
        });
        if (!response.ok) throw new Error('Erro ao atualizar paciente');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        return null;
    }
}

// Função para deletar um paciente via API
async function deletarPaciente(id) {
    try {
        const response = await fetch(`${API_URL}/pacientes/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Erro ao deletar paciente');
    } catch (error) {
        console.error('Erro:', error);
    }
}

// Função para atualizar a tabela de pacientes (modificada)
async function atualizarTabela() {
    const tabela = document.getElementById('tabelaPacientes').getElementsByTagName('tbody')[0];
    tabela.innerHTML = ""; // Limpa a tabela

    const pacientesAPI = await buscarPacientes(); // Busca os pacientes da API
    pacientes = pacientesAPI; // Atualiza o array local de pacientes

    // Filtra os pacientes com base no filtro atual
    let pacientesFiltrados = pacientes;
    if (filtroAtual === 'ligado') {
        pacientesFiltrados = pacientes.filter(paciente => paciente.status);
    } else if (filtroAtual === 'desligado') {
        pacientesFiltrados = pacientes.filter(paciente => !paciente.status);
    }

    // Filtra os pacientes para a página atual
    const inicio = (paginaAtual - 1) * pacientesPorPagina;
    const fim = inicio + pacientesPorPagina;
    const pacientesPagina = pacientesFiltrados.slice(inicio, fim);

    pacientesPagina.forEach((paciente, indexPagina) => {
        const indexGlobal = pacientes.indexOf(paciente); // Índice no array original (modificação)
        const newRow = tabela.insertRow();
        newRow.innerHTML = `
            <td>${paciente.nome}</td>
            <td>${paciente.matricula}</td>
            <td>${paciente.idade}</td>
            <td>${paciente.forcaOperativa}</td>
            <td>
                <button class="toggle-btn ${paciente.status ? 'ligado' : 'desligado'}" onclick="alternarStatus(${indexGlobal})">
                    ${paciente.status ? 'Sim' : 'Não'}
                </button>
            </td>
            <td class="acoes">
                <button class="editar" onclick="abrirModalEditar(${indexGlobal})"><i class="fas fa-edit"></i></button>
                <button class="excluir" onclick="abrirModalExcluir(${indexGlobal})"><i class="fas fa-trash"></i></button>
                <button class="detalhar" onclick="abrirModalDetalhar(${indexGlobal})"><i class="fas fa-info-circle"></i></button>
                <button class="medico" onclick="abrirModalInfoMedicas(${indexGlobal})"><i class="fas fa-user-md"></i></button>
            </td>
        `;
    });

    // Atualiza a paginação
    atualizarPaginacao(pacientesFiltrados.length);
}

// Função para alternar o status do paciente
async function alternarStatus(index) {
    const paciente = pacientes[index];
    if (!paciente) {
        console.error('Paciente não encontrado');
        return;
    }

    paciente.status = !paciente.status; // Alterna o status
    await atualizarPaciente(index, paciente); // Atualiza o paciente via API
    await atualizarTabela(); // Atualiza a tabela
}

// Função para atualizar a paginação
function atualizarPaginacao(totalPacientes) {
    const paginacao = document.querySelector('.paginacao');
    paginacao.innerHTML = ""; // Limpa a paginação

    const totalPaginas = Math.ceil(totalPacientes / pacientesPorPagina);

    for (let i = 1; i <= totalPaginas; i++) {
        const botao = document.createElement('button');
        botao.textContent = i;
        botao.addEventListener('click', () => {
            paginaAtual = i;
            atualizarTabela();
        });

        if (i === paginaAtual) {
            botao.classList.add('ativo');
        }

        paginacao.appendChild(botao);
    }
}

// Função para filtrar pacientes pelo toggle (ligado/desligado)
function filtrarPorToggle(filtro) {
    filtroAtual = filtro;
    paginaAtual = 1; // Reseta a página para a primeira
    atualizarTabela();

    // Atualiza o estado dos botões de filtro
    document.querySelectorAll('.filtro-btn').forEach(btn => btn.classList.remove('ativo'));
    document.getElementById(`filtro${filtro.charAt(0).toUpperCase() + filtro.slice(1)}`).classList.add('ativo');
}

// Função para abrir o modal de edição
function abrirModalEditar(index) {
    const paciente = pacientes[index];
    if (!paciente) {
        console.error('Paciente não encontrado');
        return;
    }

    pacienteEditandoIndex = index; // Mantido apenas para edição

    // Preenche os campos do modal de edição
    document.getElementById('editarNomeTexto').textContent = paciente.nome;
    document.getElementById('editarMatriculaTexto').textContent = paciente.matricula;
    document.getElementById('editarDataNascimentoTexto').textContent = paciente.dataNascimento;
    document.getElementById('editarForcaOperativaTexto').textContent = paciente.forcaOperativa;
    document.getElementById('editarPesoTexto').textContent = paciente.peso;
    document.getElementById('editarAlturaTexto').textContent = paciente.altura;
    document.getElementById('editarCircAbdominalTexto').textContent = paciente.circAbdominal;
    document.getElementById('editarPressaoArterialTexto').textContent = paciente.pressaoArterial;
    document.getElementById('editarBatimentosTexto').textContent = paciente.batimentos;
    document.getElementById('editarGlicemiaTexto').textContent = paciente.glicemia;

    // Exibe o modal
    document.getElementById('modalEditar').style.display = 'flex';
}

// Função para salvar a edição
async function salvarEdicao() {
    const novosDados = {
        nome: document.getElementById('editarNome').value,
        matricula: document.getElementById('editarMatricula').value,
        dataNascimento: document.getElementById('editarDataNascimento').value,
        forcaOperativa: document.getElementById('editarForcaOperativa').value,
        peso: document.getElementById('editarPeso').value,
        altura: document.getElementById('editarAltura').value,
        circAbdominal: document.getElementById('editarCircAbdominal').value,
        pressaoArterial: document.getElementById('editarPressaoArterial').value,
        batimentos: document.getElementById('editarBatimentos').value,
        glicemia: document.getElementById('editarGlicemia').value,
    };

    await atualizarPaciente(pacienteEditandoIndex, novosDados); // Salva a edição
    document.getElementById('modalEditar').style.display = 'none'; // Fecha o modal
    await atualizarTabela(); // Atualiza a tabela
}

// Função para abrir o modal de exclusão
function abrirModalExcluir(index) {
    pacienteEditandoIndex = index; // Mantido para exclusão
    document.getElementById('modalExcluir').style.display = 'flex';
}

// Função para confirmar a exclusão
async function confirmarExclusao() {
    await deletarPaciente(pacienteEditandoIndex); // Deleta o paciente
    document.getElementById('modalExcluir').style.display = 'none'; // Fecha o modal
    await atualizarTabela(); // Atualiza a tabela
}

// Função para abrir o modal de detalhes (modificada)
function abrirModalDetalhar(index) {
    const paciente = pacientes[index];
    if (!paciente) {
        console.error('Paciente não encontrado');
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
        <p><strong>Observações Médicas:</strong> ${paciente.observacoesMedicas}</p>
        <button onclick="imprimirInformacoes(${index})">Imprimir</button> <!-- Modificação: Botão de impressão com índice -->
    `;
    document.getElementById('detalhesPaciente').innerHTML = detalhes;

    // Exibe o modal
    document.getElementById('modalDetalhar').style.display = 'flex';
}

// Função para abrir o modal de informações médicas
function abrirModalInfoMedicas(index) {
    const paciente = pacientes[index];
    if (!paciente) {
        console.error('Paciente não encontrado');
        return;
    }

    pacienteEditandoIndex = index; // Mantido para informações médicas
    document.getElementById('observacoesMedicas').value = paciente.observacoesMedicas;

    // Exibe o modal
    document.getElementById('modalInfoMedicas').style.display = 'flex';
}

// Função para salvar as informações médicas
async function salvarInfoMedicas() {
    const observacoes = document.getElementById('observacoesMedicas').value;
    pacientes[pacienteEditandoIndex].observacoesMedicas = observacoes;
    await atualizarPaciente(pacienteEditandoIndex, pacientes[pacienteEditandoIndex]); // Atualiza o paciente
    document.getElementById('modalInfoMedicas').style.display = 'none'; // Fecha o modal
    await atualizarTabela(); // Atualiza a tabela
}

// Função para buscar pacientes pelo nome
function filtrarPacientes() {
    const termo = document.getElementById('busca').value.toLowerCase();
    const pacientesFiltrados = pacientes.filter(paciente =>
        paciente.nome.toLowerCase().includes(termo)
    );

    // Atualiza a tabela com os pacientes filtrados
    const tabela = document.getElementById('tabelaPacientes').getElementsByTagName('tbody')[0];
    tabela.innerHTML = "";

    pacientesFiltrados.forEach((paciente, index) => {
        const newRow = tabela.insertRow();
        newRow.innerHTML = `
            <td>${paciente.nome}</td>
            <td>${paciente.matricula}</td>
            <td>${paciente.idade}</td>
            <td>${paciente.forcaOperativa}</td>
            <td>
                <button class="toggle-btn ${paciente.status ? 'ligado' : 'desligado'}" onclick="alternarStatus(${index})">
                    ${paciente.status ? 'Sim' : 'Não'}
                </button>
            </td>
            <td class="acoes">
                <button class="editar" onclick="abrirModalEditar(${index})"><i class="fas fa-edit"></i></button>
                <button class="excluir" onclick="abrirModalExcluir(${index})"><i class="fas fa-trash"></i></button>
                <button class="detalhar" onclick="abrirModalDetalhar(${index})"><i class="fas fa-info-circle"></i></button>
                <button class="medico" onclick="abrirModalInfoMedicas(${index})"><i class="fas fa-user-md"></i></button>
            </td>
        `;
    });
}

// Função para imprimir informações (modificada)
function imprimirInformacoes(index) {
    const paciente = pacientes[index];
    if (!paciente) {
        console.error('Paciente não encontrado');
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
            <tr><td>Observações Médicas</td><td>${paciente.observacoesMedicas}</td></tr>
        </table>
    `;

    const janelaImpressao = window.open('', '', 'width=600,height=600');
    janelaImpressao.document.write(`
        <html>
            <head>
                <title>Informações do Paciente</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h2 { color: #007bff; text-align: center; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #000; padding: 10px; text-align: left; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                </style>
            </head>
            <body>
                ${conteudo}
            </body>
        </html>
    `);
    janelaImpressao.document.close();
    janelaImpressao.print();
}

// Fechar modais ao clicar no "X"
document.querySelectorAll('.modal .close').forEach(close => {
    close.addEventListener('click', () => {
        const modal = close.closest('.modal');
        if (modal) {
            modal.style.display = 'none';
        }
    });
});

// Fechar modais ao clicar fora deles
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});

// Inicializa a tabela ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    atualizarTabela();
});