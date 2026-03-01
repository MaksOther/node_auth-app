import * as todoService from "../services/todo.services.js";

export const get = async (req, res) => {
    const todos = await todoService.getAll();
    res.send(todos);
};

export const post = async (req, res) => {
    const { title } = req.body;
    if (!title) return res.sendStatus(422);

    const todo = await todoService.create(title);
    res.status(201).send(todo);
};

export const patch = async (req, res) => {
    const { items } = req.body;
    if (!Array.isArray(items)) return res.sendStatus(422);

    const updatedTodos = await todoService.updateMany(items);
    res.json(updatedTodos);
};

export const patchOne = async (req, res) => {
    const updatedTodo = await todoService.update(req.params.id, req.body);
    if (!updatedTodo) return res.sendStatus(404);
    res.json(updatedTodo);
};

export const getOne = async (req, res) => {
    const todo = await todoService.getById(req.params.id);
    if (!todo) return res.sendStatus(404);
    res.send(todo);
};

export const deleteOne = async (req, res) => {
    const success = await todoService.remove(req.params.id);
    if (!success) return res.sendStatus(404);

    const allTodos = await todoService.getAll();
    res.status(200).send(allTodos);
};