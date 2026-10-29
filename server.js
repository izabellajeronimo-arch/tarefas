import express from 'express'; // Importa o servidor Express
import dotenv from 'dotenv'; // Importa leitor de variáveis de ambiente
import conectarBanco from './db.js'; // Importa a conexão do banco de dados

dotenv.config(); // Carrega as variáveis do arquivo .env

const app = express(); // Inicializa o aplicativo Express

app.use(express.json()); // Ativa suporte a JSON no corpo da requisição
app.use(express.static('public')); // Define a pasta public para arquivos estáticos

const PORTA = process.env.PORTA || 3000; // Define a porta do servidor
const conexao = conectarBanco(); // Cria a conexão com o banco

// Rota inicial: entrega a página HTML principal
app.get('/', (req, res) => {
    res.sendFile("./public/index.html", { root: "." }); // Envia o arquivo index.html
});

// 1. INCLUSÃO (POST) - Criar tarefa
app.post("/tarefas", async (req, res) => {
    try {
        const { nome, descricao, responsavel, data_tarefa, concluido } = req.body; // Pega dados enviados

        // Valida se os campos obrigatórios foram preenchidos
        if (!nome || !responsavel || !data_tarefa) {
            return res.status(400).json({ message: "Nome, responsável e data são obrigatórios!" }); // Retorna erro 400
        }

        const sql = "INSERT INTO tarefas (nome, descricao, responsavel, data_tarefa, concluido) VALUES (?, ?, ?, ?, ?)"; // Comando SQL para inserir
        
        // Executa o INSERT no banco de dados
        const [resposta] = await conexao.query(sql, [
            nome,
            descricao || null,
            responsavel,
            data_tarefa,
            concluido ?? false
        ]);

        // Retorna sucesso e o ID gerado
        res.status(201).json({
            message: "Tarefa criada com sucesso!",
            id: resposta.insertId
        });
    } catch (error) {
        console.error(error); // Exibe erro no console
        res.status(500).json({ message: "Erro ao cadastrar tarefa" }); // Retorna erro 500
    }
});

// 2. CONSULTA POR ID (GET) - Buscar uma tarefa
app.get("/tarefas/:id", async (req, res) => {
    try {
        const id = Number(req.params.id); // Converte o ID da URL para número
        const sql = "SELECT * FROM tarefas WHERE id = ?"; // Comando SQL para buscar por ID
        
        const [linhas] = await conexao.query(sql, [id]); // Executa a busca

        if (linhas.length > 0) {
            res.json(linhas[0]); // Retorna a tarefa encontrada
        } else {
            res.status(404).json({ message: "Tarefa não encontrada!" }); // Retorna erro 404
        }
    } catch (error) {
        console.error(error); // Exibe erro no console
        res.status(500).json({ message: "Erro ao buscar tarefa" }); // Retorna erro 500
    }
});

// 3. LISTAR TODAS / POR PERÍODO (GET) - Buscar várias tarefas
app.get("/tarefas", async (req, res) => {
    try {
        const { inicio, fim } = req.query; // Pega as datas da URL se existirem

        // Se passar período, filtra por datas
        if (inicio && fim) {
            const sql = "SELECT * FROM tarefas WHERE data_tarefa BETWEEN ? AND ? ORDER BY data_tarefa ASC"; // SQL com filtro
            const [linhas] = await conexao.query(sql, [inicio, fim]); // Executa busca com filtro
            return res.json(linhas); // Retorna tarefas filtradas
        }

        const sql = "SELECT * FROM tarefas ORDER BY data_tarefa ASC"; // SQL sem filtro (busca tudo)
        const [linhas] = await conexao.query(sql); // Executa busca geral
        res.json(linhas); // Retorna todas as tarefas
    } catch (error) {
        console.error(error); // Exibe erro no console
        res.status(500).json({ message: "Erro ao listar tarefas" }); // Retorna erro 500
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
            res.json({ message: "Tarefa atualizada com sucesso" }); // Sucesso se alterou
        } else {
            res.status(404).json({ message: "Tarefa não encontrada" }); // Erro 404 se não achou ID
        }
    } catch (error) {
        console.error(error); // Exibe erro no console
        res.status(500).json({ message: "Erro ao atualizar tarefa" }); // Retorna erro 500
    }
});

// 5. EXCLUSÃO (DELETE) - Apagar tarefa
app.delete("/tarefas/:id", async (req, res) => {
    try {
        const id = Number(req.params.id); // Pega o ID da URL
        const sql = "DELETE FROM tarefas WHERE id = ?"; // Comando SQL para deletar
        
        const [resposta] = await conexao.query(sql, [id]); // Executa a exclusão

        if (resposta.affectedRows > 0) {
            res.json({ message: "Tarefa deletada com sucesso" }); // Sucesso se deletou
        } else {
            res.status(404).json({ message: "Tarefa não encontrada" }); // Erro 404 se não achou ID
        }
    } catch (error) {
        console.error(error); // Exibe erro no console
        res.status(500).json({ message: "Erro ao deletar tarefa" }); // Retorna erro 500
    }
});

// Inicialização do Servidor
app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`); // Avisa no terminal que o servidor subiu
});