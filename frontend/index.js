import { backend } from "declarations/backend";

const SALARY_CAP = 50000;
let currentTeam = [];
let availablePlayers = [];

async function initializePlayers() {
    showLoading(true);
    try {
        // Fetch NFL players from a free API
        const response = await fetch('https://api.sportsdata.io/v3/nfl/scores/json/Players?key=YOUR_API_KEY');
        const players = await response.json();
        
        availablePlayers = players.map(player => ({
            id: player.PlayerID,
            name: player.Name,
            position: player.Position,
            team: player.Team,
            salary: Math.floor(Math.random() * 10000) + 3000, // Random salary for demo
            projectedPoints: parseFloat((Math.random() * 20).toFixed(1))
        }));

        renderPlayers();
    } catch (error) {
        console.error('Error fetching players:', error);
    }
    showLoading(false);
}

function renderPlayers() {
    const playersListElement = document.getElementById('playersList');
    playersListElement.innerHTML = '';

    availablePlayers.forEach(player => {
        if (!currentTeam.find(p => p.id === player.id)) {
            const playerCard = createPlayerCard(player);
            playersListElement.appendChild(playerCard);
        }
    });
}

function createPlayerCard(player) {
    const div = document.createElement('div');
    div.className = 'col-md-6 mb-3';
    div.innerHTML = `
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">${player.name}</h5>
                <p class="card-text">
                    ${player.position} - ${player.team}<br>
                    Salary: $${player.salary}<br>
                    Projected: ${player.projectedPoints} pts
                </p>
                <button class="btn btn-success btn-sm add-player" data-id="${player.id}">Add to Team</button>
            </div>
        </div>
    `;

    div.querySelector('.add-player').addEventListener('click', () => addToTeam(player));
    return div;
}

function addToTeam(player) {
    if (currentTeam.length >= 9) {
        alert('Team is full! (Max 9 players)');
        return;
    }

    const totalSalary = currentTeam.reduce((sum, p) => sum + p.salary, 0) + player.salary;
    if (totalSalary > SALARY_CAP) {
        alert('Exceeds salary cap!');
        return;
    }

    currentTeam.push(player);
    updateTeamDisplay();
    renderPlayers();
}

function updateTeamDisplay() {
    const teamElement = document.getElementById('myTeam');
    const salaryElement = document.getElementById('teamSalary');
    
    teamElement.innerHTML = '';
    currentTeam.forEach(player => {
        const div = document.createElement('div');
        div.className = 'mb-2 d-flex justify-content-between align-items-center';
        div.innerHTML = `
            <span>${player.name} (${player.position})</span>
            <button class="btn btn-danger btn-sm" data-id="${player.id}">Remove</button>
        `;
        div.querySelector('button').addEventListener('click', () => removeFromTeam(player.id));
        teamElement.appendChild(div);
    });

    const totalSalary = currentTeam.reduce((sum, p) => sum + p.salary, 0);
    salaryElement.innerHTML = `Total Salary: $${totalSalary} / $${SALARY_CAP}`;
}

function removeFromTeam(playerId) {
    currentTeam = currentTeam.filter(p => p.id !== playerId);
    updateTeamDisplay();
    renderPlayers();
}

function showLoading(show) {
    document.getElementById('loadingPlayers').classList.toggle('d-none', !show);
}

document.getElementById('playerSearch').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    availablePlayers.forEach(player => {
        const card = document.querySelector(`[data-id="${player.id}"]`)?.closest('.col-md-6');
        if (card) {
            const visible = player.name.toLowerCase().includes(searchTerm) || 
                           player.team.toLowerCase().includes(searchTerm) ||
                           player.position.toLowerCase().includes(searchTerm);
            card.style.display = visible ? 'block' : 'none';
        }
    });
});

document.getElementById('saveTeam').addEventListener('click', async () => {
    if (currentTeam.length < 9) {
        alert('Please select 9 players for your team!');
        return;
    }

    try {
        await backend.saveTeam(currentTeam.map(p => ({
            id: p.id,
            name: p.name,
            position: p.position,
            team: p.team,
            salary: p.salary,
            projectedPoints: p.projectedPoints
        })));
        alert('Team saved successfully!');
    } catch (error) {
        console.error('Error saving team:', error);
        alert('Failed to save team. Please try again.');
    }
});

// Initialize the app
initializePlayers();
