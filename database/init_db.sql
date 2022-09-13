-- Language: psql

CREATE USER backend PASSWORD 'test_password';

-- CREATING EXTENSION FOR POSTGRESQL CRYPTO
CREATE EXTENSION pgcrypto;

-- CREATING TABLES
-- USERS
/*CREATE TABLE users
(
    id          SERIAL,
    login       VARCHAR(10)  NOT NULL,
    nickname    VARCHAR(30) NOT NULL,
    wins        INTEGER DEFAULT 0,
    losses      INTEGER DEFAULT 0,
    level       INTEGER DEFAULT 0,
    rank        INTEGER DEFAULT 0,
    profile_pic VARCHAR,
    totpsecret  VARCHAR,
    uid         INTEGER PRIMARY KEY
);

ALTER TABLE users
    OWNER TO backend;
-- INDEXING USERS
CREATE UNIQUE INDEX users_login_uindex
    ON users (login);

CREATE UNIQUE INDEX users_uid_uindex
    ON users (uid);

--FRIENDLIST
CREATE TABLE friendlist
(
    id       BIGSERIAL PRIMARY KEY,
    id_user1 INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
    id_user2 INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
    CONSTRAINT friendlist_check
        CHECK (id_user1 < id_user2)
);

ALTER TABLE friendlist
    OWNER TO backend;

-- FRIENDLIST & BLACKLIST
CREATE TABLE blacklist
(
    id       BIGSERIAL PRIMARY KEY,
    id_user1 INTEGER NOT NULL, -- REFERENCES users ON DELETE CASCADE,
    id_user2 INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
    CONSTRAINT blacklist_check
        CHECK (id_user1 < id_user2)
);

ALTER TABLE blacklist
    OWNER TO backend;

-- HISTORY
CREATE TABLE matches_history
(
    id          BIGSERIAL PRIMARY KEY,
    id_user1    INTEGER NOT NULL REFERENCES users,
    score_user1 INTEGER DEFAULT 0,
    id_user2    INTEGER NOT NULL REFERENCES users,
    score_user2 INTEGER DEFAULT 0,
    winner      INTEGER NOT NULL REFERENCES users,
    CONSTRAINT matches_history_check
        CHECK (id_user1 < id_user2)
);

ALTER TABLE matches_history
    OWNER TO backend;

-- CHAT-FUNCTIONALITY
-- ROOMS TABLE
CREATE TABLE rooms
(
    id            SERIAL PRIMARY KEY,
    room_name     VARCHAR(30),
    description   TEXT,
    room_password VARCHAR(255),
    identifiant   INTEGER,
    owner_id      INTEGER NOT NULL REFERENCES users ON DELETE CASCADE
);

ALTER TABLE rooms
    OWNER TO backend;
-- INDEXING ROOMS BY IDENTIFIANT
CREATE UNIQUE INDEX rooms_identifiant_uindex
    ON rooms (identifiant);

-- MESSAGES TABLE
CREATE TABLE messages
(
    id      BIGSERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES rooms ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
    content TEXT
);

ALTER TABLE messages
    OWNER TO backend;

-- INDEXING MESSAGES BY ROOM ID
CREATE INDEX idx_messages_rooms
    ON messages (room_id);

-- PARTICIPANTS TABLE
CREATE TABLE participants
(
    id      BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
    room_id INTEGER NOT NULL -- REFERENCES rooms ON DELETE CASCADE
);

ALTER TABLE participants
    OWNER TO backend;

-- ROOMS ADMINS TABLE
CREATE TABLE rooms_admins
(
	id      BIGSERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
	room_id INTEGER NOT NULL -- REFERENCES rooms ON DELETE CASCADE
);

ALTER TABLE rooms_admins
	OWNER TO backend;
*/
