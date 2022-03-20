import { initDBWithData, clearDB, clearBookings, dropDB } from "../src/utils";
import app from "../src";
import request from "supertest";

describe("/api/bookings", () => {
  let token = "";
  beforeAll(async () => {
    await clearDB();
    await initDBWithData();

    const { text } = await request(app)
      .post("/api/auth/login")
      .send({ username: "admin", password: "admin" });

    token = text;
  });

  afterEach(async () => {
    await clearBookings();
  });

  afterAll(async () => {
    await clearDB();
    await dropDB();
  });

  it("should return an empty list on initial GET /api/bookings", async () => {
    const { status, body } = await request(app)
      .get("/api/bookings")
      .set("auth", token)
      .send();

    expect(status).toBe(200);
    expect(body).toEqual([]);
  });
  it("should return list with 1 user on POST /api/bookings", async () => {
    const { status: postStatus, text: postText } = await request(app)
      .post("/api/bookings")
      .set("auth", token)
      .send({
        startDate: "2022-03-26T00:15:23.138Z",
        endDate: "2022-03-26T00:15:23.138Z",
        cost: 100,
        userId: 1,
        destinationId: 1,
      });

    expect(postStatus).toBe(201);
    expect(postText).toEqual("Bookings created");

    const { status: getStatus, body: getBody } = await request(app)
      .get("/api/bookings/")
      .set("auth", token)
      .send();

    expect(getStatus).toBe(200);

    expect(getBody[0]).toMatchObject({
      startDate: "2022-03-26T00:15:23.138Z",
      endDate: "2022-03-26T00:15:23.138Z",
      cost: 100,
      destination: {
        name: "New York",
        description: "description",
        state: "New York",
        city: "New York",
        cost: 100,
        maxGuests: 1,
        available: true,
        id: 1,
      },
    });
  });
  it("should return only requsted destination and allow update of that destination", async () => {
    const { status: postStatus, text: postText } = await request(app)
      .post("/api/bookings")
      .set("auth", token)
      .send({
        userId: 1,
        destinationId: 1,
        startDate: "2022-03-26T00:15:23.138Z",
        endDate: "2022-03-26T00:15:23.138Z",
        cost: 100,
      });

    expect(postStatus).toBe(201);
    expect(postText).toEqual("Bookings created");

    const { status: getStatus, body: getBody } = await request(app)
      .get("/api/bookings/1")
      .set("auth", token)
      .send();

    expect(getStatus).toBe(200);
    expect(getBody).toMatchObject({
      startDate: "2022-03-26T00:15:23.138Z",
      endDate: "2022-03-26T00:15:23.138Z",
      cost: 100,
      destination: {
        name: "New York",
        description: "description",
        state: "New York",
        city: "New York",
        cost: 100,
        maxGuests: 1,
        available: true,
        id: 1,
      },
    });

    const { status: putStatus } = await request(app)
      .put("/api/bookings/1")
      .set("auth", token)
      .send({
        startDate: "2022-03-26T00:15:23.138Z",
        endDate: "2022-03-26T00:15:23.138Z",
        cost: 10000,
      });

    expect(putStatus).toBe(204);

    const { status: getStatusUpdated, body: getBodyUpdated } = await request(
      app
    )
      .get("/api/bookings/1")
      .set("auth", token)
      .send();

    expect(getStatus).toBe(getStatusUpdated);
    expect(getBodyUpdated).toMatchObject({
      startDate: "2022-03-26T00:15:23.138Z",
      endDate: "2022-03-26T00:15:23.138Z",
      cost: 10000,
    });
  });
  it("should remove destination from destination list on delete", async () => {
    const { status: postStatus, text: postText } = await request(app)
      .post("/api/bookings")
      .set("auth", token)
      .send({
        startDate: "2022-03-26T00:15:23.138Z",
        endDate: "2022-03-26T00:15:23.138Z",
        cost: 100,
        userId: 1,
        destinationId: 1,
      });

    expect(postStatus).toBe(201);
    expect(postText).toEqual("Bookings created");

    const { status: getStatus, body: getBody } = await request(app)
      .get("/api/bookings/")
      .set("auth", token)
      .send();

    expect(getStatus).toBe(200);
    expect(getBody[0]).toMatchObject({
      startDate: "2022-03-26T00:15:23.138Z",
      endDate: "2022-03-26T00:15:23.138Z",
      cost: 100,
      destination: {
        name: "New York",
        description: "description",
        state: "New York",
        city: "New York",
        cost: 100,
        maxGuests: 1,
        available: true,
        id: 1,
      },
    });

    const { status: deleteStatus } = await request(app)
      .delete("/api/bookings/1")
      .set("auth", token)
      .send();

    expect(deleteStatus).toBe(204);

    const { status: getStatusUpdated, body: getBodyUpdated } = await request(
      app
    )
      .get("/api/bookings")
      .set("auth", token)
      .send();

    expect(getStatusUpdated).toBe(200);
    expect(getBodyUpdated).toEqual([]);
  });
});
