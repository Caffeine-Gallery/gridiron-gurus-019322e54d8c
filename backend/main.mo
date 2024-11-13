import Nat "mo:base/Nat";
import Text "mo:base/Text";

import Array "mo:base/Array";
import Option "mo:base/Option";
import Result "mo:base/Result";

actor {
    type Standing = {
        teamId: Nat;
        wins: Nat;
        losses: Nat;
        points: Nat;
    };

    type Matchup = {
        homeTeamId: Nat;
        awayTeamId: Nat;
        homeScore: Nat;
        awayScore: Nat;
    };

    public query func getLeagueStandings(leagueId: ?Nat) : async Result.Result<[Standing], Text> {
        switch(leagueId) {
            case(null) {
                #err("No league selected")
            };
            case(?id) {
                // Mock data for demonstration
                let standings : [Standing] = [
                    {
                        teamId = 1;
                        wins = 5;
                        losses = 2;
                        points = 450;
                    },
                    {
                        teamId = 2;
                        wins = 4;
                        losses = 3;
                        points = 425;
                    }
                ];
                #ok(standings)
            };
        };
    };

    public query func getCurrentMatchup() : async ?Matchup {
        // Mock data
        ?{
            homeTeamId = 1;
            awayTeamId = 2;
            homeScore = 24;
            awayScore = 21;
        }
    };
};
