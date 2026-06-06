import json
from pathlib import Path

base = Path(__file__).resolve().parent
src = (base.parent.parent / "frontend" / "public" / "data" / "players.json").resolve()
schema_dst = base / "teams_coaches_players_schema.sql"
seed_dst = base / "teams_coaches_players_seed.sql"

with src.open("r", encoding="utf-8") as f:
    data = json.load(f)

processed = []
for team in data:
    squads = []
    for item in team.get("squad", []):
        if isinstance(item, list):
            squads.extend(item)
        else:
            squads.append(item)
    processed.append({
        "teamid": team.get("teamid"),
        "name": team.get("name", ""),
        "squad": squads,
    })

schema_lines = []
seed_lines = []

schema_lines.append("-- PostgreSQL schema for teams, coaches, and players")
schema_lines.append("")
schema_lines.append("DROP TABLE IF EXISTS players CASCADE;")
schema_lines.append("DROP TABLE IF EXISTS coaches CASCADE;")
schema_lines.append("DROP TABLE IF EXISTS teams CASCADE;")
schema_lines.append("")
schema_lines.append("CREATE TABLE teams (")
schema_lines.append("    teamid bigint PRIMARY KEY,")
schema_lines.append("    name text NOT NULL")
schema_lines.append(");")
schema_lines.append("")
schema_lines.append("CREATE TABLE coaches (")
schema_lines.append("    id bigint PRIMARY KEY,")
schema_lines.append("    teamid bigint NOT NULL REFERENCES teams(teamid) ON UPDATE CASCADE ON DELETE CASCADE,")
schema_lines.append("    name text NOT NULL,")
schema_lines.append("    role_key text,")
schema_lines.append("    role_name text,")
schema_lines.append("    country_code char(3),")
schema_lines.append("    country_name text,")
schema_lines.append("    height_cm int,")
schema_lines.append("    age int,")
schema_lines.append("    date_of_birth date,")
schema_lines.append("    exclude_from_ranking boolean")
schema_lines.append(");")
schema_lines.append("")
schema_lines.append("CREATE TABLE players (")
schema_lines.append("    id bigint PRIMARY KEY,")
schema_lines.append("    teamid bigint NOT NULL REFERENCES teams(teamid) ON UPDATE CASCADE ON DELETE CASCADE,")
schema_lines.append("    name text NOT NULL,")
schema_lines.append("    squad_title text NOT NULL,")
schema_lines.append("    role_key text,")
schema_lines.append("    role_name text,")
schema_lines.append("    shirt_number int,")
schema_lines.append("    country_code char(3),")
schema_lines.append("    country_name text,")
schema_lines.append("    position_id int,")
schema_lines.append("    position_ids text,")
schema_lines.append("    position_ids_desc text,")
schema_lines.append("    height_cm int,")
schema_lines.append("    age int,")
schema_lines.append("    date_of_birth date,")
schema_lines.append("    injured boolean,")
schema_lines.append("    injury_id text,")
schema_lines.append("    injury_expected_return text,")
schema_lines.append("    rating numeric,")
schema_lines.append("    goals int,")
schema_lines.append("    penalties int,")
schema_lines.append("    assists int,")
schema_lines.append("    red_cards int,")
schema_lines.append("    yellow_cards int,")
schema_lines.append("    exclude_from_ranking boolean,")
schema_lines.append("    transfer_value bigint")
schema_lines.append(");")
schema_lines.append("")

seed_lines.append("-- PostgreSQL seed data for teams, coaches, and players")
seed_lines.append("")

for team in processed:
    tid = team["teamid"]
    tname = team["name"].replace("'", "''")
    seed_lines.append(f"INSERT INTO teams (teamid, name) VALUES ({tid}, '{tname}');")

seed_lines.append("")


def sql_val(v):
    if v is None:
        return "NULL"
    if isinstance(v, bool):
        return "TRUE" if v else "FALSE"
    if isinstance(v, (int, float)):
        return str(v)
    s = str(v)
    return "'" + s.replace("'", "''") + "'"

for team in processed:
    tid = team["teamid"]
    for group in team["squad"]:
        title = group.get("title", "")
        members = group.get("members", [])
        for member in members:
            mid = member.get("id")
            if mid is None:
                continue
            role = member.get("role") or {}
            injury = member.get("injury") or {}
            is_coach = title == "coach" or role.get("key") == "coach"
            if is_coach:
                values = [
                    sql_val(mid),
                    sql_val(tid),
                    sql_val(member.get("name", "")),
                    sql_val(role.get("key")),
                    sql_val(role.get("fallback")),
                    sql_val(member.get("ccode")),
                    sql_val(member.get("cname")),
                    sql_val(member.get("height")),
                    sql_val(member.get("age")),
                    sql_val(member.get("dateOfBirth")),
                    sql_val(member.get("excludeFromRanking")),
                ]
                seed_lines.append(
                    "INSERT INTO coaches (id, teamid, name, role_key, role_name, country_code, country_name, height_cm, age, date_of_birth, exclude_from_ranking) VALUES ("
                    + ", ".join(values)
                    + ");"
                )
            else:
                values = [
                    sql_val(mid),
                    sql_val(tid),
                    sql_val(member.get("name", "")),
                    sql_val(title),
                    sql_val(role.get("key")),
                    sql_val(role.get("fallback")),
                    sql_val(member.get("shirtNumber")),
                    sql_val(member.get("ccode")),
                    sql_val(member.get("cname")),
                    sql_val(member.get("positionId")),
                    sql_val(member.get("positionIds")),
                    sql_val(member.get("positionIdsDesc")),
                    sql_val(member.get("height")),
                    sql_val(member.get("age")),
                    sql_val(member.get("dateOfBirth")),
                    sql_val(member.get("injured")),
                    sql_val(injury.get("id")),
                    sql_val(injury.get("expectedReturn")),
                    sql_val(member.get("rating")),
                    sql_val(member.get("goals")),
                    sql_val(member.get("penalties")),
                    sql_val(member.get("assists")),
                    sql_val(member.get("rcards")),
                    sql_val(member.get("ycards")),
                    sql_val(member.get("excludeFromRanking")),
                    sql_val(member.get("transferValue")),
                ]
                seed_lines.append(
                    "INSERT INTO players (id, teamid, name, squad_title, role_key, role_name, shirt_number, country_code, country_name, position_id, position_ids, position_ids_desc, height_cm, age, date_of_birth, injured, injury_id, injury_expected_return, rating, goals, penalties, assists, red_cards, yellow_cards, exclude_from_ranking, transfer_value) VALUES ("
                    + ", ".join(values)
                    + ");"
                )

seed_lines.append("")

schema_dst.write_text("\n".join(schema_lines), encoding="utf-8")
seed_dst.write_text("\n".join(seed_lines), encoding="utf-8")
print(f"Generated {schema_dst} and {seed_dst} with {len(processed)} teams and {sum(len(group.get('members', [])) for team in processed for group in team['squad'])} members.")
