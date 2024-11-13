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

// Helper Functions
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
            points: bigIntToNumber(player.stats.points)
        } : null
    };
}

// Authentication
async function initAuth() {
    authClient = await AuthClient.create();
    if (await authClient.isAuthenticated()) {
        identity = await authClient.getIdentity();
        handleAuthenticated();
    }
    setupAuthListeners();
}

function setupAuthListeners() {
    document.getElementById('loginButton').onclick = async () => {
        await authClient.login({
            identityProvider: "https://identity.ic0.app",
            onSuccess: handleAuthenticated
        });
    };

    document.getElementById('logoutButton').onclick = async () => {
        await authClient.logout();
        handleUnauthenticated();
    };
}

function handleAuthenticated() {
    document.getElementById('loginMessage').classList.add('d-none');
    document.getElementById('mainContent').classList.remove('d-none');
    document.getElementById('loginButton').classList.add('d-none');
    document.getElementById('logoutButton').classList.remove('d-none');
    loadUserData();
}

function handleUnauthenticated() {
    document.getElementById('loginMessage').classList.remove('d-none');
    document.getElementById('mainContent').classList.add('d-none');
    document.getElementById('loginButton').classList.remove('d-none');
    document.getElementById('logoutButton').classList.add('d-none');
}

// Navigation
function setupNavigation() {
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToPage(e.target.dataset.page);
        });
    });
}

function navigateToPage(page) {
    document.querySelectorAll('.content-page').forEach(p => p.classList.add('d-none'));
    document.getElementById(page).classList.remove('d-none');
    currentPage = page;
    loadPageData(page);
}

// Data Loading
async function loadUserData() {
    try {
        const [leagues, teams] = await Promise.all([
            backend.getUserLeagues(),
            backend.getUserTeams()
        ]);
        myTeams = teams.map(convertTeam);
        renderLeagues(leagues);
        loadPageData(currentPage);
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

async function loadPageData(page) {
    switch (page) {
        case 'dashboard':
            await loadDashboard();
            break;
        case 'leagues':
            await loadLeagues();
            break;
        case 'team':
            await loadTeam();
            break;
        case 'players':
            await loadPlayers();
            break;
    }
}

// Dashboard
async function loadDashboard() {
    try {
        const [matchup, standings] = await Promise.all([
            backend.getCurrentMatchup(),
            backend.getLeagueStandings(currentLeague)
        ]);
        renderMatchup(matchup);
        renderStandings(standings);
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Leagues
async function loadLeagues() {
    try {
        const leagues = await backend.getUserLeagues();
        renderLeagues(leagues);
    } catch (error) {
        console.error('Error loading leagues:', error);
    }
}

// Team Management
async function loadTeam() {
    try {
        const team = await backend.getTeam();
        if (team) {
            renderTeam(team);
        }
    } catch (error) {
        console.error('Error loading team:', error);
    }
}

// Players
async function loadPlayers() {
    try {
        const players = await backend.getAvailablePlayers();
        availablePlayers = players.map(convertPlayer);
        renderPlayers();
    } catch (error) {
        console.error('Error loading players:', error);
    }
}

// Event Listeners
function setupEventListeners() {
    // Create League
    document.getElementById('createLeagueBtn').addEventListener('click', () => {
        const modal = new bootstrap.Modal(document.getElementById('createLeagueModal'));
        modal.show();
    });

    document.getElementById('createLeagueSubmit').addEventListener('click', async () => {
        const name = document.getElementById('leagueName').value;
        const teamCount = parseInt(document.getElementById('teamCount').value);
        const draftDate = new Date(document.getElementById('draftDate').value).getTime();

        try {
            await backend.createLeague({
                name,
                teamCount,
                draftDate: BigInt(draftDate)
            });
            loadLeagues();
            bootstrap.Modal.getInstance(document.getElementById('createLeagueModal')).hide();
        } catch (error) {
            console.error('Error creating league:', error);
            alert('Failed to create league. Please try again.');
        }
    });

    // Player Search
    document.getElementById('playerSearch').addEventListener('input', (e) => {
        filterPlayers(e.target.value);
    });

    // Position Filters
    document.querySelectorAll('[data-position]').forEach(button => {
        button.addEventListener('click', (e) => {
            filterPlayersByPosition(e.target.dataset.position);
        });
    });
}

// Initialize Application
async function init() {
    await initAuth();
    setupNavigation();
    setupEventListeners();
}

// Start the application
init();
