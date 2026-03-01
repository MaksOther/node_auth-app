import { jwtService } from "../services/jwt.sevrices.js";

export const authMiddlewares = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log("1. Отримано заголовок:", authHeader);

  if (!authHeader) {
    return res.sendStatus(401);
  }

  const [, token] = authHeader.split(" ");
  console.log("2. Витягнуто токен:", token);

  if (!token) {
    return res.sendStatus(401);
  }

  const userData = jwtService.verify(token);
  console.log("3. Результат розшифровки:", userData);

  if (!userData) {
    return res.sendStatus(401);
  }

  req.user = userData;
  next();
};
