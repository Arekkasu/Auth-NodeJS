import { Request, Response } from "express";
import { RegisterUserDto } from "../../domain/dtos/auth/register-user.dto";
import { AuthService } from "../services/auth.service";
import { CustomError, LoginUserDto } from "../../domain";
import { JwtAdapter } from "../../config";

export class AuthController {
  constructor(public readonly authService: AuthService) {}

  private handleErrors = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error("Internal server error", error);
    return res.status(500).json({ error: "Internal server error" });
  };

  register = (req: Request, res: Response) => {
    const [error, registerDto] = RegisterUserDto.create(req.body);
    if (error) return res.status(400).json({ error });
    //EL ! SIGNIFICA QUE PUEDE LANZAR UNA EXCEPCIOn
    this.authService
      .registerUser(registerDto!)
      .then((user) => res.json(user))
      .catch((error) => this.handleErrors(error, res));
  };
  loginUser = (req: Request, res: Response) => {
    const [error, loginUserDto] = LoginUserDto.create(req.body);
    if (error) return res.status(400).json({ error });
    this.authService
      .loginUser(loginUserDto!)
      .then((user) => {
        res.json(user);
      })
      .catch((error) => {
        this.handleErrors(error, res);
      });
  };
  validateEmail = (req: Request, res: Response) => {
    const { token } = req.params;
    this.authService
      .validateEmail(token)
      .then(() => {
        res.json("validateEmail");
      })
      .catch((error) => {
        this.handleErrors(error, res);
      });
  };
}
