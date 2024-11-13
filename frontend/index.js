import { AuthClient } from "@dfinity/auth-client";
import { backend } from "declarations/backend";
import { HttpAgent } from "@dfinity/agent";

class FantasyLeagueApp {
    constructor() {
        this.authClient = null;
        this.identity = null;
        this.currentPage = 'dashboard';
        this.currentLeague = null;
        this.myTeams = [];
        this.availablePlayers = [];
        this.agent = null;
    }

    async initialize() {
        try {
            this.authClient = await AuthClient.create({
                idleOptions: {
                    disableDefaultIdleCallback: true,
                    disableIdle: true
                }
            });

            if (await this.authClient.isAuthenticated()) {
                this.identity = await this.authClient.getIdentity();
                await this.handleAuthenticated();
            }
            this.setupAuthListeners();
        } catch (error) {
            console.error("Initialization error:", error);
            this.showError("Failed to initialize application");
        }
    }

    setupAuthListeners() {
        const loginButton = this.getElement('loginButton');
        const logoutButton = this.getElement('logoutButton');

        loginButton.addEventListener('click', async () => {
            try {
                const days = BigInt(1);
                const hours = BigInt(24);
                const nanoseconds = BigInt(3600000000000);

                await this.authClient.login({
                    identityProvider: "https://identity.ic0.app",
                    maxTimeToLive: days * hours * nanoseconds,
                    onSuccess: async () => {
                        this.identity = await this.authClient.getIdentity();
                        await this.handleAuthenticated();
                    },
                    onError: (error) => {
                        console.error("Login error:", error);
                        this.showError("Failed to login. Please try again.");
                    }
                });
            } catch (error) {
                console.error("Login error:", error);
                this.showError("Failed to login. Please try again.");
            }
        });

        logoutButton.addEventListener('click', async () => {
            try {
                await this.authClient.logout();
                this.identity = null;
                await this.handleUnauthenticated();
            } catch (error) {
                console.error("Logout error:", error);
                this.showError("Failed to logout. Please try again.");
            }
        });
    }

    async handleAuthenticated() {
        try {
            this.safelyToggleClass('loginMessage', 'd-none', 'add');
            this.safelyToggleClass('mainContent', 'd-none', 'remove');
            this.safelyToggleClass('loginButton', 'd-none', 'add');
            this.safelyToggleClass('logoutButton', 'd-none', 'remove');

            this.agent = new HttpAgent({ identity: this.identity });
            await this.loadUserData();
        } catch (error) {
            console.error("Authentication handling error:", error);
            this.showError("Failed to initialize user session");
        }
    }

    async handleUnauthenticated() {
        try {
            this.safelyToggleClass('loginMessage', 'd-none', 'remove');
            this.safelyToggleClass('mainContent', 'd-none', 'add');
            this.safelyToggleClass('loginButton', 'd-none', 'remove');
            this.safelyToggleClass('logoutButton', 'd-none', 'add');

            this.currentLeague = null;
            this.myTeams = [];
            this.availablePlayers = [];
        } catch (error) {
            console.error("Unauthentication handling error:", error);
            this.showError("Failed to handle logout");
        }
    }

    async loadUserData() {
        try {
            await Promise.all([
                this.loadDashboard(),
                this.loadLeagues(),
                this.loadTeam(),
                this.loadPlayers()
            ]);
        } catch (error) {
            console.error("Data loading error:", error);
            this.showError("Failed to load user data");
        }
    }

    async loadDashboard() {
        try {
            const standings = await backend.getLeagueStandings(this.currentLeague);
            const matchup = await backend.getCurrentMatchup();
            
            if (standings) {
                this.renderStandings(standings);
            }
            if (matchup) {
                this.renderMatchup(matchup);
            }
        } catch (error) {
            console.error("Dashboard loading error:", error);
            this.showError("Failed to load dashboard data");
        }
    }

    async loadLeagues() {
        try {
            const leagues = await backend.getUserLeagues();
            this.renderLeagues(leagues);
        } catch (error) {
            console.error("Leagues loading error:", error);
            this.showError("Failed to load leagues");
        }
    }

    async loadTeam() {
        try {
            const team = await backend.getTeam();
            this.renderTeam(team);
        } catch (error) {
            console.error("Team loading error:", error);
            this.showError("Failed to load team data");
        }
    }

    async loadPlayers() {
        try {
            this.availablePlayers = await backend.getAvailablePlayers();
            this.renderPlayers();
        } catch (error) {
            console.error("Players loading error:", error);
            this.showError("Failed to load players");
        }
    }

    getElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            throw new Error(`Element with id '${id}' not found`);
        }
        return element;
    }

    safelyToggleClass(elementId, className, action) {
        try {
            const element = this.getElement(elementId);
            if (action === 'add') {
                element.classList.add(className);
            } else if (action === 'remove') {
                element.classList.remove(className);
            }
        } catch (error) {
            console.error(`Class toggle error for '${elementId}'`, error);
        }
    }

    showError(message) {
        try {
            const container = document.querySelector('.container');
            if (!container) {
                console.error("Container element not found");
                return;
            }

            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-danger alert-dismissible fade show';
            errorDiv.role = 'alert';
            errorDiv.innerHTML = `
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            `;
            container.insertBefore(errorDiv, container.firstChild);
        } catch (error) {
            console.error("Error display failed:", error);
        }
    }

    // Rendering methods will be implemented here
    renderStandings(standings) {
        // Implementation
    }

    renderMatchup(matchup) {
        // Implementation
    }

    renderLeagues(leagues) {
        // Implementation
    }

    renderTeam(team) {
        // Implementation
    }

    renderPlayers() {
        // Implementation
    }
}

// Initialize the application
const app = new FantasyLeagueApp();
document.addEventListener('DOMContentLoaded', () => {
    app.initialize().catch(error => {
        console.error("Application initialization failed:", error);
        app.showError("Failed to initialize application. Please refresh the page.");
    });
});
