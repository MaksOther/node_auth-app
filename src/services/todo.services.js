// services/todo.services.js
import { Todo } from "../models/Todo.js";
import { User } from "../models/User.js";
import { client } from "../utils/db.js";

export const getAll = async () => {
  return await Todo.findAll({
    order: ["title"],
  });
};

export const getById = async (id) => {
  return Todo.findByPk(id);
};

export const create = (title) => {
  return Todo.create({ title });
};

export const update = async (id, data, transaction = null) => {
  const currentTodo = await getById(id);
  if (!currentTodo) return null;

  const isCompleted =
    data.completed !== undefined
      ? data.completed === true || data.completed === "true"
      : currentTodo.completed;

  await currentTodo.update({
    title: data.title !== undefined ? data.title : currentTodo.title,
    completed: isCompleted,
  }, { transaction });

  return currentTodo;
};

export const updateMany = async (items) => {
  await client.transaction(async (t) => {
    await Promise.all(items.map((item) => update(item.id, item, t)));
  });

  return getAll();
};

export function findByEmail(email) {
  return User.findOne({ where : { email }});
}

export const remove = async (id) => {
  return await Todo.destroy({ where: { id } });
};