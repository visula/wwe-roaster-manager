async function createRivalryFromMatch(matchId) {
    const match = allMatches.find(m => m.id === matchId);
    if (!match) return;
    
    const participants = [match.participant1, match.participant2, match.participant3, match.participant4, match.participant5, match.participant6, match.participant7, match.participant8].filter(Boolean);
    
    if (participants.length < 2) {
        alert('Match must have at least 2 participants to create a rivalry');
        return;
    }
    
    const html = `
        <div id="rivalryFromMatchModal" class="modal active">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Create Rivalry from Match</h2>
                    <button class="close-btn" onclick="document.getElementById('rivalryFromMatchModal').remove()">&times;</button>
                </div>
                <form onsubmit="saveRivalryFromMatch(event, ${matchId})">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Wrestler in Match *</label>
                            <select id="rivalryMatchWrestler" required>
                                <option value="">Select Wrestler</option>
                                ${participants.map(p => `<option value="${p}">${p}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Rival (Any Wrestler) *</label>
                            <select id="rivalryOpponent" required>
                                <option value="">Select Wrestler</option>
                                ${wrestlers.map(w => `<option value="${w.name}">${w.name} (${w.show})</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Show *</label>
                        <select id="rivalryMatchShow" required>
                            <option value="">Select Show</option>
                            ${shows.map(s => `<option value="${s.name}">${s.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Status *</label>
                        <select id="rivalryMatchStatus" required>
                            <option value="Active">Active</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Start Date *</label>
                            <input type="date" id="rivalryMatchStartDate" required value="${match.date.split('T')[0]}">
                        </div>
                        <div class="form-group">
                            <label>End Date</label>
                            <input type="date" id="rivalryMatchEndDate">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="rivalryMatchDescription" rows="3" placeholder="Describe the rivalry...">${match.notes || ''}</textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="document.getElementById('rivalryFromMatchModal').remove()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Create Rivalry</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
}

async function saveRivalryFromMatch(e, matchId) {
    e.preventDefault();
    
    const wrestler1 = document.getElementById('rivalryMatchWrestler').value;
    const wrestler2 = document.getElementById('rivalryOpponent').value;
    const show = document.getElementById('rivalryMatchShow').value;
    const status = document.getElementById('rivalryMatchStatus').value;
    const startDate = document.getElementById('rivalryMatchStartDate').value;
    const endDate = document.getElementById('rivalryMatchEndDate').value || null;
    const description = document.getElementById('rivalryMatchDescription').value;
    
    if (wrestler1 === wrestler2) {
        alert('Please select different wrestlers');
        return;
    }
    
    try {
        const res = await fetch(`${API}/rivalries`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ wrestler1, wrestler2, show, status, startDate, endDate, description })
        });
        
        if (res.ok) {
            document.getElementById('rivalryFromMatchModal').remove();
            await loadRivalriesForStorylines();
            alert('Rivalry created successfully!');
        } else {
            const err = await res.json();
            alert(err.error || 'Error creating rivalry');
        }
    } catch (err) {
        console.error('Error creating rivalry:', err);
        alert('Error creating rivalry');
    }
}
