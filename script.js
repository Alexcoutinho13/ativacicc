let pacientes = []; // Array para armazenar os pacientes

document.getElementById('avaliacaoForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Impede o envio do formulário

    // Coleta os dados do formulário
    const paciente = {
        nome: document.getElementById('nome').value,
        dataNascimento: document.getElementById('dataNascimento').value,
        forcaOperativa: document.getElementById('forcaOperativa').value,
        peso: document.getElementById('peso').value,
        altura: document.getElementById('altura').value,
        circAbdominal: document.getElementById('circAbdominal').value,
        pressaoArterial: document.getElementById('pressaoArterial').value,
        batimentos: document.getElementById('batimentos').value,
        glicemia: document.getElementById('glicemia').value,
        observacoesMedicas: "" // Inicialmente vazio
    };

    // Calcula a idade
    paciente.idade = calcularIdade(paciente.dataNascimento);

    // Adiciona o paciente ao array
    pacientes.push(paciente);

    // Atualiza a tabela
    atualizarTabela();

    // Limpa o formulário
    event.target.reset();
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

    pacientes.forEach((paciente, index) => {
        const newRow = tabela.insertRow();
        newRow.innerHTML = `
            <td>${paciente.nome}</td>
            <td>${paciente.idade}</td>
            <td>${paciente.forcaOperativa}</td>
            <td class="acoes">
                <button class="editar" onclick="abrirModalEditar(${index})"><i class="fas fa-edit"></i></button>
                <button class="excluir" onclick="abrirModalExcluir(${index})"><i class="fas fa-trash"></i></button>
                <button class="detalhar" onclick="abrirModalDetalhar(${index})"><i class="fas fa-info-circle"></i></button>
                <button class="medico" onclick="abrirModalInfoMedicas(${index})"><i class="fas fa-user-md"></i></button>
            </td>
        `;
    });
}

// Funções para abrir modais
function abrirModalEditar(index) {
    const paciente = pacientes[index];
    document.getElementById('editarNome').value = paciente.nome;
    document.getElementById('editarDataNascimento').value = paciente.dataNascimento;
    document.getElementById('editarForcaOperativa').value = paciente.forcaOperativa;
    document.getElementById('editarPeso').value = paciente.peso;
    document.getElementById('editarAltura').value = paciente.altura;
    document.getElementById('editarCircAbdominal').value = paciente.circAbdominal;
    document.getElementById('editarPressaoArterial').value = paciente.pressaoArterial;
    document.getElementById('editarBatimentos').value = paciente.batimentos;
    document.getElementById('editarGlicemia').value = paciente.glicemia;

    const modal = document.getElementById('modalEditar');
    modal.style.display = 'flex';

    // Atualiza o paciente ao salvar
    document.getElementById('formEditar').onsubmit = function (event) {
        event.preventDefault();
        pacientes[index] = {
            ...paciente,
            nome: document.getElementById('editarNome').value,
            dataNascimento: document.getElementById('editarDataNascimento').value,
            forcaOperativa: document.getElementById('editarForcaOperativa').value,
            peso: document.getElementById('editarPeso').value,
            altura: document.getElementById('editarAltura').value,
            circAbdominal: document.getElementById('editarCircAbdominal').value,
            pressaoArterial: document.getElementById('editarPressaoArterial').value,
            batimentos: document.getElementById('editarBatimentos').value,
            glicemia: document.getElementById('editarGlicemia').value
        };
        atualizarTabela();
        modal.style.display = 'none';
    };
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

// Função para imprimir informações
function imprimirInformacoes() {
    const conteudo = document.getElementById('detalhesPaciente').innerHTML;
    const janelaImpressao = window.open('', '', 'width=600,height=600');
    janelaImpressao.document.write(`
        <html>
            <head>
                <title>Informações do Paciente</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    h2 { color: #007bff; }
                    p { margin: 10px 0; }
                </style>
            </head>
            <body>
                <h2>Informações do Paciente</h2>
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
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    });
});