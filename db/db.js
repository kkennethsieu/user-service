import Database from "better-sqlite3";

const db = new Database("./db/mydb.db");

try {
  db.prepare(
    "CREATE TABLE IF NOT EXISTS users (userId INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL, phoneNumber TEXT NOT NULL, avatarURL TEXT DEFAULT 'https://www.freeiconspng.com/img/898', userBio TEXT , mfaToken TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP, updatedAt TEXT DEFAULT CURRENT_TIMESTAMP )"
  ).run();

  // db.exec("DROP TABLE users");

  // db.exec(
  //   "INSERT into users (username, password, phoneNumber) VALUES ('testuser', 'password123', '123-456-7890');"
  // );
} catch (error) {
  console.error("Error creating users table:", error);
}

export default db;
