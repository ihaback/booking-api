import { Request, Response, NextFunction } from "express";
import { UserEntity } from "../entities";
import { UserRepository } from "../repository";

export const checkRole = (roles: Array<string>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const id = res.locals.jwtPayload.userId;

    const userRepository = UserRepository;
    let user: UserEntity;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (id) {
      return res.status(401).send();
    }

    if (roles.indexOf(user.role) > -1) next();
    else res.status(401).send();
  };
};
