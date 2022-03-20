import { Router, Response, Request } from "express";
import { UserEntity } from "../entities";
import { UserRepository } from "../repository";
import jwt from "jsonwebtoken";
import { validate } from "class-validator";
import { checkAuth, checkRole } from "../middleware";

export class AuthController {
  public router: Router;
  private userRepository: typeof UserRepository;

  constructor() {
    this.userRepository = UserRepository;
    this.router = Router();
    this.routes();
  }

  public login = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!(username && password)) {
      res.status(400).send();
    }

    let user: UserEntity;
    try {
      user = await this.userRepository.findOneOrFail({ where: { username } });
    } catch (error) {
      return res.status(401).send();
    }

    if (!user.checkIfUnencryptedPasswordIsValid(password)) {
      return res.status(401).send();
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.send(token);
  };
  public changePassword = async (req: Request, res: Response) => {
    const id = res.locals.jwtPayload.userId;

    const { oldPassword, newPassword } = req.body;
    if (!(oldPassword && newPassword)) {
      res.status(400).send();
    }

    let user: UserEntity;
    try {
      user = await this.userRepository.findOneOrFail(id);
    } catch (id) {
      return res.status(401).send();
    }

    if (!user.checkIfUnencryptedPasswordIsValid(oldPassword)) {
      return res.status(401).send();
    }

    user.password = newPassword;
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }
    user.hashPassword();
    this.userRepository.save(user);

    res.status(204).send();
  };

  public routes() {
    this.router.post("/login", this.login);
    this.router.post(
      "/change-password",
      [checkAuth, checkRole(["ADMIN"])],
      this.changePassword
    );
  }
}
