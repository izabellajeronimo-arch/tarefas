const express = require('express');
const router = express.Router();
const controller = require('./controllers');

router.post('/tarefas', controller.criarTarefa);
router.get('/tarefas/periodo', controller.listarPorPeriodo);
router.get('/tarefas/:id', controller.buscarPorId);
router.put('/tarefas/:id', controller.atualizarTarefa);
router.delete('/tarefas/:id', controller.deletarTarefa);

module.exports = router;