import express from 'express'; 
import dotenv from 'dotenv'; 
import conectarBanco from './db.js'; 

dotenv.config(); 

const app = express(); 

app.use(express.json()); 
app.use(express.static('public')); 

const PORTA = process.env.PORTA || 3000; 
const conexao = conectarBanco(); 

//entrega a página HTML principal
app.get('/', (req, res) => {
    res.sendFile("./public/index.html", { root: "." }); // Envia o arquivo index.html
});

//Cria a tarefa
app.post("/tarefas", async (req, res) => {
    try {
        const { nome, descricao, responsavel, data_tarefa, concluido } = req.body; // Pega dados enviados

        // Valida se tudo que é obrigatório foi permitido
        if (!nome || !responsavel || !data_tarefa) {
            return res.status(400).json({ message: "Nome, responsável e data são obrigatórios!" }); // Retorna erro 400
        }

        const sql = "INSERT INTO tarefas (nome, descricao, responsavel, data_tarefa, concluido) VALUES (?, ?, ?, ?, ?)"; // Comando SQL para inserir
        
        // Executa e salva tudo dentro do bd
        const [resposta] = await conexao.query(sql, [
            nome,
            descricao || null,
            responsavel,
            data_tarefa,
            concluido ?? false
        ]);

        // Devolve com "Sucesso" o ID
        res.status(201).json({
            message: "Tarefa criada com sucesso!",
            id: resposta.insertId
        });
    } catch (error) {
        console.error(error); 
        res.status(500).json({ message: "Erro ao cadastrar tarefa" }); 
    }
});

// Busca uma tarefa pelo ID
app.get("/tarefas/:id", async (req, res) => {
    try {
        const id = Number(req.params.id); // Converte o ID da URL para número
        const sql = "SELECT * FROM tarefas WHERE id = ?"; // Comando para buscar por ID
        
        const [linhas] = await conexao.query(sql, [id]); //Procura no banco

        if (linhas.length > 0) {
            res.json(linhas[0]); // Retorna a tarefa encontrada
        } else {
            res.status(404).json({ message: "Tarefa não encontrada!" }); 
        }
    } catch (error) {
        console.error(error); 
        res.status(500).json({ message: "Erro ao buscar tarefa" }); // Retorna erro inesperado
    }
});

//Busca várias tarefas
app.get("/tarefas", async (req, res) => {
    try {
        const { inicio, fim } = req.query; 

        // Se passar período, filtra por datas
        if (inicio && fim) {
            const sql = "SELECT * FROM tarefas WHERE data_tarefa BETWEEN ? AND ? ORDER BY data_tarefa ASC"; // SQL com filtro
            const [linhas] = await conexao.query(sql, [inicio, fim]); 
            return res.json(linhas); // Retorna tarefas filtradas
        }

        const sql = "SELECT * FROM tarefas ORDER BY data_tarefa ASC"; // SQL sem filtro 
        const [linhas] = await conexao.query(sql); // Executa busca geral
        res.json(linhas); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao listar tarefas" }); 
    }
});

// 4. ATUALIZAÇÃO (PUT) - Editar tarefa
app.put("/tarefas/:id", async (req, res) => {
    try {
        const id = Number(req.params.id); // Pega o ID da URL
        const { nome, descricao, responsavel, data_tarefa, concluido } = req.body; // Pega novos dados

        // Comando SQL para atualizar
        const sql = `
            UPDATE tarefas 
            SET nome = ?, descricao = ?, responsavel = ?, data_tarefa = ?, concluido = ? 
            WHERE id = ?
        `;
        
        // Executa a atualização
        const [resposta] = await conexao.query(sql, [
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
        console.error(error); 
        res.status(500).json({ message: "Erro ao atualizar tarefa" }); 
    }
});

//Apagar tarefa
app.delete("/tarefas/:id", async (req, res) => {
    try {
        const id = Number(req.params.id); // Pega o ID da URL
        const sql = "DELETE FROM tarefas WHERE id = ?";
        
        const [resposta] = await conexao.query(sql, [id]); // Executa a exclusão

        if (resposta.affectedRows > 0) {
            res.json({ message: "Tarefa deletada com sucesso" });
        } else {
            res.status(404).json({ message: "Tarefa não encontrada" }); 
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao deletar tarefa" }); 
    }
});


app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`); 
});