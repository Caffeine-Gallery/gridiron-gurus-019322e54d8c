import Bool "mo:base/Bool";
import Float "mo:base/Float";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";

import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Hash "mo:base/Hash";
import Nat "mo:base/Nat";
import Text "mo:base/Text";

actor {
    // Player type definition
    public type Player = {
        id: Nat;
        name: Text;
        position: Text;
        team: Text;
        salary: Nat;
        projectedPoints: Float;
    };

    // Team type definition
    public type Team = [Player];

    // Stable variable to store teams
    private stable var teamsEntries : [(Text, Team)] = [];
    private let teams = HashMap.HashMap<Text, Team>(0, Text.equal, Text.hash);

    // System functions for upgrade persistence
    system func preupgrade() {
        teamsEntries := Iter.toArray(teams.entries());
    };

    system func postupgrade() {
        for ((k, v) in teamsEntries.vals()) {
            teams.put(k, v);
        };
    };

    // Save a team for a user
    public shared(msg) func saveTeam(players: [Player]) : async Bool {
        let caller = Principal.toText(msg.caller);
        
        // Validate team size
        if (players.size() != 9) {
            return false;
        };

        // Validate salary cap
        let totalSalary = Array.foldLeft<Player, Nat>(
            players,
            0,
            func (acc: Nat, player: Player) : Nat {
                acc + player.salary
            }
        );

        if (totalSalary > 50000) {
            return false;
        };

        // Save the team
        teams.put(caller, players);
        return true;
    };

    // Get a user's team
    public query(msg) func getTeam() : async ?Team {
        let caller = Principal.toText(msg.caller);
        teams.get(caller)
    };

    // Delete a user's team
    public shared(msg) func deleteTeam() : async Bool {
        let caller = Principal.toText(msg.caller);
        teams.delete(caller);
        return true;
    };
}
