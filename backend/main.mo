import Func "mo:base/Func";
import Int "mo:base/Int";

import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Hash "mo:base/Hash";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Float "mo:base/Float";
import Iter "mo:base/Iter";
import Buffer "mo:base/Buffer";

actor {
    // Type definitions must come first
    public type PlayerStats = {
        points: Nat;
        gamesPlayed: Nat;
        touchdowns: Nat;
        yards: Nat;
    };

    public type Player = {
        id: Nat;
        name: Text;
        position: Text;
        team: Text;
        salary: Nat;
        projectedPoints: Float;
        stats: ?PlayerStats;
    };

    public type Team = {
        id: Nat;
        name: Text;
        owner: Principal;
        players: [Player];
        wins: Nat;
        losses: Nat;
        points: Float;
    };

    public type League = {
        id: Nat;
        name: Text;
        teams: [Team];
        commissioner: Principal;
        draftDate: Int;
        teamCount: Nat;
        status: Text;
    };

    public type Matchup = {
        id: Nat;
        week: Nat;
        homeTeam: Team;
        awayTeam: Team;
        homeScore: Float;
        awayScore: Float;
        status: Text;
    };

    // State variables
    private stable var nextPlayerId: Nat = 1;
    private stable var nextTeamId: Nat = 1;
    private stable var nextLeagueId: Nat = 1;
    private stable var nextMatchupId: Nat = 1;

    private var players = HashMap.HashMap<Nat, Player>(0, Nat.equal, Hash.hash);
    private var teams = HashMap.HashMap<Principal, [Team]>(0, Principal.equal, Principal.hash);
    private var leagues = HashMap.HashMap<Nat, League>(0, Nat.equal, Hash.hash);
    private var matchups = HashMap.HashMap<Nat, Matchup>(0, Nat.equal, Hash.hash);

    // League Management
    public shared(msg) func createLeague(request: {name: Text; teamCount: Nat; draftDate: Int}) : async Nat {
        let league : League = {
            id = nextLeagueId;
            name = request.name;
            teams = [];
            commissioner = msg.caller;
            draftDate = request.draftDate;
            teamCount = request.teamCount;
            status = "pre-draft";
        };
        
        leagues.put(nextLeagueId, league);
        nextLeagueId += 1;
        nextLeagueId - 1
    };

    public query(msg) func getUserLeagues() : async [League] {
        let userLeagues = Buffer.Buffer<League>(0);
        for ((_, league) in leagues.entries()) {
            if (league.commissioner == msg.caller or
                Array.find<Team>(league.teams, func(t) { t.owner == msg.caller }) != null) {
                userLeagues.add(league);
            };
        };
        Buffer.toArray(userLeagues)
    };

    public query(msg) func getTeam() : async ?Team {
        let userTeams = Buffer.Buffer<Team>(0);
        for ((_, league) in leagues.entries()) {
            for (team in league.teams.vals()) {
                if (team.owner == msg.caller) {
                    userTeams.add(team);
                };
            };
        };
        if (userTeams.size() > 0) {
            ?userTeams.get(0)
        } else {
            null
        }
    };

    public shared(msg) func createTeam(name: Text, leagueId: Nat) : async ?Team {
        let league = leagues.get(leagueId);
        switch (league) {
            case (null) { null };
            case (?l) {
                if (l.teams.size() >= l.teamCount) { return null; };
                
                let team : Team = {
                    id = nextTeamId;
                    name = name;
                    owner = msg.caller;
                    players = [];
                    wins = 0;
                    losses = 0;
                    points = 0;
                };
                
                nextTeamId += 1;
                
                let updatedTeams = Array.append(l.teams, [team]);
                leagues.put(leagueId, {
                    id = l.id;
                    name = l.name;
                    teams = updatedTeams;
                    commissioner = l.commissioner;
                    draftDate = l.draftDate;
                    teamCount = l.teamCount;
                    status = l.status;
                });
                
                ?team
            };
        }
    };

    public query func getAvailablePlayers() : async [Player] {
        Iter.toArray(players.vals())
    };

    public query func getCurrentMatchup() : async ?Matchup {
        null
    };

    public query func getLeagueStandings(leagueId: ?Nat) : async ?[Team] {
        switch (leagueId) {
            case (null) { null };
            case (?id) {
                let league = leagues.get(id);
                switch (league) {
                    case (null) { null };
                    case (?l) {
                        let sortedTeams = Array.sort<Team>(
                            l.teams,
                            func(a, b) {
                                if (a.wins > b.wins) #less
                                else if (a.wins < b.wins) #greater
                                else if (a.points > b.points) #less
                                else if (a.points < b.points) #greater
                                else #equal
                            }
                        );
                        ?sortedTeams
                    };
                }
            };
        }
    };

    // System Functions
    system func preupgrade() {
        // Implementation for data persistence
    };

    system func postupgrade() {
        // Implementation for data recovery
    };
}
