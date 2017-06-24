DROP TABLE IF EXISTS signature;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS users;
CREATE TABLE users(
  id SERIAL PRIMARY KEY,
  firstname VARCHAR(255) NOT NULL,
  lastname VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  hashpassword TEXT,
  datum INTEGER
);
CREATE TABLE user_profiles(
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  age INTEGER,
  city VARCHAR(255),
  webpage TEXT
);
CREATE TABLE signature(
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  signature TEXT
);
