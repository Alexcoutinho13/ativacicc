const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend'))); // Serve os arquivos estáticos do frontend

// Conexão com o banco SQLite
const db = new sqlite3.Database('./pacientes.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco SQLite');
    }
});

// Criação da tabela de pacientes
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

// Endpoint para cadastrar um paciente
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

// Endpoint para listar todos os pacientes
app.get('/pacientes', (req, res) => {
    db.all('SELECT * FROM pacientes', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Endpoint para atualizar um paciente
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

// Endpoint para excluir um paciente
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

// Rota padrão para o frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Inicia o servidor
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${port}`);
});