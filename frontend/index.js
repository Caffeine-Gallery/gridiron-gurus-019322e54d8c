import { AuthClient } from "@dfinity/auth-client";
import { backend } from "declarations/backend";
import { HttpAgent } from "@dfinity/agent";

// Auth Client
let authClient = null;
let identity = null;

// State Management
let currentPage = 'dashboard';
let currentLeague = null;
let myTeams = [];
let availablePlayers = [];

// Data Loading Functions
async function loadUserData() {
    try {
        await Promise.all([
            loadDashboard(),
            loadLeagues(),
            loadTeam(),
            loadPlayers()
        ]);
    } catch (error) {
        console.error("Error loading user data:", error);
        showError("Failed to load user data");
    }
}

async function loadDashboard() {
    try {
        const standings = await backend.getLeagueStandings(currentLeague);
        const matchup = await backend.getCurrentMatchup();
        
        if (standings) {
            renderStandings(standings);
        }
        if (matchup) {
            renderMatchup(matchup);
        }
    } catch (error) {
        console.error("Error loading dashboard:", error);
        showError("Failed to load dashboard data");
    }
}

async function loadLeagues() {
    try {
        const leagues = await backend.getUserLeagues();
        renderLeagues(leagues);
    } catch (error) {
        console.error("Error loading leagues:", error);
        showError("Failed to load leagues");
    }
}

async function loadTeam() {
    try {
        const team = await backend.getTeam();
        renderTeam(team);
    } catch (error) {
        console.error("Error loading team:", error);
        showError("Failed to load team data");
    }
}

async function loadPlayers() {
    try {
        availablePlayers = await backend.getAvailablePlayers();
        renderPlayers();
    } catch (error) {
        console.error("Error loading players:", error);
        showError("Failed to load players");
    }
}

// DOM Helper Functions
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Element with id '${id}' not found`);
    }
    return element;
}

function safelyToggleClass(elementId, className, action) {
    try {
        const element = getElement(elementId);
        if (action === 'add') {
            element.classList.add(className);
        } else if (action === 'remove') {
            element.classList.remove(className);
        }
    } catch (error) {
        console.error(`Failed to toggle class '${className}' on element '${elementId}'`, error);
    }
}

// Rest of the code (Auth initialization, handlers, etc.) remains the same...

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initAuth().catch(error => {
        console.error("Failed to initialize application:", error);
        showError("Failed to initialize application. Please refresh the page.");
    });
});
