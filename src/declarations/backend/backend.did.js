export const idlFactory = ({ IDL }) => {
  const Player = IDL.Record({
    'id' : IDL.Nat,
    'projectedPoints' : IDL.Float64,
    'salary' : IDL.Nat,
    'name' : IDL.Text,
    'team' : IDL.Text,
    'position' : IDL.Text,
  });
  const Team = IDL.Vec(Player);
  return IDL.Service({
    'deleteTeam' : IDL.Func([], [IDL.Bool], []),
    'getAvailablePlayers' : IDL.Func([], [IDL.Vec(Player)], ['query']),
    'getTeam' : IDL.Func([], [IDL.Opt(Team)], ['query']),
    'saveTeam' : IDL.Func([IDL.Vec(Player)], [IDL.Bool], []),
  });
};
export const init = ({ IDL }) => { return []; };
