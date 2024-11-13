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

// Initialize Authentication
async function initAuth() {
    try {
        authClient = await AuthClient.create({
            idleOptions: {
                disableDefaultIdleCallback: true,
                disableIdle: true
            }
        });

        if (await authClient.isAuthenticated()) {
            identity = await authClient.getIdentity();
            handleAuthenticated();
        }
        setupAuthListeners();
    } catch (error) {
        console.error("Auth initialization error:", error);
        showError("Failed to initialize authentication");
    }
}

function setupAuthListeners() {
    document.getElementById('loginButton').onclick = async () => {
        try {
            const days = BigInt(1);
            const hours = BigInt(24);
            const nanoseconds = BigInt(3600000000000);
            
            await authClient.login({
                identityProvider: process.env.DFX_NETWORK === "ic" 
                    ? "https://identity.ic0.app"
                    : `http://localhost:4943/?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY}`,
                maxTimeToLive: days * hours * nanoseconds,
                onSuccess: async () => {
                    identity = await authClient.getIdentity();
                    handleAuthenticated();
                },
                onError: (error) => {
                    console.error("Login error:", error);
                    showError("Failed to login. Please try again.");
                }
            });
        } catch (error) {
            console.error("Login error:", error);
            showError("Failed to login. Please try again.");
        }
    };

    document.getElementById('logoutButton').onclick = async () => {
        try {
            await authClient.logout();
            identity = null;
            handleUnauthenticated();
        } catch (error) {
            console.error("Logout error:", error);
            showError("Failed to logout. Please try again.");
        }
    };
}

function handleAuthenticated() {
    try {
        document.getElementById('loginMessage').classList.add('d-none');
        document.getElementById('mainContent').classList.remove('d-none');
        document.getElementById('loginButton').classList.add('d-none');
        document.getElementById('logoutButton').classList.remove('d-none');
        
        // Update the agent's identity
        const agent = new HttpAgent({ identity });
        if (process.env.DFX_NETWORK !== "ic") {
            agent.fetchRootKey().catch(err => {
                console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
                console.error(err);
            });
        }

        loadUserData();
    } catch (error) {
        console.error("Error handling authentication:", error);
        showError("Failed to initialize user session");
    }
}

function handleUnauthenticated() {
    document.getElementById('loginMessage').classList.remove('d-none');
    document.getElementById('mainContent').classList.add('d-none');
    document.getElementById('loginButton').classList.remove('d-none');
    document.getElementById('logoutButton').classList.add('d-none');
    
    // Clear user data
    currentLeague = null;
    myTeams = [];
    availablePlayers = [];
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger alert-dismissible fade show';
    errorDiv.role = 'alert';
    errorDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.querySelector('.container').insertBefore(errorDiv, document.querySelector('.container').firstChild);
}

// Rest of the code remains the same...
// (Data conversion utilities, rendering functions, etc.)

// Initialize the application
window.addEventListener('load', () => {
    initAuth().catch(error => {
        console.error("Failed to initialize application:", error);
        showError("Failed to initialize application. Please refresh the page.");
    });
});
