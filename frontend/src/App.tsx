import { useEffect, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { API_BASE, apiRequest, type ApiResult } from "./api";

type FormSubmitEvent = FormEvent<HTMLFormElement>;

type FieldProps = {
  label: string;
  name: string;
  value: string;
  type?: string;
  autoComplete?: string;
  onChange: (name: string, value: string) => void;
};

function Field({ label, name, value, type = "text", autoComplete, onChange }: FieldProps) {
  return (
    <label htmlFor={name}>
      <span>{label}</span>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(name, event.target.value)}
      />
    </label>
  );
}

function TextArea({ label, name, value, onChange }: FieldProps) {
  return (
    <label htmlFor={name}>
      <span>{label}</span>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
      />
    </label>
  );
}

function jsonBody<T extends Record<string, string | number | null>>(data: T) {
  const cleaned = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== "" && value !== null),
  );

  return JSON.stringify(cleaned);
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("jwt_token") ?? "");
  const [responseTitle, setResponseTitle] = useState("Ready");
  const [response, setResponse] = useState<unknown>({
    apiBase: API_BASE,
    message: "Use this prototype to test the Laravel API.",
  });
  const [currentUser, setCurrentUser] = useState<unknown>(null);

  const [loginForm, setLoginForm] = useState({
    email: "user@example.com",
    password: "password",
  });
  const [tournamentForm, setTournamentForm] = useState({
    name: "JWT Cup",
    city: "Taourirt",
    location: "Stade local",
    start_date: "2026-07-01",
    end_date: "2026-07-10",
  });
  const [adminNote, setAdminNote] = useState("");
  const [teamForm, setTeamForm] = useState({ name: "Atlas FC", city: "Taourirt" });
  const [playerForm, setPlayerForm] = useState({
    team_id: "1",
    first_name: "Youssef",
    last_name: "Amrani",
    position: "ST",
    number: "9",
  });
  const [joinForm, setJoinForm] = useState({
    tournament_id: "1",
    team_id: "1",
    message: "We want to join this tournament",
  });
  const [matchForm, setMatchForm] = useState({
    tournament_id: "1",
    home_team_id: "1",
    away_team_id: "2",
    match_date: "2026-07-02 18:00:00",
  });
  const [resultForm, setResultForm] = useState({
    match_id: "1",
    home_score: "2",
    away_score: "1",
  });
  const [rankingTournamentId, setRankingTournamentId] = useState("1");
  const [statisticForm, setStatisticForm] = useState({
    match_game_id: "1",
    team_id: "1",
    player_id: "1",
    stat_type: "goal",
    value: "1",
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem("jwt_token", token);
    } else {
      localStorage.removeItem("jwt_token");
      setCurrentUser(null);
    }
  }, [token]);

  const writeResponse = (title: string, result: ApiResult | unknown) => {
    setResponseTitle(title);
    setResponse(result);
  };

  const request = async (title: string, path: string, options: RequestInit = {}) => {
    try {
      const result = await apiRequest(path, token, options);
      writeResponse(title, result);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      writeResponse(title, { ok: false, status: 0, data: { message } });
      return null;
    }
  };

  const change =
    <T extends Record<string, string>>(setter: Dispatch<SetStateAction<T>>) =>
    (name: string, value: string) => {
      setter((current) => ({ ...current, [name]: value }) as T);
    };

  const login = async (email?: string) => {
    const body = {
      email: email ?? loginForm.email,
      password: loginForm.password,
    };
    const result = await apiRequest("/login", "", {
      method: "POST",
      body: JSON.stringify(body),
    });

    writeResponse("Login", result);

    if (result.ok && result.data && typeof result.data === "object" && "token" in result.data) {
      setToken(String(result.data.token));
      setCurrentUser("user" in result.data ? result.data.user : null);
    }
  };

  const loadMe = async () => {
    const result = await request("Current user", "/me");
    if (result?.ok) {
      setCurrentUser(result.data);
    }
  };

  const logout = async () => {
    await request("Logout", "/logout", { method: "POST" });
    setToken("");
  };

  const submitTournament = (event: FormSubmitEvent) => {
    event.preventDefault();
    request("Create tournament", "/tournaments", {
      method: "POST",
      body: jsonBody(tournamentForm),
    });
  };

  const submitTeam = (event: FormSubmitEvent) => {
    event.preventDefault();
    request("Create team", "/teams", {
      method: "POST",
      body: jsonBody(teamForm),
    });
  };

  const submitPlayer = (event: FormSubmitEvent) => {
    event.preventDefault();
    request("Create player", "/players", {
      method: "POST",
      body: jsonBody({
        ...playerForm,
        team_id: Number(playerForm.team_id),
        number: Number(playerForm.number),
      }),
    });
  };

  const submitJoinRequest = (event: FormSubmitEvent) => {
    event.preventDefault();
    request("Create join request", "/join-requests", {
      method: "POST",
      body: jsonBody({
        ...joinForm,
        tournament_id: Number(joinForm.tournament_id),
        team_id: Number(joinForm.team_id),
      }),
    });
  };

  const submitMatch = (event: FormSubmitEvent) => {
    event.preventDefault();
    request("Create match", "/matches", {
      method: "POST",
      body: jsonBody({
        ...matchForm,
        tournament_id: Number(matchForm.tournament_id),
        home_team_id: Number(matchForm.home_team_id),
        away_team_id: Number(matchForm.away_team_id),
      }),
    });
  };

  const submitResult = (event: FormSubmitEvent) => {
    event.preventDefault();
    request("Enter result", `/matches/${resultForm.match_id}/result`, {
      method: "PUT",
      body: jsonBody({
        home_score: Number(resultForm.home_score),
        away_score: Number(resultForm.away_score),
      }),
    });
  };

  const submitStatistic = (event: FormSubmitEvent) => {
    event.preventDefault();
    request("Create statistic", "/statistics", {
      method: "POST",
      body: jsonBody({
        ...statisticForm,
        match_game_id: Number(statisticForm.match_game_id),
        team_id: Number(statisticForm.team_id),
        player_id: Number(statisticForm.player_id),
        value: Number(statisticForm.value),
      }),
    });
  };

  return (
    <main>
      <header className="hero">
        <div>
          <p>Gestion Tournois</p>
          <h1>API Tester Prototype</h1>
          <span>{API_BASE}</span>
        </div>
        <button onClick={async () => {
          const result = await apiRequest("/teams", "", {
            method: "POST",
            body: JSON.stringify({ name: "No Token Team" }),
          });
          writeResponse("Protected action without token", result);
        }}>
          Test Protected Action
        </button>
      </header>

      <section className="grid">
        <article className="card wide">
          <h2>Auth Panel</h2>
          <div className="status">
            <strong>Token:</strong> {token ? "stored in localStorage" : "none"}
          </div>
          <form onSubmit={(event) => {
            event.preventDefault();
            login();
          }}>
            <Field label="Email" name="email" value={loginForm.email} autoComplete="username" onChange={change(setLoginForm)} />
            <Field label="Password" name="password" type="password" value={loginForm.password} autoComplete="current-password" onChange={change(setLoginForm)} />
            <div className="actions">
              <button type="submit">Login</button>
              <button type="button" onClick={() => login("admin@example.com")}>Login as Admin</button>
              <button type="button" onClick={() => login("user@example.com")}>Login as User</button>
              <button type="button" onClick={loadMe}>GET /me</button>
              <button type="button" onClick={logout}>Logout</button>
            </div>
          </form>
          <pre>{JSON.stringify(currentUser, null, 2)}</pre>
        </article>

        <article className="card">
          <h2>Public Tournaments</h2>
          <button onClick={() => request("Public tournaments", "/tournaments")}>Load public tournaments</button>
        </article>

        <article className="card">
          <h2>User Tournament Panel</h2>
          <form onSubmit={submitTournament}>
            <Field label="Name" name="name" value={tournamentForm.name} onChange={change(setTournamentForm)} />
            <Field label="City" name="city" value={tournamentForm.city} onChange={change(setTournamentForm)} />
            <Field label="Location" name="location" value={tournamentForm.location} onChange={change(setTournamentForm)} />
            <Field label="Start date" name="start_date" type="date" value={tournamentForm.start_date} onChange={change(setTournamentForm)} />
            <Field label="End date" name="end_date" type="date" value={tournamentForm.end_date} onChange={change(setTournamentForm)} />
            <button type="submit">Create tournament</button>
          </form>
          <button onClick={() => request("My tournaments", "/my-tournaments")}>GET /my-tournaments</button>
        </article>

        <article className="card">
          <h2>Admin Panel</h2>
          <button onClick={() => request("Pending tournaments", "/admin/tournaments/pending")}>Load pending</button>
          <Field label="Admin note" name="admin_note" value={adminNote} onChange={(_, value) => setAdminNote(value)} />
          <p className="hint">Use an ID from the response list.</p>
          <div className="actions">
            <button onClick={() => {
              const id = prompt("Tournament ID to accept");
              if (id) request("Accept tournament", `/admin/tournaments/${id}/accept`, { method: "PUT" });
            }}>Accept</button>
            <button onClick={() => {
              const id = prompt("Tournament ID to refuse");
              if (id) request("Refuse tournament", `/admin/tournaments/${id}/refuse`, {
                method: "PUT",
                body: JSON.stringify({ admin_note: adminNote }),
              });
            }}>Refuse</button>
          </div>
        </article>

        <article className="card">
          <h2>Teams Panel</h2>
          <form onSubmit={submitTeam}>
            <Field label="Name" name="name" value={teamForm.name} onChange={change(setTeamForm)} />
            <Field label="City" name="city" value={teamForm.city} onChange={change(setTeamForm)} />
            <button type="submit">Create team</button>
          </form>
          <button onClick={() => request("My teams", "/my-teams")}>GET /my-teams</button>
        </article>

        <article className="card">
          <h2>Players Panel</h2>
          <form onSubmit={submitPlayer}>
            <Field label="Team ID" name="team_id" type="number" value={playerForm.team_id} onChange={change(setPlayerForm)} />
            <Field label="First name" name="first_name" value={playerForm.first_name} onChange={change(setPlayerForm)} />
            <Field label="Last name" name="last_name" value={playerForm.last_name} onChange={change(setPlayerForm)} />
            <Field label="Position" name="position" value={playerForm.position} onChange={change(setPlayerForm)} />
            <Field label="Number" name="number" type="number" value={playerForm.number} onChange={change(setPlayerForm)} />
            <button type="submit">Create player</button>
          </form>
        </article>

        <article className="card">
          <h2>Join Requests Panel</h2>
          <form onSubmit={submitJoinRequest}>
            <Field label="Tournament ID" name="tournament_id" type="number" value={joinForm.tournament_id} onChange={change(setJoinForm)} />
            <Field label="Team ID" name="team_id" type="number" value={joinForm.team_id} onChange={change(setJoinForm)} />
            <TextArea label="Message" name="message" value={joinForm.message} onChange={change(setJoinForm)} />
            <button type="submit">Send request</button>
          </form>
          <div className="actions">
            <button onClick={() => request("Join requests", "/join-requests")}>List requests</button>
            <button onClick={() => {
              const id = prompt("Join request ID to accept");
              if (id) request("Accept join request", `/join-requests/${id}/accept`, { method: "PUT" });
            }}>Accept</button>
            <button onClick={() => {
              const id = prompt("Join request ID to refuse");
              if (id) request("Refuse join request", `/join-requests/${id}/refuse`, { method: "PUT" });
            }}>Refuse</button>
          </div>
        </article>

        <article className="card">
          <h2>Matches Panel</h2>
          <form onSubmit={submitMatch}>
            <Field label="Tournament ID" name="tournament_id" type="number" value={matchForm.tournament_id} onChange={change(setMatchForm)} />
            <Field label="Home team ID" name="home_team_id" type="number" value={matchForm.home_team_id} onChange={change(setMatchForm)} />
            <Field label="Away team ID" name="away_team_id" type="number" value={matchForm.away_team_id} onChange={change(setMatchForm)} />
            <Field label="Match date" name="match_date" value={matchForm.match_date} onChange={change(setMatchForm)} />
            <button type="submit">Create match</button>
          </form>
          <button onClick={() => request("Matches", "/matches")}>List matches</button>
          <form onSubmit={submitResult}>
            <Field label="Match ID" name="match_id" type="number" value={resultForm.match_id} onChange={change(setResultForm)} />
            <Field label="Home score" name="home_score" type="number" value={resultForm.home_score} onChange={change(setResultForm)} />
            <Field label="Away score" name="away_score" type="number" value={resultForm.away_score} onChange={change(setResultForm)} />
            <button type="submit">Enter result</button>
          </form>
          <div className="actions">
            <button onClick={() => request("Confirm result", `/matches/${resultForm.match_id}/confirm-result`, { method: "PUT" })}>Confirm</button>
            <button onClick={() => request("Dispute result", `/matches/${resultForm.match_id}/dispute-result`, { method: "PUT" })}>Dispute</button>
          </div>
        </article>

        <article className="card">
          <h2>Rankings Panel</h2>
          <Field label="Tournament ID" name="ranking_tournament_id" type="number" value={rankingTournamentId} onChange={(_, value) => setRankingTournamentId(value)} />
          <div className="actions">
            <button onClick={() => request("Rankings", `/rankings?tournament_id=${rankingTournamentId}`)}>Load rankings</button>
            <button onClick={() => request("Recalculate rankings", "/rankings/recalculate", {
              method: "POST",
              body: JSON.stringify({ tournament_id: Number(rankingTournamentId) }),
            })}>Recalculate</button>
          </div>
        </article>

        <article className="card">
          <h2>Statistics Panel</h2>
          <form onSubmit={submitStatistic}>
            <Field label="Match ID" name="match_game_id" type="number" value={statisticForm.match_game_id} onChange={change(setStatisticForm)} />
            <Field label="Team ID" name="team_id" type="number" value={statisticForm.team_id} onChange={change(setStatisticForm)} />
            <Field label="Player ID" name="player_id" type="number" value={statisticForm.player_id} onChange={change(setStatisticForm)} />
            <label htmlFor="stat_type">
              <span>Type</span>
              <select
                id="stat_type"
                name="stat_type"
                value={statisticForm.stat_type}
                onChange={(event) => setStatisticForm((current) => ({ ...current, stat_type: event.target.value }))}
              >
                <option value="goal">goal</option>
                <option value="assist">assist</option>
                <option value="yellow_card">yellow_card</option>
                <option value="red_card">red_card</option>
                <option value="clean_sheet">clean_sheet</option>
              </select>
            </label>
            <Field label="Value" name="value" type="number" value={statisticForm.value} onChange={change(setStatisticForm)} />
            <button type="submit">Add statistic</button>
          </form>
          <button onClick={() => request("Statistics", "/statistics")}>List statistics</button>
        </article>

        <article className="card wide response-card">
          <h2>Response: {responseTitle}</h2>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </article>
      </section>
    </main>
  );
}

export default App;
