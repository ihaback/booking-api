import { validate } from "class-validator";
import { Router, Response, Request } from "express";
import { commonConstants } from "../constants";
import { DestinationEntity } from "../entities";
import { checkAuth, checkRole } from "../middleware";
import { DestinationRepository } from "../repository";

export class DestinationController {
  public router: Router;
  private destinationRepository: typeof DestinationRepository;

  constructor() {
    this.destinationRepository = DestinationRepository;
    this.router = Router();
    this.routes();
  }

  public index = async (req: Request, res: Response) => {
    try {
      const destinations = await this.destinationRepository.find({
        order: {
          id: "DESC",
          bookings: {
            id: "DESC",
          },
        },
        relations: {
          bookings: true,
        },
      });
      return res.send(destinations);
    } catch (error) {
      return res.status(500).send(commonConstants.internalServerErrpr);
    }
  };

  public getOne = async (req: Request, res: Response) => {
    const id = req["params"]["id"];

    try {
      const destination = await this.destinationRepository.findOneOrFail({
        where: {
          id: Number(id),
        },
        order: {
          id: "DESC",
          bookings: {
            id: "DESC",
          },
        },
        relations: {
          bookings: true,
        },
      });
      return res.send(destination);
    } catch (error) {
      return res.status(400).send("Not found");
    }
  };

  public create = async (req: Request, res: Response) => {
    const { name, description, state, city, cost, maxGuests, available } =
      req.body;
    const destination = new DestinationEntity();

    destination.name = name;
    destination.state = state;
    destination.city = city;
    destination.cost = cost;
    destination.maxGuests = maxGuests;

    if (typeof available === "boolean") destination.available = available;
    if (typeof description === "string") destination.description = description;

    const errors = await validate(destination);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    try {
      await this.destinationRepository.save(destination);
    } catch (e) {
      res.status(409).send("Destination already exist");
      return;
    }

    res.status(201).send("Destination created");
  };

  public update = async (req: Request, res: Response) => {
    const id = req.params.id;

    const { name, description, state, city, cost, maxGuests, available } =
      req.body;

    let destination;
    try {
      destination = await this.destinationRepository.findOneOrFail({
        where: {
          id: Number(id),
        },
      });
    } catch (error) {
      res.status(404).send("Destination not found");
      return;
    }

    destination.name = name;
    destination.state = state;
    destination.city = city;
    destination.cost = cost;
    destination.maxGuests = maxGuests;

    if (typeof available === "boolean") destination.available = available;
    if (typeof description === "string") destination.description = description;

    const errors = await validate(destination);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    try {
      await this.destinationRepository.save(destination);
    } catch (e) {
      res.status(400).send("Could not update destination");
      return;
    }
    res.status(204).send();
  };

  public delete = async (req: Request, res: Response) => {
    const id = req.params.id;

    try {
      await this.destinationRepository.findOneOrFail({
        where: {
          id: Number(id),
        },
      });
    } catch (error) {
      res.status(404).send("User not found");
      return;
    }
    this.destinationRepository.delete(id);

    res.status(204).send();
  };

  public routes() {
    this.router.get("/", [checkAuth, checkRole(["ADMIN", "USER"])], this.index);
    this.router.get(
      "/:id",
      [checkAuth, checkRole(["ADMIN", "USER"])],
      this.getOne
    );
    this.router.post("/", [checkAuth, checkRole(["ADMIN"])], this.create);
    this.router.put("/:id", [checkAuth, checkRole(["ADMIN"])], this.update);
    this.router.delete("/:id", [checkAuth, checkRole(["ADMIN"])], this.delete);
  }
}
