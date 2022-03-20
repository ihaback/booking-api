import { validate } from "class-validator";
import { Router, Response, Request } from "express";
import { commonConstants } from "../constants";
import { UserEntity } from "../entities";
import { checkAuth, checkRole } from "../middleware";
import { UserRepository } from "../repository";

export class UserController {
  public router: Router;
  private userRepository: typeof UserRepository;

  constructor() {
    this.userRepository = UserRepository;
    this.router = Router();
    this.routes();
  }

  public index = async (req: Request, res: Response) => {
    try {
      const users = await this.userRepository.find({
        select: {
          id: true,
          username: true,
          role: true,
          bookings: {
            id: true,
            destination: {
              name: true,
              description: true,
              available: true,
            },
          },
        },
        relations: {
          bookings: {
            destination: true,
          },
        },
        order: {
          bookings: {
            id: "DESC",
          },
        },
      });
      return res.send(users);
    } catch (error) {
      return res.status(500).send(commonConstants.internalServerErrpr);
    }
  };

  public getOne = async (req: Request, res: Response) => {
    const id = req["params"]["id"];

    try {
      const user = await this.userRepository.findOneOrFail({
        where: {
          id: Number(id),
        },
        select: {
          id: true,
          username: true,
          role: true,
          bookings: {
            id: true,
            destination: {
              name: true,
              description: true,
              available: true,
            },
          },
        },
        relations: {
          bookings: {
            destination: true,
          },
        },
        order: {
          bookings: {
            id: "DESC",
          },
        },
      });

      return res.send(user);
    } catch (error) {
      return res.status(404).send("User not found");
    }
  };

  public create = async (req: Request, res: Response) => {
    const { username, password, role } = req.body;
    const user = new UserEntity();
    user.username = username;
    user.password = password;
    user.role = role;

    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    user.hashPassword();

    try {
      await this.userRepository.save(user);
    } catch (e) {
      res.status(409).send("Username already in use");
      return;
    }

    res.status(201).send("User created");
  };

  public update = async (req: Request, res: Response) => {
    const id = req.params.id;

    const { username, role } = req.body;

    let user;
    try {
      user = await this.userRepository.findOneOrFail({
        where: {
          id: Number(id),
        },
      });
    } catch (error) {
      res.status(404).send("User not found");
      return;
    }

    user.username = username;
    user.role = role;
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    try {
      await this.userRepository.save(user);
    } catch (e) {
      res.status(400).send("Could not update user");
      return;
    }
    res.status(204).send();
  };

  public delete = async (req: Request, res: Response) => {
    const id = req.params.id;

    try {
      await this.userRepository.findOneOrFail({
        where: {
          id: Number(id),
        },
      });
    } catch (error) {
      res.status(404).send("User not found");
      return;
    }
    this.userRepository.delete(id);

    res.status(204).send();
  };

  public routes() {
    this.router.get("/", [checkAuth, checkRole(["ADMIN"])], this.index);
    this.router.get("/:id", [checkAuth, checkRole(["ADMIN"])], this.getOne);
    this.router.post("/", [checkAuth, checkRole(["ADMIN"])], this.create);
    this.router.put("/:id", [checkAuth, checkRole(["ADMIN"])], this.update);
    this.router.delete("/:id", [checkAuth, checkRole(["ADMIN"])], this.delete);
  }
}
