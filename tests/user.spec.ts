import { initDBWithAdmin, clearDB, dropDB, createAdmin } from "../src/utils";
import app from "../src";
import request from "supertest";

describe("/api/users", () => {
  let token = "";
  beforeAll(async () => {
    await initDBWithAdmin();
  });

  beforeEach(async () => {
    const { text } = await request(app)
      .post("/api/auth/login")
      .send({ username: "admin", password: "admin" });

    token = text;
  });

  afterEach(async () => {
    await clearDB();
    await createAdmin();
  });

  afterAll(async () => {
    await dropDB();
  });

  it("should return an empty list on initial GET /api/users", async () => {
    const { status, body } = await request(app)
      .get("/api/users")
      .set("auth", token);

    expect(status).toBe(200);
    expect(body[0]).toEqual({
      bookings: [],
      id: 1,
      role: "ADMIN",
      username: "admin",
    });
  });

  it("should return list with 2 users after POST /api/users", async () => {
    const { status: postStatus, text: postText } = await request(app)
      .post("/api/users")
      .set("auth", token)
      .send({ username: `user`, password: "user", role: "USER" });

    expect(postStatus).toBe(201);
    expect(postText).toEqual("User created");

    const { status: getStatus, body: getBody } = await request(app)
      .get("/api/users/")
      .set("auth", token)
      .send();

    expect(getStatus).toBe(200);
    expect(getBody).toHaveLength(2);
    expect(getBody[0]).toEqual({
      id: 2,
      username: "user",
      role: "USER",
      bookings: [],
    });
  });
  it("should return only requsted user and allow update of that user", async () => {
    const { status: postStatus, text: postText } = await request(app)
      .post("/api/users")
      .set("auth", token)
      .send({ username: "user", password: "user", role: "USER" });

    expect(postStatus).toBe(201);
    expect(postText).toEqual("User created");

    const { status: getStatus, body: getBody } = await request(app)
      .get("/api/users/2")
      .set("auth", token)
      .send();

    expect(getStatus).toBe(200);
    expect(getBody).toEqual({
      id: 2,
      username: "user",
      role: "USER",
      bookings: [],
    });

    const { status: putStatus } = await request(app)
      .put("/api/users/2")
      .set("auth", token)
      .send({
        username: `user`,
        role: "USER",
      });

    expect(putStatus).toBe(204);

    const { status: getStatusUpdated, body: getBodyUpdated } = await request(
      app
    )
      .get("/api/users/2")
      .set("auth", token)
      .send();

    expect(getStatusUpdated).toBe(200);
    expect(getBodyUpdated).toEqual({
      id: 2,
      username: "user",
      role: "USER",
      bookings: [],
    });
  });
  it("should remove user from users list on delete", async () => {
    const { status: postStatus, text: postText } = await request(app)
      .post("/api/users")
      .set("auth", token)
      .send({ username: "user", password: "user", role: "USER" });

    expect(postStatus).toBe(201);
    expect(postText).toEqual("User created");

    const { status: getStatus, body: getBody } = await request(app)
      .get("/api/users/")
      .set("auth", token)
      .send();

    expect(getStatus).toBe(200);
    expect(getBody.sort((a: any, b: any) => a.id - b.id)[0]).toEqual({
      id: 1,
      username: "admin",
      role: "ADMIN",
      bookings: [],
    });
    expect(getBody.sort((a: any, b: any) => a.id - b.id)[1]).toEqual({
      id: 2,
      username: "user",
      role: "USER",
      bookings: [],
    });

    const { status: deleteStatus } = await request(app)
      .delete("/api/users/2")
      .set("auth", token)
      .send();

    expect(deleteStatus).toBe(204);
  });
  it("should not allow creating a new user with an existing username", async () => {
    const { status: postStatus, text: postText } = await request(app)
      .post("/api/users")
      .set("auth", token)
      .send({ username: "user", password: "user", role: "USER" });

    expect(postStatus).toBe(201);
    expect(postText).toEqual("User created");

    const { status: postStatusNew, text: postTextNew } = await request(app)
      .post("/api/users")
      .set("auth", token)
      .send({ username: "user", password: "user", role: "USER" });

    expect(postStatusNew).toBe(409);
    expect(postTextNew).toEqual("Username already in use");
  });
  it("should return error when trying to access a non existing user", async () => {
    const { status: getStatus, text: getText } = await request(app)
      .get("/api/users/5354354354543")
      .set("auth", token)
      .send({ username: `admin`, role: "ADMIN", password: "admin" });

    expect(getStatus).toBe(404);
    expect(getText).toEqual("User not found");

    const { status: putStatus, text: putText } = await request(app)
      .put("/api/users/5354354354543")
      .set("auth", token)
      .send({ username: `admin`, role: "ADMIN", password: "admin" });

    expect(putStatus).toBe(404);
    expect(putText).toEqual("User not found");

    const { status: deleteStatus, text: deleteText } = await request(app)
      .delete("/api/users/5354354354543")
      .set("auth", token)
      .send({ username: `admin`, role: "ADMIN", password: "admin" });

    expect(deleteStatus).toBe(404);
    expect(deleteText).toEqual("User not found");
  });
});
