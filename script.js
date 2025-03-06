let pacientes = []; // Array para armazenar os pacientes
let pacienteEditando = null; // Armazena o paciente sendo editado

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
    pacienteEditando = pacientes[index];

    // Preenche os campos de texto
    document.getElementById('editarNomeTexto').textContent = pacienteEditando.nome;
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
        'editarNome', 'editarDataNascimento', 'editarForcaOperativa',
        'editarPeso', 'editarAltura', 'editarCircAbdominal',
        'editarPressaoArterial', 'editarBatimentos', 'editarGlicemia'
    ];

    campos.forEach(campo => {
        const campoInput = document.getElementById(campo);
        if (campoInput.style.display !== 'none') {
            const campoTexto = document.getElementById(`${campo}Texto`);
            campoTexto.textContent = campoInput.value;
            campoTexto.style.display = 'inline-block';
            campoInput.style.display = 'none';

            // Atualiza o paciente no array
            pacienteEditando[campo.replace('editar', '').toLowerCase()] = campoInput.value;
        }
    });

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
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    });
});