import fetch from 'node-fetch';

async function testAPI() {
  try {
    console.log('Testing API endpoints...\n');
    
    // Test wrestlers
    const wrestlersRes = await fetch('http://localhost:5000/api/wrestlers');
    const wrestlers = await wrestlersRes.json();
    console.log(`✓ Wrestlers: ${wrestlers.length} records`);
    if (wrestlers.length > 0) {
      console.log(`  Sample: ${wrestlers[0].name} (${wrestlers[0].show})`);
    }
    
    // Test shows
    const showsRes = await fetch('http://localhost:5000/api/shows');
    const shows = await showsRes.json();
    console.log(`✓ Shows: ${shows.length} records`);
    if (shows.length > 0) {
      console.log(`  Sample: ${shows[0].name}`);
    }
    
    // Test matches
    const matchesRes = await fetch('http://localhost:5000/api/matches');
    const matches = await matchesRes.json();
    console.log(`✓ Matches: ${matches.length} records`);
    if (matches.length > 0) {
      console.log(`  Sample: ${matches[0].participant1} vs ${matches[0].participant2}`);
    }
    
    // Test championships
    const champsRes = await fetch('http://localhost:5000/api/championships');
    const championships = await champsRes.json();
    console.log(`✓ Championships: ${championships.length} records`);
    if (championships.length > 0) {
      console.log(`  Sample: ${championships[0].name} (${championships[0].holder})`);
    }
    
    // Test events
    const eventsRes = await fetch('http://localhost:5000/api/events');
    const events = await eventsRes.json();
    console.log(`✓ Events: ${events.length} records`);
    
    // Test teams
    const teamsRes = await fetch('http://localhost:5000/api/teams');
    const teams = await teamsRes.json();
    console.log(`✓ Teams: ${teams.length} records`);
    
    // Test dashboard
    const dashboardRes = await fetch('http://localhost:5000/api/dashboard/stats');
    const dashboard = await dashboardRes.json();
    console.log(`✓ Dashboard: ${dashboard.totalWrestlers} total wrestlers`);
    
    console.log('\n✅ All API endpoints responding');
    
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
  }
}

testAPI();
