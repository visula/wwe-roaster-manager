// Add this to the end of your index.html file, just before </script>

// Initialize application when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎭 Initializing WWE Universe Manager...');
    
    setupNavigation();
    setupSortableHeaders();
    loadMatchConfig();
    populateMatchConfigUI();
    updateMatchCategorySelects();
    updateMatchTypeSelects();
    
    // Load all data
    loadShows();
    loadDashboard();
    loadRoster();
    loadMatches();
    loadChampionships();
    loadTransfers();
    loadTeams();
    loadEvents();
    
    console.log('✅ Application initialized');
});
