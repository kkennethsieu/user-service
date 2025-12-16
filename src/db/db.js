import Database from "better-sqlite3";

let db;

try {
  if (process.env.NODE_ENV === "test") {
    db = new Database(":memory:"); // in-memory DB for tests
  } else {
    db = new Database("./src/db/mydb.db");
  }
  db.prepare(
    "CREATE TABLE IF NOT EXISTS users (userId INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL, phoneNumber TEXT NOT NULL, avatarURL TEXT DEFAULT 'https://cdn-icons-png.flaticon.com/512/149/149071.png', userBio TEXT , mfaToken TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP, updatedAt TEXT DEFAULT CURRENT_TIMESTAMP )"
  ).run();
  // db.exec("DROP TABLE users");
  // db.exec("DELETE FROM users where userId = 17");
  // db.exec(
  //   "INSERT into users (username, password, phoneNumber) VALUES ('testuser', 'password123', '123-456-7890');"
  // );
} catch (error) {
  console.error("Error creating users table:", error);
}

export default db;
