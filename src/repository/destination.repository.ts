import { DestinationEntity } from "../entities";
import { DB } from "../utils";

export const DestinationRepository = DB.getRepository(DestinationEntity).extend(
  {}
);
