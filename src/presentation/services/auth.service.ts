import { bcryptAdapter, JwtAdapter } from "../../config";
import { envs } from "../../config/envs";
import { UserModel } from "../../data";
import { CustomError, LoginUserDto } from "../../domain";
import { RegisterUserDto } from "../../domain/dtos/auth/register-user.dto";
import { UserEntity } from "../../domain/entities/user.entity";
import { EmailService } from "./email.service";

export class AuthService {
  //SE PUEDE MEJORAR CON INYECCION
  constructor(private readonly emailService: EmailService) {}

  public async registerUser(registerUserDto: RegisterUserDto) {
    const existUser = await UserModel.findOne({ email: registerUserDto.email });
    if (existUser) throw CustomError.badRequest("User already exists");
    try {
      const user = new UserModel(registerUserDto);

      //ENCRIPTAR
      user.password = bcryptAdapter.hash(registerUserDto.password);
      await user.save();

      //EMAIL DE CONFIRMACION
      await this.sendValidationEmail(registerUserDto.email);
      const { password, ...userEntity } = UserEntity.fromObject(user);
      const token = await JwtAdapter.generateToken({ id: user.id });
      if (!token) throw CustomError.internalServer("Error while creating JWT");

      return {
        user: userEntity,
        token: token,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  public async loginUser(loginUserDto: LoginUserDto) {
    const user = await UserModel.findOne({ email: loginUserDto.email });
    if (!user) throw CustomError.badRequest("Email not exist");

    const isMatching = bcryptAdapter.compare(
      loginUserDto.password,
      user.password,
    );
    if (!isMatching) throw CustomError.badRequest("Password is not valid");

    const { password, ...userEntity } = UserEntity.fromObject(user);
    const token = await JwtAdapter.generateToken({ id: user.id });
    if (!token) throw CustomError.internalServer("Error while creating JWT");
    return {
      user: { ...userEntity },
      token: token,
    };
  }

  private sendValidationEmail = async (email: string) => {
    //ENVIAR EMAIL
    const token = await JwtAdapter.generateToken({ email });
    if (!token) throw CustomError.internalServer("Error while creating JWT");
    const link = `${envs.WEBSERVICE_URL}/auth/validate-email/${token}`;
    console.log(link);
    const html = `
       <h1>Validate your email</h1>
        <p>Click on the following link to validate your email</p>
        <a href="http://${link}">Validate email ${email}</a>
      `;
    console.log(html);
    const options = {
      to: email,
      subject: "Validate your email",
      htmlBody: html,
    };
    const isSet = await this.emailService.sendEmail(options);
    return true;
  };

  public validateEmail = async (token: string) => {
    //VALIDAR EMAIL
    const payload = await JwtAdapter.validateToken(token);
    if (!payload) throw CustomError.badRequest("Invalid token");
    const { email } = payload as { email: string };
    if (!email) throw CustomError.internalServer("Email not in token");

    const user = await UserModel.findOne({ email });
    if (!user) throw CustomError.internalServer("Email not found");
    user.emailValidated = true;
    await user.save();
    return true;
  };
}
