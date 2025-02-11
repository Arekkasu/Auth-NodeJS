import { NextFunction, Response, Request } from "express";
import { JwtAdapter } from "../../config";
import { UserModel } from "../../data";
import { UserEntity } from "../../domain/entities/user.entity";

export class AuthMiddleware {
  static async validateToken(req: Request, res: Response, next: NextFunction) {
    //SE PUEDEN INVENTAR HEADDERS
    const authorization = req.header("Authorization");
    if (!authorization)
      return res.status(401).json({ error: "no token provided" });
    if (!authorization.startsWith("Bearer "))
      return res.status(401).json({ error: "invalid token" });
    const token = authorization.split(" ")[1] || "";
    try {
      const payload = await JwtAdapter.validateToken<{ id: string }>(token);
      if (!payload) return res.status(401).json({ error: "invalid token" });
      const user = await UserModel.findById(payload.id);
      if (!user) return res.status(401).json({ error: "invalid token - user" });
      req.body.user = UserEntity.fromObject(user);
      next();
    } catch (error) {
      res.status(500).json({ error: "internal server error" });
    }
  }
}
