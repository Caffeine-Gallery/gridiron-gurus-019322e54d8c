import Bool "mo:base/Bool";

import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Hash "mo:base/Hash";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Float "mo:base/Float";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";

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

    // Static player pool
    private let playerPool : [Player] = [
        {
            id = 1;
            name = "Patrick Mahomes";
            position = "QB";
            team = "KC";
            salary = 8500;
            projectedPoints = 24.5;
        },
        {
            id = 2;
            name = "Travis Kelce";
            position = "TE";
            team = "KC";
            salary = 7800;
            projectedPoints = 18.2;
        },
        {
            id = 3;
            name = "Christian McCaffrey";
            position = "RB";
            team = "SF";
            salary = 9000;
            projectedPoints = 22.1;
        },
        {
            id = 4;
            name = "Justin Jefferson";
            position = "WR";
            team = "MIN";
            salary = 8200;
            projectedPoints = 20.3;
        },
        {
            id = 5;
            name = "Ja'Marr Chase";
            position = "WR";
            team = "CIN";
            salary = 7900;
            projectedPoints = 19.8;
        },
        {
            id = 6;
            name = "Josh Allen";
            position = "QB";
            team = "BUF";
            salary = 8300;
            projectedPoints = 23.7;
        },
        {
            id = 7;
            name = "Saquon Barkley";
            position = "RB";
            team = "NYG";
            salary = 7200;
            projectedPoints = 17.5;
        },
        {
            id = 8;
            name = "Davante Adams";
            position = "WR";
            team = "LV";
            salary = 7600;
            projectedPoints = 18.9;
        },
        {
            id = 9;
            name = "George Kittle";
            position = "TE";
            team = "SF";
            salary = 6800;
            projectedPoints = 15.4;
        },
        {
            id = 10;
            name = "Derrick Henry";
            position = "RB";
            team = "TEN";
            salary = 7500;
            projectedPoints = 18.6;
        }
    ];

    // System functions for upgrade persistence
    system func preupgrade() {
        teamsEntries := Iter.toArray(teams.entries());
    };

    system func postupgrade() {
        for ((k, v) in teamsEntries.vals()) {
            teams.put(k, v);
        };
    };

    // Get available players
    public query func getAvailablePlayers() : async [Player] {
        playerPool
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
