import express from 'express';
import dotenv from 'dotenv';
import conectarBanco from './db.js';

dotenv.config();

const app = express();

app.use(express.json());

app.use(express.static('public'));

const PORTA = process.env.PORTA || 3000;
const conexao = conectarBanco();

app.get('/', (req, res) => {
    res.sendFile("./public/index.html", { root: "." });
});

// 1. GIT/POST
app.post("/tarefas", async (req, res) => {
    try {
        const { nome, descricao, responsavel, data_tarefa, concluido } = req.body;

        if (!nome || !responsavel || !data_tarefa) {
            return res.status(400).json({ message: "Nome, responsável e data são obrigatórios!" });
        }

        const sql = "INSERT INTO tarefas (nome, descricao, responsavel, data_tarefa, concluido) VALUES (?, ?, ?, ?, ?)";
        const resposta = await conexao.query(sql, [
            nome,
            descricao || null,
            responsavel,
            data_tarefa,
            concluido ?? false
        ]);

        res.status(201).json({
            message: "Tarefa criada com sucesso!",
            id: resposta.insertId
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Erro ao cadastrar tarefa" });
    }
});

// 2. CONSULTA POR ID
app.get("/tarefas/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const sql = "SELECT * FROM tarefas WHERE id = ?";
        const resposta = await conexao.query(sql, [id]);

        if (resposta.length > 0) {
            res.json(resposta[0]);
        } else {
            res.status(404).json({ message: "Tarefa não encontrada!" });
        }
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar tarefa" });
    }
});

// 3. GIT/GET
app.get("/tarefas", async (req, res) => {
    try {
        const { inicio, fim } = req.query;

        if (inicio && fim) {
            const sql = "SELECT * FROM tarefas WHERE data_tarefa BETWEEN ? AND ? ORDER BY data_tarefa ASC";
            const [resposta] = await conexao.query(sql, [inicio, fim]);
            return res.json(resposta);
        }

        const sql = "SELECT * FROM tarefas ORDER BY data_tarefa ASC";
        const resposta = await conexao.query(sql);
        res.json(resposta);
    } catch (error) {
        res.status(500).json({ message: "Erro ao listar tarefas" });
    }
});

// 4  GIT/PUT
app.put("/tarefas/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { nome, descricao, responsavel, data_tarefa, concluido } = req.body;

        const sql = `
            UPDATE tarefas 
            SET nome = ?, descricao = ?, responsavel = ?, data_tarefa = ?, concluido = ? 
            WHERE id = ?
        `;
        const resposta = await conexao.query(sql, [
            nome,
            descricao,
            responsavel,
            data_tarefa,
            concluido,
            id
        ]);

        if (resposta.affectedRows > 0) {
            res.json({ message: "Tarefa atualizada com sucesso" });
        } else {
            res.status(404).json({ message: "Tarefa não encontrada" });
        }
    } catch (error) {
        res.status(500).json({ message: "Erro ao atualizar tarefa" });
    }
});

// 5. GIT/DELETE
app.delete("/tarefas/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const sql = "DELETE FROM tarefas WHERE id = ?";
        const resposta = await conexao.query(sql, [id]);

        if (resposta.affectedRows > 0) {
            res.json({ message: "Tarefa deletada com sucesso" });
        } else {
            res.status(404).json({ message: "Tarefa não encontrada" });
        }
    } catch (error) {
        res.status(500).json({ message: "Erro ao deletar tarefa" });
    }
});

// Inicia o servidor
app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
});