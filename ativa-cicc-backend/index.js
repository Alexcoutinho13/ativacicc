const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000; // Usa a porta do ambiente ou 3000

// Middleware para permitir requisições de qualquer origem (CORS)
app.use(cors());
// Middleware para interpretar JSON no corpo das requisições
app.use(express.json());

// Array para armazenar os pacientes (substitua por um banco de dados depois)
let pacientes = [];

// Rota para listar todos os pacientes
app.get('/pacientes', (req, res) => {
    res.json(pacientes);
});

// Rota para adicionar um novo paciente
app.post('/pacientes', (req, res) => {
    const paciente = req.body;
    pacientes.push(paciente);
    res.status(201).json(paciente); // Retorna o paciente criado
});

// Rota para atualizar um paciente
app.put('/pacientes/:id', (req, res) => {
    const id = req.params.id;
    const novosDados = req.body;
    pacientes[id] = novosDados;
    res.json(pacientes[id]);
});

// Rota para deletar um paciente
app.delete('/pacientes/:id', (req, res) => {
    const id = req.params.id;
    pacientes.splice(id, 1);
    res.status(204).send(); // Retorna status 204 (No Content)
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});