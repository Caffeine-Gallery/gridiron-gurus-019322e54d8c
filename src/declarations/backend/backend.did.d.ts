import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Player {
  'id' : bigint,
  'projectedPoints' : number,
  'salary' : bigint,
  'name' : string,
  'team' : string,
  'position' : string,
}
export type Team = Array<Player>;
export interface _SERVICE {
  'deleteTeam' : ActorMethod<[], boolean>,
  'getTeam' : ActorMethod<[], [] | [Team]>,
  'saveTeam' : ActorMethod<[Array<Player>], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
