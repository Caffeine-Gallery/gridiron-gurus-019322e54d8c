import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface League {
  'id' : bigint,
  'status' : string,
  'teams' : Array<Team>,
  'name' : string,
  'teamCount' : bigint,
  'draftDate' : bigint,
  'commissioner' : Principal,
}
export interface Matchup {
  'id' : bigint,
  'status' : string,
  'homeTeam' : Team,
  'week' : bigint,
  'homeScore' : number,
  'awayTeam' : Team,
  'awayScore' : number,
}
export interface Player {
  'id' : bigint,
  'projectedPoints' : number,
  'salary' : bigint,
  'name' : string,
  'team' : string,
  'stats' : [] | [PlayerStats],
  'position' : string,
}
export interface PlayerStats {
  'gamesPlayed' : bigint,
  'touchdowns' : bigint,
  'yards' : bigint,
  'points' : bigint,
}
export interface Team {
  'id' : bigint,
  'owner' : Principal,
  'name' : string,
  'wins' : bigint,
  'losses' : bigint,
  'players' : Array<Player>,
  'points' : number,
}
export interface _SERVICE {
  'createLeague' : ActorMethod<
    [{ 'name' : string, 'teamCount' : bigint, 'draftDate' : bigint }],
    bigint
  >,
  'createTeam' : ActorMethod<[string, bigint], [] | [Team]>,
  'getAvailablePlayers' : ActorMethod<[], Array<Player>>,
  'getCurrentMatchup' : ActorMethod<[], [] | [Matchup]>,
  'getLeagueStandings' : ActorMethod<[bigint], [] | [Array<Team>]>,
  'getUserLeagues' : ActorMethod<[], Array<League>>,
  'getUserTeams' : ActorMethod<[], Array<Team>>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
