import { AuthClient } from "@dfinity/auth-client";
import { backend } from "declarations/backend";

// Auth Client
let authClient;
let identity = null;

// State Management
let currentPage = 'dashboard';
let currentLeague = null;
let myTeams = [];
let availablePlayers = [];

// Data Conversion Utilities
function bigIntToNumber(value) {
    return typeof value === 'bigint' ? Number(value) : value;
}

function convertPlayer(player) {
    return {
        ...player,
        id: bigIntToNumber(player.id),
        salary: bigIntToNumber(player.salary),
        projectedPoints: Number(player.projectedPoints),
        stats: player.stats ? {
            ...player.stats,
            points: bigIntToNumber(player.stats.points),
            gamesPlayed: bigIntToNumber(player.stats.gamesPlayed),
            touchdowns: bigIntToNumber(player.stats.touchdowns),
            yards: bigIntToNumber(player.stats.yards)
        } : null
    };
}

function convertTeam(team) {
    return {
        ...team,
        id: bigIntToNumber(team.id),
        players: team.players.map(convertPlayer),
        wins: bigIntToNumber(team.wins),
        losses: bigIntToNumber(team.losses),
        points: Number(team.points)
    };
}

function convertLeague(league) {
    return {
        ...league,
        id: bigIntToNumber(league.id),
        teams: league.teams.map(convertTeam),
        draftDate: bigIntToNumber(league.draftDate),
        teamCount: bigIntToNumber(league.teamCount)
    };
}

function convertMatchup(matchup) {
    return {
        ...matchup,
        id: bigIntToNumber(matchup.id),
        week: bigIntToNumber(matchup.week),
        homeTeam: convertTeam(matchup.homeTeam),
        awayTeam: convertTeam(matchup.awayTeam),
        homeScore: Number(matchup.homeScore),
        awayScore: Number(matchup.awayScore)
    };
}

// Rendering Functions
function renderMatchup(matchup) {
    if (!matchup) {
        document.getElementById('currentMatchup').innerHTML = 'No current matchup';
        return;
    }

    const matchupData = convertMatchup(matchup);
    document.getElementById('currentMatchup').innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <div class="text-center">
                <h6>${matchupData.homeTeam.name}</h6>
                <h4>${matchupData.homeScore.toFixed(1)}</h4>
            </div>
            <div class="text-center">
                <span class="badge bg-secondary">VS</span>
            </div>
            <div class="text-center">
                <h6>${matchupData.awayTeam.name}</h6>
                <h4>${matchupData.awayScore.toFixed(1)}</h4>
            </div>
        </div>
    `;
}

function renderStandings(standings) {
    if (!standings) {
        document.getElementById('leagueStandings').innerHTML = 'No standings available';
        return;
    }

    const teamsData = standings.map(convertTeam);
    const standingsHtml = teamsData
        .map((team, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${team.name}</td>
                <td>${team.wins}</td>
                <td>${team.losses}</td>
                <td>${team.points.toFixed(1)}</td>
            </tr>
        `)
        .join('');

    document.getElementById('leagueStandings').innerHTML = `
        <table class="table table-standings">
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Team</th>
                    <th>W</th>
                    <th>L</th>
                    <th>PTS</th>
                </tr>
            </thead>
            <tbody>
                ${standingsHtml}
            </tbody>
        </table>
    `;
}

function renderLeagues(leagues) {
    const leaguesData = leagues.map(convertLeague);
    const leaguesHtml = leaguesData
        .map(league => `
            <div class="col-md-4 mb-3">
                <div class="card league-card" data-league-id="${league.id}">
                    <div class="card-body">
                        <h5 class="card-title">${league.name}</h5>
                        <p class="card-text">
                            Teams: ${league.teams.length}/${league.teamCount}<br>
                            Status: ${league.status}
                        </p>
                    </div>
                </div>
            </div>
        `)
        .join('');

    document.getElementById('leaguesList').innerHTML = leaguesHtml;
}

function renderTeam(team) {
    if (!team) {
        document.getElementById('teamRoster').innerHTML = 'No team available';
        document.getElementById('teamStats').innerHTML = '';
        return;
    }

    const teamData = convertTeam(team);
    const rosterHtml = teamData.players
        .map(player => `
            <div class="roster-player">
                <span>${player.name} (${player.position})</span>
                <span class="player-stats">
                    ${player.stats ? `${player.stats.points} pts` : 'No stats'}
                </span>
            </div>
        `)
        .join('');

    document.getElementById('teamRoster').innerHTML = rosterHtml;
    document.getElementById('teamStats').innerHTML = `
        <div>
            <p>Record: ${teamData.wins}-${teamData.losses}</p>
            <p>Total Points: ${teamData.points.toFixed(1)}</p>
        </div>
    `;
}

function renderPlayers() {
    const playersHtml = availablePlayers
        .map(player => `
            <div class="col-md-4 mb-3">
                <div class="card player-card">
                    <div class="card-body">
                        <h5 class="card-title">${player.name}</h5>
                        <p class="card-text">
                            ${player.position} - ${player.team}<br>
                            Salary: $${player.salary.toLocaleString()}<br>
                            Projected: ${player.projectedPoints.toFixed(1)} pts
                        </p>
                        <button class="btn btn-primary btn-sm" onclick="addToTeam(${player.id})">
                            Add to Team
                        </button>
                    </div>
                </div>
            </div>
        `)
        .join('');

    document.getElementById('playersList').innerHTML = playersHtml;
}

// Rest of the code remains the same...
// (Authentication, Navigation, Data Loading, and Event Listeners)
