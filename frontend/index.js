import { AuthClient } from "@dfinity/auth-client";
import { backend } from "declarations/backend";
import { HttpAgent } from "@dfinity/agent";

class FantasyLeagueApp {
    constructor() {
        this.authClient = null;
        this.identity = null;
        this.currentPage = 'dashboard';
        this.currentLeague = 1; // Default to league 1
        this.myTeams = [];
        this.availablePlayers = [];
        this.agent = null;
    }

    // ... (previous methods remain the same until loadDashboard)

    async loadDashboard() {
        try {
            // Ensure currentLeague is properly handled
            const leagueId = this.currentLeague ?? 1; // Default to 1 if null
            const standingsResult = await backend.getLeagueStandings(leagueId);
            const matchup = await backend.getCurrentMatchup();
            
            if ('ok' in standingsResult) {
                this.renderStandings(standingsResult.ok);
            } else if ('err' in standingsResult) {
                this.showError(standingsResult.err);
            }

            if (matchup) {
                this.renderMatchup(matchup);
            }
        } catch (error) {
            console.error("Dashboard loading error:", error);
            this.showError("Failed to load dashboard data");
        }
    }

    renderStandings(standings) {
        try {
            const standingsElement = this.getElement('leagueStandings');
            if (!standings || standings.length === 0) {
                standingsElement.innerHTML = '<p>No standings available</p>';
                return;
            }

            const standingsHtml = standings.map(standing => `
                <div class="standing-row">
                    <span>Team ${standing.teamId}</span>
                    <span>${standing.wins}-${standing.losses}</span>
                    <span>${standing.points} pts</span>
                </div>
            `).join('');

            standingsElement.innerHTML = standingsHtml;
        } catch (error) {
            console.error("Error rendering standings:", error);
            this.showError("Failed to display standings");
        }
    }

    renderMatchup(matchup) {
        try {
            const matchupElement = this.getElement('currentMatchup');
            if (!matchup) {
                matchupElement.innerHTML = '<p>No current matchup</p>';
                return;
            }

            matchupElement.innerHTML = `
                <div class="matchup-container">
                    <div class="team home">
                        <h4>Team ${matchup.homeTeamId}</h4>
                        <p>${matchup.homeScore}</p>
                    </div>
                    <div class="vs">VS</div>
                    <div class="team away">
                        <h4>Team ${matchup.awayTeamId}</h4>
                        <p>${matchup.awayScore}</p>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error("Error rendering matchup:", error);
            this.showError("Failed to display matchup");
        }
    }

    // ... (rest of the class implementation remains the same)
}

// Initialize the application
const app = new FantasyLeagueApp();
document.addEventListener('DOMContentLoaded', () => {
    app.initialize().catch(error => {
        console.error("Application initialization failed:", error);
        app.showError("Failed to initialize application. Please refresh the page.");
    });
});
