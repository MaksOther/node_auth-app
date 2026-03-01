import { DataTypes } from "sequelize";
import { client } from "../utils/db.js";

export const Todo = client.define(
  "Todo",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "todos",
    updatedAt: false,
    createdAt: false,
  }
);