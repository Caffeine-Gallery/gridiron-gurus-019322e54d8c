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
    try {
        const loginButton = getElement('loginButton');
        const logoutButton = getElement('logoutButton');

        loginButton.onclick = async () => {
            try {
                const days = BigInt(1);
                const hours = BigInt(24);
                const nanoseconds = BigInt(3600000000000);
                
                await authClient.login({
                    identityProvider: "https://identity.ic0.app",
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

        logoutButton.onclick = async () => {
            try {
                await authClient.logout();
                identity = null;
                handleUnauthenticated();
            } catch (error) {
                console.error("Logout error:", error);
                showError("Failed to logout. Please try again.");
            }
        };
    } catch (error) {
        console.error("Failed to setup auth listeners:", error);
        showError("Failed to initialize authentication components");
    }
}

function handleAuthenticated() {
    try {
        safelyToggleClass('loginMessage', 'd-none', 'add');
        safelyToggleClass('mainContent', 'd-none', 'remove');
        safelyToggleClass('loginButton', 'd-none', 'add');
        safelyToggleClass('logoutButton', 'd-none', 'remove');
        
        // Update the agent's identity
        const agent = new HttpAgent({ identity });
        
        loadUserData();
    } catch (error) {
        console.error("Error handling authentication:", error);
        showError("Failed to initialize user session");
    }
}

function handleUnauthenticated() {
    try {
        safelyToggleClass('loginMessage', 'd-none', 'remove');
        safelyToggleClass('mainContent', 'd-none', 'add');
        safelyToggleClass('loginButton', 'd-none', 'remove');
        safelyToggleClass('logoutButton', 'd-none', 'add');
        
        // Clear user data
        currentLeague = null;
        myTeams = [];
        availablePlayers = [];
    } catch (error) {
        console.error("Error handling unauthentication:", error);
        showError("Failed to handle logout");
    }
}

function showError(message) {
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
        console.error("Failed to show error message:", error);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initAuth().catch(error => {
        console.error("Failed to initialize application:", error);
        showError("Failed to initialize application. Please refresh the page.");
    });
});

// Rest of the code remains the same...
// (Data conversion utilities, rendering functions, etc.)
