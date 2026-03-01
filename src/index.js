import express from "express";
import cors from "cors";
import { router as todoRouter } from "./routes/todo.route.js";
import { authRouter } from "./routes/auth.route.js";
import { client } from "./utils/db.js";

import "./models/Todo.js";
import { User } from "./models/User.js";
import { errorMiddleware } from "./middlewares/errorMiddlewares.js";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());
app.use("/todos", todoRouter);
app.use("/", authRouter);

app.use(errorMiddleware);
app.use(cookieParser());

client
  .sync()
  .then(async() => {
    await User.sync({ force: true });
    console.log("✅ Database connected and synced");
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err);
  });
