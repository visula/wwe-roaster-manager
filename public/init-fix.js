// EMERGENCY FIX - Add this script to your index.html before the closing </body> tag
// Or open browser console and paste this code

console.log('=== WWE Universe Manager - Debug Mode ===');

// Override console.error to show errors visibly
const originalError = console.error;
console.error = function(...args) {
    originalError.apply(console, args);
    alert('JavaScript Error: ' + args.join(' '));
};

// Test API connection immediately
async function testConnection() {
    console.log('Testing API connection...');
    try {
        const response = await fetch('http://localhost:5000/api/wrestlers');
        const data = await response.json();
        console.log('✓ API Connected:', data.length, 'wrestlers found');
        return true;
    } catch (error) {
        console.error('✗ API Connection Failed:', error);
        alert('Cannot connect to server at http://localhost:5000\n\nError: ' + error.message + '\n\nMake sure the server is running with: npm start');
        return false;
    }
}

// Force reload all data
async function forceReloadAllData() {
    console.log('Force reloading all data...');
    
    try {
        // Load Shows
        console.log('Loading shows...');
        const showsRes = await fetch('http://localhost:5000/api/shows');
        if (!showsRes.ok) throw new Error('Shows API returned ' + showsRes.status);
        const showsData = await showsRes.json();
        console.log('✓ Shows loaded:', showsData.length);
        if (typeof loadShows === 'function') await loadShows();
        
        // Load Roster
        console.log('Loading wrestlers...');
        const wrestlersRes = await fetch('http://localhost:5000/api/wrestlers');
        if (!wrestlersRes.ok) throw new Error('Wrestlers API returned ' + wrestlersRes.status);
        const wrestlersData = await wrestlersRes.json();
        console.log('✓ Wrestlers loaded:', wrestlersData.length);
        if (typeof loadRoster === 'function') await loadRoster();
        
        // Load Matches
        console.log('Loading matches...');
        const matchesRes = await fetch('http://localhost:5000/api/matches');
        if (!matchesRes.ok) throw new Error('Matches API returned ' + matchesRes.status);
        const matchesData = await matchesRes.json();
        console.log('✓ Matches loaded:', matchesData.length);
        if (typeof loadMatches === 'function') await loadMatches();
        
        // Load Championships
        console.log('Loading championships...');
        const champsRes = await fetch('http://localhost:5000/api/championships');
        if (!champsRes.ok) throw new Error('Championships API returned ' + champsRes.status);
        const champsData = await champsRes.json();
        console.log('✓ Championships loaded:', champsData.length);
        if (typeof loadChampionships === 'function') await loadChampionships();
        
        // Load Dashboard
        console.log('Loading dashboard...');
        if (typeof loadDashboard === 'function') await loadDashboard();
        
        console.log('=== ALL DATA LOADED SUCCESSFULLY ===');
        alert('Data loaded successfully!\n\nWrestlers: ' + wrestlersData.length + '\nShows: ' + showsData.length + '\nMatches: ' + matchesData.length + '\nChampionships: ' + champsData.length);
        
    } catch (error) {
        console.error('✗ Error loading data:', error);
        alert('Error loading data: ' + error.message + '\n\nCheck browser console (F12) for details');
    }
}

// Run tests
testConnection().then(connected => {
    if (connected) {
        setTimeout(() => {
            console.log('Connection successful. Attempting to reload data...');
            forceReloadAllData();
        }, 1000);
    }
});
