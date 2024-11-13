import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Matchup {
  'awayTeamId' : bigint,
  'homeTeamId' : bigint,
  'homeScore' : bigint,
  'awayScore' : bigint,
}
export type Result = { 'ok' : Array<Standing> } |
  { 'err' : string };
export interface Standing {
  'wins' : bigint,
  'losses' : bigint,
  'teamId' : bigint,
  'points' : bigint,
}
export interface _SERVICE {
  'getCurrentMatchup' : ActorMethod<[], [] | [Matchup]>,
  'getLeagueStandings' : ActorMethod<[[] | [bigint]], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
