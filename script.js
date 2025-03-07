let pacientes = []; // Array para armazenar os pacientes
let pacienteEditando = null; // Armazena o paciente sendo editado
let paginaAtual = 1; // Página atual da paginação
const pacientesPorPagina = 10; // Número de pacientes por página

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
document.getElementById('avaliacaoForm').addEventListener('submit', function (event) {
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

    // Adiciona o paciente ao array
    pacientes.push(paciente);

    // Ordena os pacientes por nome
    pacientes.sort((a, b) => a.nome.localeCompare(b.nome));

    // Atualiza a tabela
    atualizarTabela();

    // Limpa o formulário e fecha o modal
    event.target.reset();
    document.getElementById('modalFormulario').style.display = 'none';
});

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

function atualizarTabela() {
    const tabela = document.getElementById('tabelaPacientes').getElementsByTagName('tbody')[0];
    tabela.innerHTML = ""; // Limpa a tabela

    // Filtra os pacientes para a página atual
    const inicio = (paginaAtual - 1) * pacientesPorPagina;
    const fim = inicio + pacientesPorPagina;
    const pacientesPagina = pacientes.slice(inicio, fim);

    pacientesPagina.forEach((paciente, index) => {
        const newRow = tabela.insertRow();
        newRow.innerHTML = `
            <td>${paciente.nome}</td>
            <td>${paciente.matricula}</td>
            <td>${paciente.idade}</td>
            <td>${paciente.forcaOperativa}</td>
            <td>
                <button class="toggle-btn ${paciente.status ? 'ligado' : 'desligado'}" onclick="alternarStatus(${inicio + index})">
                    ${paciente.status ? 'Sim' : 'Não'}
                </button>
            </td>
            <td class="acoes">
                <button class="editar" onclick="abrirModalEditar(${inicio + index})"><i class="fas fa-edit"></i></button>
                <button class="excluir" onclick="abrirModalExcluir(${inicio + index})"><i class="fas fa-trash"></i></button>
                <button class="detalhar" onclick="abrirModalDetalhar(${inicio + index})"><i class="fas fa-info-circle"></i></button>
                <button class="medico" onclick="abrirModalInfoMedicas(${inicio + index})"><i class="fas fa-user-md"></i></button>
            </td>
        `;
    });

    // Atualiza a paginação
    atualizarPaginacao();
}

// Função para alternar o status do botão toggle
function alternarStatus(index) {
    const paciente = pacientes[index];
    paciente.status = !paciente.status; // Alterna entre true e false
    atualizarTabela(); // Atualiza a tabela para refletir o novo estado
}

function atualizarPaginacao() {
    const paginacao = document.querySelector('.paginacao');
    paginacao.innerHTML = ""; // Limpa a paginação

    const totalPaginas = Math.ceil(pacientes.length / pacientesPorPagina);

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

// Funções para abrir modais
function abrirModalEditar(index) {
    pacienteEditando = pacientes[index];

    // Preenche os campos de texto
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

    // Exibe o modal
    const modal = document.getElementById('modalEditar');
    modal.style.display = 'flex';
}

function editarCampo(idCampo) {
    const campoTexto = document.getElementById(`${idCampo}Texto`);
    const campoInput = document.getElementById(idCampo);

    // Esconde o texto e exibe o campo de edição
    campoTexto.style.display = 'none';
    campoInput.style.display = 'inline-block';
    campoInput.value = campoTexto.textContent; // Preenche o campo com o valor atual
    campoInput.focus(); // Foca no campo
}

function salvarEdicao() {
    // Atualiza os campos editados
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

            // Atualiza o paciente no array
            pacienteEditando[chave] = campoInput.value;
        }
    });

    // Recalcula a idade
    pacienteEditando.idade = calcularIdade(pacienteEditando.dataNascimento);

    // Ordena os pacientes por nome
    pacientes.sort((a, b) => a.nome.localeCompare(b.nome));

    // Atualiza a tabela e fecha o modal
    atualizarTabela();
    document.getElementById('modalEditar').style.display = 'none';
}

function abrirModalExcluir(index) {
    const modal = document.getElementById('modalExcluir');
    modal.style.display = 'flex';

    // Confirma a exclusão
    document.getElementById('confirmarExclusao').onclick = function () {
        pacientes.splice(index, 1); // Remove o paciente do array
        atualizarTabela(); // Atualiza a tabela
        modal.style.display = 'none'; // Fecha o modal
    };

    // Cancela a exclusão
    document.getElementById('cancelarExclusao').onclick = function () {
        modal.style.display = 'none'; // Fecha o modal
    };
}

function abrirModalDetalhar(index) {
    const paciente = pacientes[index];
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
    `;
    document.getElementById('detalhesPaciente').innerHTML = detalhes;

    const modal = document.getElementById('modalDetalhar');
    modal.style.display = 'flex';
}

function abrirModalInfoMedicas(index) {
    const paciente = pacientes[index];
    document.getElementById('observacoesMedicas').value = paciente.observacoesMedicas;

    const modal = document.getElementById('modalInfoMedicas');
    modal.style.display = 'flex';

    // Atualiza as informações médicas ao salvar
    document.getElementById('formInfoMedicas').onsubmit = function (event) {
        event.preventDefault();
        pacientes[index].observacoesMedicas = document.getElementById('observacoesMedicas').value;
        atualizarTabela();
        modal.style.display = 'none';
    };
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

// Função para imprimir informações
function imprimirInformacoes() {
    const paciente = pacienteEditando;
    const conteudo = `
        <h2>Informações do Paciente</h2>
        <table>
            <tr>
                <th>Campo</th>
                <th>Valor</th>
            </tr>
            <tr>
                <td>Nome</td>
                <td>${paciente.nome}</td>
            </tr>
            <tr>
                <td>Idade</td>
                <td>${paciente.idade}</td>
            </tr>
            <tr>
                <td>Força Operativa</td>
                <td>${paciente.forcaOperativa}</td>
            </tr>
            <tr>
                <td>Peso</td>
                <td>${paciente.peso} kg</td>
            </tr>
            <tr>
                <td>Altura</td>
                <td>${paciente.altura} cm</td>
            </tr>
            <tr>
                <td>Circunferência Abdominal</td>
                <td>${paciente.circAbdominal} cm</td>
            </tr>
            <tr>
                <td>Pressão Arterial</td>
                <td>${paciente.pressaoArterial}</td>
            </tr>
            <tr>
                <td>Batimentos Cardíacos</td>
                <td>${paciente.batimentos} bpm</td>
            </tr>
            <tr>
                <td>Glicemia</td>
                <td>${paciente.glicemia} mg/dL</td>
            </tr>
            <tr>
                <td>Observações Médicas</td>
                <td>${paciente.observacoesMedicas}</td>
            </tr>
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
    janelaImpressao.print(); // Abre a janela de impressão
}

// Fechar modais ao clicar no "X"
document.querySelectorAll('.close').forEach(close => {
    close.addEventListener('click', () => {
        const modal = close.closest('.modal');
        if (modal) {
            modal.style.display = 'none';
        }
    });
});