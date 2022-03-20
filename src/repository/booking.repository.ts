import { BookingEntity } from "../entities";
import { DB } from "../utils";

export const BookingRepository = DB.getRepository(BookingEntity).extend({});
