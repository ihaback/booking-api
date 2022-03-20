import { validate } from "class-validator";
import { Router, Response, Request } from "express";
import { commonConstants } from "../constants";
import { BookingEntity } from "../entities";
import { checkAuth, checkRole } from "../middleware";
import {
  BookingRepository,
  UserRepository,
  DestinationRepository,
} from "../repository";

export class BookingController {
  public router: Router;
  private bookingRepository: typeof BookingRepository;
  private userRepository: typeof UserRepository;
  private destinationRepository: typeof DestinationRepository;

  constructor() {
    this.bookingRepository = BookingRepository;
    this.userRepository = UserRepository;
    this.destinationRepository = DestinationRepository;
    this.router = Router();
    this.routes();
  }

  public index = async (req: Request, res: Response) => {
    try {
      const bookings = await this.bookingRepository.find({
        order: {
          id: "DESC",
        },
        relations: {
          destination: true,
        },
      });
      return res.send(bookings);
    } catch (error) {
      return res.status(500).send(commonConstants.internalServerErrpr);
    }
  };

  public getOne = async (req: Request, res: Response) => {
    const id = req["params"]["id"];

    try {
      const destination = await this.bookingRepository.findOneOrFail({
        where: {
          id: Number(id),
        },
        relations: {
          destination: true,
        },
      });
      return res.send(destination);
    } catch (error) {
      return res.status(400).send("Not found");
    }
  };

  public create = async (req: Request, res: Response) => {
    const { startDate, endDate, cost, destinationId } = req.body;
    const booking = new BookingEntity();

    const userId = res.locals.jwtPayload.userId;

    let user;
    try {
      user = await this.userRepository.findOneOrFail({
        where: {
          id: Number(userId),
        },
      });
    } catch (error) {
      res.status(400).send("Provide valid user for booking");
      return;
    }

    let destination;
    try {
      destination = await this.destinationRepository.findOneOrFail({
        where: {
          id: Number(destinationId),
        },
      });
    } catch (error) {
      res.status(400).send("Provide valid destination for booking");
      return;
    }

    booking.startDate = startDate;
    booking.endDate = endDate;
    booking.cost = cost;

    booking.user = user;
    booking.destination = destination;

    const errors = await validate(booking);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    try {
      await this.bookingRepository.save(booking);
    } catch (e) {
      res.status(409).send("Bookings already exist");
      return;
    }

    res.status(201).send("Bookings created");
  };

  public update = async (req: Request, res: Response) => {
    const id = req.params.id;
    const { startDate, endDate, cost } = req.body;

    let booking;

    try {
      booking = await this.bookingRepository.findOneOrFail({
        where: {
          id: Number(id),
        },
      });
    } catch (error) {
      res.status(404).send("Booking not found");
      return;
    }

    booking.startDate = startDate;
    booking.endDate = endDate;
    booking.cost = cost;

    try {
      await this.bookingRepository.save(booking);
    } catch (e) {
      res.status(400).send("Could not update user");
      return;
    }

    res.status(204).send();
  };

  public delete = async (req: Request, res: Response) => {
    const id = req.params.id;

    try {
      await this.bookingRepository.findOneOrFail({
        where: {
          id: Number(id),
        },
      });
    } catch (error) {
      res.status(404).send("Booking not found");
      return;
    }
    this.bookingRepository.delete(id);

    res.status(204).send();
  };

  public routes() {
    this.router.get("/", [checkAuth, checkRole(["ADMIN", "USER"])], this.index);
    this.router.get(
      "/:id",
      [checkAuth, checkRole(["ADMIN", "USER"])],
      this.getOne
    );
    this.router.post(
      "/",
      [checkAuth, checkRole(["ADMIN", "USER"])],
      this.create
    );
    this.router.put(
      "/:id",
      [checkAuth, checkRole(["ADMIN", "USER"])],
      this.update
    );
    this.router.delete(
      "/:id",
      [checkAuth, checkRole(["ADMIN", "USER"])],
      this.delete
    );
  }
}
