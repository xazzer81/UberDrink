DROP TABLE IF EXISTS items CASCADE;
CREATE TABLE items (
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL,
  imgUrl VARCHAR(255) NOT NULL,
  cost INTEGER;
);
