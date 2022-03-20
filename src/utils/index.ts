import "dotenv/config";
import { DataSourceOptions, DataSource } from "typeorm";
import { BookingEntity, DestinationEntity, UserEntity } from "../entities";

const connectOptions: DataSourceOptions = {
  type: process.env.DB_TYPE as "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_INSTANCE,
  synchronize: true,
  entities: [
    process.env.NODE_ENV === "prod"
      ? "build/**/*.entity{,.js}"
      : "src/**/*.entity{.ts,.js}",
  ],
  migrations: ["src/migration/*.ts"],
};

export const DB = new DataSource(connectOptions);

export const initDB = async () => {
  const db = await DB.initialize();

  return db;
};

export const initDBWithData = async () => {
  const db = await DB.initialize();

  await clearDB();

  await createAdmin();

  await createDestination();

  return db;
};

export const initDBWithAdmin = async () => {
  const db = await DB.initialize();

  await clearDB();

  await createAdmin();

  return db;
};

export const clearDB = async () => {
  const entities = DB.entityMetadatas;
  for (const entity of entities) {
    const repository = await DB.getRepository(entity.name);
    await repository.query(
      `TRUNCATE "${entity.tableName}" RESTART IDENTITY CASCADE;`
    );
  }
};

export const createAdmin = async () => {
  const user = new UserEntity();
  user.username = "admin";
  user.password = "admin";
  user.hashPassword();
  user.role = "ADMIN";

  await DB.getRepository(UserEntity).save(user);

  return user;
};

export const createDestination = async () => {
  const destination = new DestinationEntity();

  destination.name = "New York";
  destination.state = "New York";
  destination.city = "New York";
  destination.cost = 100;
  destination.maxGuests = 1;

  await DB.getRepository(DestinationEntity).save(destination);

  return destination;
};

export const createBooking = async (
  user: UserEntity,
  destination: DestinationEntity
) => {
  const booking = new BookingEntity();

  booking.startDate = "2022-03-26T00:15:23.138Z" as any;
  booking.endDate = "2022-03-26T00:15:23.138Z" as any;
  booking.cost = 100;
  booking.user = user;
  booking.destination = destination;

  await DB.getRepository(BookingEntity).save(booking);

  return booking;
};

export const clearBookings = async () => {
  const bookingRepository = await DB.getRepository(BookingEntity);
  await bookingRepository.query(`TRUNCATE "booking" RESTART IDENTITY CASCADE;`);
};

export const clearDestinations = async () => {
  const destinationRepository = await DB.getRepository(DestinationEntity);
  await destinationRepository.query(
    `TRUNCATE "destination" RESTART IDENTITY CASCADE;`
  );
};

export const dropDB = async () => {
  await DB.destroy();
};

export const jwtSecret = process.env.JWT_SECRET as string;
