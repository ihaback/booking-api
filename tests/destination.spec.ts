import { initDBWithAdmin, clearDestinations, dropDB } from "../src/utils";
import app from "../src";
import request from "supertest";

describe("/api/destinations", () => {
  let token = "";
  beforeAll(async () => {
    await initDBWithAdmin();

    const { text } = await request(app)
      .post("/api/auth/login")
      .send({ username: "admin", password: "admin" });

    token = text;
  });

  afterEach(async () => {
    await clearDestinations();
  });

  afterAll(async () => {
    await dropDB();
  });

  it("should return an empty list on initial GET /api/destinations", async () => {
    const { status, body } = await request(app)
      .get("/api/destinations")
      .set("auth", token)
      .send();

    expect(status).toBe(200);
    expect(body).toEqual([]);
  });

  it("should return list with 1 user on POST /api/destinations", async () => {
    const { status: postStatus, text: postText } = await request(app)
      .post("/api/destinations")
      .set("auth", token)
      .send({
        name: "New York",
        description: "description",
        state: "New York",
        city: "New York",
        cost: 100,
        maxGuests: 1,
        available: true,
      });

    expect(postStatus).toBe(201);
    expect(postText).toEqual("Destination created");

    const { status: getStatus, body: getBody } = await request(app)
      .get("/api/destinations/")
      .set("auth", token)
      .send();

    expect(getStatus).toBe(200);
    expect(getBody[0]).toMatchObject({
      name: "New York",
      description: "description",
      state: "New York",
      city: "New York",
      cost: 100,
      maxGuests: 1,
      available: true,
    });
  });
  it("should return only requsted destination and allow update of that destination", async () => {
    const { status: postStatus, text: postText } = await request(app)
      .post("/api/destinations")
      .set("auth", token)
      .send({
        name: "New York",
        description: "description",
        state: "New York",
        city: "New York",
        cost: 100,
        maxGuests: 1,
        available: true,
      });

    expect(postStatus).toBe(201);
    expect(postText).toEqual("Destination created");

    const { status: getStatus, body: getBody } = await request(app)
      .get("/api/destinations/1")
      .set("auth", token)
      .send();

    expect(getStatus).toBe(200);
    expect(getBody).toMatchObject({
      name: "New York",
      description: "description",
      state: "New York",
      city: "New York",
      cost: 100,
      maxGuests: 1,
      available: true,
    });

    const { status: putStatus } = await request(app)
      .put("/api/destinations/1")
      .set("auth", token)
      .send({
        name: "Dubai",
        description: "description",
        state: "New York",
        city: "New York",
        cost: 100,
        maxGuests: 1,
        available: true,
      });

    expect(putStatus).toBe(204);

    const { status: getStatusUpdated, body: getBodyUpdated } = await request(
      app
    )
      .get("/api/destinations/1")
      .set("auth", token)
      .send();

    expect(getStatus).toBe(getStatusUpdated);
    expect(getBodyUpdated).toMatchObject({
      name: "Dubai",
      description: "description",
      state: "New York",
      city: "New York",
      cost: 100,
      maxGuests: 1,
      available: true,
    });
  });
  it("should remove destination from destination list on delete", async () => {
    const { status: postStatus, text: postText } = await request(app)
      .post("/api/destinations")
      .set("auth", token)
      .send({
        name: "New York",
        description: "description",
        state: "New York",
        city: "New York",
        cost: 100,
        maxGuests: 1,
        available: true,
      });

    expect(postStatus).toBe(201);
    expect(postText).toEqual("Destination created");

    const { status: getStatus, body: getBody } = await request(app)
      .get("/api/destinations/")
      .set("auth", token)
      .send();

    expect(getStatus).toBe(200);
    expect(getBody[0]).toMatchObject({
      name: "New York",
      description: "description",
      state: "New York",
      city: "New York",
      cost: 100,
      maxGuests: 1,
      available: true,
    });

    const { status: deleteStatus } = await request(app)
      .delete("/api/destinations/1")
      .set("auth", token)
      .send();

    expect(deleteStatus).toBe(204);

    const { status: getStatusUpdated, body: getBodyUpdated } = await request(
      app
    )
      .get("/api/destinations")
      .set("auth", token)
      .send();

    expect(getStatusUpdated).toBe(200);
    expect(getBodyUpdated).toEqual([]);
  });
  it("should not allow creating a new destination with an existing destination name", async () => {
    const { status: postStatus, text: postText } = await request(app)
      .post("/api/destinations")
      .set("auth", token)
      .send({
        name: "New York",
        description: "description",
        state: "New York",
        city: "New York",
        cost: 100,
        maxGuests: 1,
        available: true,
      });

    expect(postStatus).toBe(201);
    expect(postText).toEqual("Destination created");

    const { status: postStatusNew, text: postTextNew } = await request(app)
      .post("/api/destinations")
      .set("auth", token)
      .send({
        name: "New York",
        description: "description",
        state: "New York",
        city: "New York",
        cost: 100,
        maxGuests: 1,
        available: true,
      });

    expect(postStatusNew).toBe(409);
    expect(postTextNew).toEqual("Destination already exist");
  });
});
