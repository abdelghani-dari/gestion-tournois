-- PostgreSQL schema for teams, coaches, and players

DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS coaches CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

CREATE TABLE teams (
    teamid bigint PRIMARY KEY,
    name text NOT NULL
);

CREATE TABLE coaches (
    id bigint PRIMARY KEY,
    teamid bigint NOT NULL REFERENCES teams(teamid) ON UPDATE CASCADE ON DELETE CASCADE,
    name text NOT NULL,
    role_key text,
    role_name text,
    country_code char(3),
    country_name text,
    height_cm int,
    age int,
    date_of_birth date,
    exclude_from_ranking boolean
);

CREATE TABLE players (
    id bigint PRIMARY KEY,
    teamid bigint NOT NULL REFERENCES teams(teamid) ON UPDATE CASCADE ON DELETE CASCADE,
    name text NOT NULL,
    squad_title text NOT NULL,
    role_key text,
    role_name text,
    shirt_number int,
    country_code char(3),
    country_name text,
    position_id int,
    position_ids text,
    position_ids_desc text,
    height_cm int,
    age int,
    date_of_birth date,
    injured boolean,
    injury_id text,
    injury_expected_return text,
    rating numeric,
    goals int,
    penalties int,
    assists int,
    red_cards int,
    yellow_cards int,
    exclude_from_ranking boolean,
    transfer_value bigint
);
