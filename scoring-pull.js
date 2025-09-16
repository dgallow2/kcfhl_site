const apiUrl = 'https://api-web.nhle.com/v1/';

async function fetchPlayerData() {
  try {
    const response = await fetch(`${apiUrl}/player/`);
    const data = await response.json();
    const teams = data.teams;
    return teams; // Assuming the API response structure includes teams data
  } catch (error) {
    console.error('Error fetching player data:', error);
    return null;
  }
}

async function displayPlayerPointsInTable() {
  const tableBody = document.querySelector('#playerPointsTable tbody');

  // Fetch player data including names, teams, and IDs from the API
  const players = await fetchPlayerData();
  if (players === null) {
    console.error('Error fetching player data.');
    return;
  }

  for (const player of players) {
    // Assuming each player object contains properties like name, team, and id
    const playerName = player.name;
    const teamName = player.team.name;
    const playerId = player.id;

    // Fetch points data for the player using playerId (similar to previous example)
    const points = await fetchPlayerPoints(playerId);
    if (points !== null) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${playerName}</td>
        <td>${teamName}</td>
        <td>${points}</td>
      `;
      tableBody.appendChild(row);
    }
  }
}

async function fetchPlayerPoints(playerId) {
  // Implement fetching points data for a player using playerId (similar to previous example)
  // You'll need to modify this function to fetch points data from the NHL API
  // and parse the response accordingly
  return 0; // Placeholder, replace with actual implementation
}

displayPlayerPointsInTable();
