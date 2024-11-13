export const idlFactory = ({ IDL }) => {
  const PlayerStats = IDL.Record({
    'gamesPlayed' : IDL.Nat,
    'touchdowns' : IDL.Nat,
    'yards' : IDL.Nat,
    'points' : IDL.Nat,
  });
  const Player = IDL.Record({
    'id' : IDL.Nat,
    'projectedPoints' : IDL.Float64,
    'salary' : IDL.Nat,
    'name' : IDL.Text,
    'team' : IDL.Text,
    'stats' : IDL.Opt(PlayerStats),
    'position' : IDL.Text,
  });
  const Team = IDL.Record({
    'id' : IDL.Nat,
    'owner' : IDL.Principal,
    'name' : IDL.Text,
    'wins' : IDL.Nat,
    'losses' : IDL.Nat,
    'players' : IDL.Vec(Player),
    'points' : IDL.Float64,
  });
  const Matchup = IDL.Record({
    'id' : IDL.Nat,
    'status' : IDL.Text,
    'homeTeam' : Team,
    'week' : IDL.Nat,
    'homeScore' : IDL.Float64,
    'awayTeam' : Team,
    'awayScore' : IDL.Float64,
  });
  const League = IDL.Record({
    'id' : IDL.Nat,
    'status' : IDL.Text,
    'teams' : IDL.Vec(Team),
    'name' : IDL.Text,
    'teamCount' : IDL.Nat,
    'draftDate' : IDL.Int,
    'commissioner' : IDL.Principal,
  });
  return IDL.Service({
    'createLeague' : IDL.Func(
        [
          IDL.Record({
            'name' : IDL.Text,
            'teamCount' : IDL.Nat,
            'draftDate' : IDL.Int,
          }),
        ],
        [IDL.Nat],
        [],
      ),
    'createTeam' : IDL.Func([IDL.Text, IDL.Nat], [IDL.Opt(Team)], []),
    'getAvailablePlayers' : IDL.Func([], [IDL.Vec(Player)], ['query']),
    'getCurrentMatchup' : IDL.Func([], [IDL.Opt(Matchup)], ['query']),
    'getLeagueStandings' : IDL.Func(
        [IDL.Nat],
        [IDL.Opt(IDL.Vec(Team))],
        ['query'],
      ),
    'getUserLeagues' : IDL.Func([], [IDL.Vec(League)], ['query']),
    'getUserTeams' : IDL.Func([], [IDL.Vec(Team)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
