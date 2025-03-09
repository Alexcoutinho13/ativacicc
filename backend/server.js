const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const ExcelJS = require('exceljs');  // Importe a biblioteca
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend')));

// Conexão com o banco SQLite
const db = new sqlite3.Database('./pacientes.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco SQLite');
    }
});

// Criação da tabela de pacientes (mantido como estava)
db.run(`
    CREATE TABLE IF NOT EXISTS pacientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        matricula TEXT NOT NULL,
        dataNascimento TEXT NOT NULL,
        forcaOperativa TEXT NOT NULL,
        peso REAL NOT NULL,
        altura INTEGER NOT NULL,
        circAbdominal INTEGER NOT NULL,
        pressaoArterial TEXT NOT NULL,
        batimentos INTEGER NOT NULL,
        glicemia INTEGER NOT NULL,
        observacoesMedicas TEXT,
        status INTEGER NOT NULL DEFAULT 0
    )
`);

// Endpoint para cadastrar um paciente (mantido)
app.post('/pacientes', (req, res) => {
    const {
        nome, matricula, dataNascimento, forcaOperativa, peso, altura,
        circAbdominal, pressaoArterial, batimentos, glicemia, observacoesMedicas, status
    } = req.body;

    const stmt = db.prepare(`
        INSERT INTO pacientes (nome, matricula, dataNascimento, forcaOperativa, peso, altura, 
            circAbdominal, pressaoArterial, batimentos, glicemia, observacoesMedicas, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
        nome, matricula, dataNascimento, forcaOperativa, peso, altura,
        circAbdominal, pressaoArterial, batimentos, glicemia, observacoesMedicas || "", status || 0,
        (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.status(201).json({ message: 'Paciente cadastrado com sucesso' });
        }
    );
    stmt.finalize();
});

// Endpoint para listar todos os pacientes (mantido)
app.get('/pacientes', (req, res) => {
    db.all('SELECT * FROM pacientes', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Endpoint para atualizar um paciente (mantido)
app.put('/pacientes/:id', (req, res) => {
    const { id } = req.params;
    const {
        nome, matricula, dataNascimento, forcaOperativa, peso, altura,
        circAbdominal, pressaoArterial, batimentos, glicemia, observacoesMedicas, status
    } = req.body;

    const stmt = db.prepare(`
        UPDATE pacientes SET nome = ?, matricula = ?, dataNascimento = ?, forcaOperativa = ?, peso = ?, 
            altura = ?, circAbdominal = ?, pressaoArterial = ?, batimentos = ?, glicemia = ?, 
            observacoesMedicas = ?, status = ?
        WHERE id = ?
    `);
    stmt.run(
        nome, matricula, dataNascimento, forcaOperativa, peso, altura,
        circAbdominal, pressaoArterial, batimentos, glicemia, observacoesMedicas, status, id,
        (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: 'Paciente atualizado com sucesso' });
        }
    );
    stmt.finalize();
});

// Endpoint para excluir um paciente (mantido)
app.delete('/pacientes/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM pacientes WHERE id = ?', id, (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Paciente excluído com sucesso' });
    });
});

// Novo endpoint para exportar pacientes como planilha
app.get('/exportar-pacientes', (req, res) => {
    db.all('SELECT * FROM pacientes', [], async (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        // Cria uma nova planilha
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Pacientes');

        // Define as colunas da planilha
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Nome', key: 'nome', width: 30 },
            { header: 'Matrícula', key: 'matricula', width: 15 },
            { header: 'Data de Nascimento', key: 'dataNascimento', width: 15 },
            { header: 'Força Operativa', key: 'forcaOperativa', width: 20 },
            { header: 'Peso (kg)', key: 'peso', width: 10 },
            { header: 'Altura (cm)', key: 'altura', width: 10 },
            { header: 'Circ. Abdominal (cm)', key: 'circAbdominal', width: 15 },
            { header: 'Pressão Arterial', key: 'pressaoArterial', width: 15 },
            { header: 'Batimentos (bpm)', key: 'batimentos', width: 15 },
            { header: 'Glicemia (mg/dL)', key: 'glicemia', width: 15 },
            { header: 'Observações Médicas', key: 'observacoesMedicas', width: 40 },
            { header: 'Status', key: 'status', width: 10 }
        ];

        // Adiciona os dados dos pacientes
        worksheet.addRows(rows);

        // Estiliza o cabeçalho
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFDDDDDD' }
        };

        // Configura o response para download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="pacientes.xlsx"');

        // Envia a planilha como buffer
        await workbook.xlsx.write(res);
        res.end();
    });
});

// Rota padrão para o frontend (mantido)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Inicia o servidor
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${port}`);
});