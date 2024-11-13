export const idlFactory = ({ IDL }) => {
  const Matchup = IDL.Record({
    'awayTeamId' : IDL.Nat,
    'homeTeamId' : IDL.Nat,
    'homeScore' : IDL.Nat,
    'awayScore' : IDL.Nat,
  });
  const Standing = IDL.Record({
    'wins' : IDL.Nat,
    'losses' : IDL.Nat,
    'teamId' : IDL.Nat,
    'points' : IDL.Nat,
  });
  const Result = IDL.Variant({ 'ok' : IDL.Vec(Standing), 'err' : IDL.Text });
  return IDL.Service({
    'getCurrentMatchup' : IDL.Func([], [IDL.Opt(Matchup)], ['query']),
    'getLeagueStandings' : IDL.Func([IDL.Opt(IDL.Nat)], [Result], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
