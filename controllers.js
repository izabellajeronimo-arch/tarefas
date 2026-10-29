const db = require('./database');

// Inclusão de tarefa
exports.criarTarefa = async (req, res) => {
  const { nome, descricao, responsavel, data_tarefa, concluido } = req.body;
  try {
    const query = `INSERT INTO tarefas (nome, descricao, responsavel, data_tarefa, concluido) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await db.execute(query, [nome, descricao, responsavel, data_tarefa, concluido || false]);
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao cadastrar tarefa.' });
  }
};

// Consulta por ID
exports.buscarPorId = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM tarefas WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ mensagem: 'Tarefa não encontrada.' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao buscar tarefa por ID.' });
  }
};

// Lista de tarefas por período
exports.listarPorPeriodo = async (req, res) => {
  const { inicio, fim } = req.query;
  try {
    const query = 'SELECT * FROM tarefas WHERE data_tarefa BETWEEN ? AND ?';
    const [rows] = await db.execute(query, [inicio, fim]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao buscar tarefas por período.' });
  }
};

// Atualização de tarefa
exports.atualizarTarefa = async (req, res) => {
  const { nome, descricao, responsavel, data_tarefa, concluido } = req.body;
  try {
    const query = `UPDATE tarefas SET nome=?, descricao=?, responsavel=?, data_tarefa=?, concluido=? WHERE id=?`;
    const [result] = await db.execute(query, [nome, descricao, responsavel, data_tarefa, concluido, req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Tarefa não encontrada.' });
    }
    res.json({ mensagem: 'Tarefa atualizada com sucesso.' });
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao atualizar tarefa.' });
  }
};

// Exclusão de tarefa
exports.deletarTarefa = async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM tarefas WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Tarefa não encontrada.' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao excluir tarefa.' });
  }
};