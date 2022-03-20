import { UserEntity } from "../entities";
import { DB } from "../utils";

export const UserRepository = DB.getRepository(UserEntity).extend({});
