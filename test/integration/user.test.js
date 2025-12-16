import request from "supertest";
import app from "../../app.js";
import db from "../../db/db.js";

// Helper function to create a user in DB

function createTestUser() {
  const info = db
    .prepare(
      `INSERT into users (username, password, phoneNumber) VALUES (?, ?, ?);`
    )
    .run("test", "password", "9999999999");

  // Get the inserted row
  const user = db
    .prepare("SELECT * FROM users WHERE userId = ?")
    .get(info.lastInsertRowid);

  return user;
}

beforeEach(() => {
  // Reset table before each test
  db.prepare("DELETE FROM users").run();
});

afterAll(() => {
  db.close(); // close DB after all tests
});

// get user by Id

describe("GET /userId", () => {
  it("should get a user by id", async () => {
    const user = createTestUser();

    const res = await request(app).get(`/auth/user/${user.userId}`);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("username", "test");
  });
});
