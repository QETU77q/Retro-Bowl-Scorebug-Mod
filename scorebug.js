<script>
window.addEventListener('load', () => {
    // 1. CREATE THE NEW ADVANCED BROADCASTING SCOREBUG
    const customBug = document.createElement('div');
    customBug.id = 'custom-broadcasting-scorebug';
    
    Object.assign(customBug.style, {
        position: 'absolute',
        top: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: '999999', // Forces it above the cut canvas layer
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        display: 'none', // Dynamically toggles on during football gameplay
        alignItems: 'center',
        background: '#11151c',
        color: '#ffffff',
        border: '2px solid #2d3748',
        borderRadius: '4px',
        overflow: 'hidden',
        boxShadow: '0 6px 20px rgba(0,0,0,0.6)',
        fontSize: '15px',
        fontWeight: 'bold',
        letterSpacing: '0.5px'
    });

    // Custom Modular Layout: Team 3-Letters, Scores, Quarter, Clock, and the Down strip
    customBug.innerHTML = `
        <div style="background: #002244; padding: 10px 16px; min-width: 45px; text-align: center;" id="bug-away-team">AWY</div>
        <div style="background: #0d1117; padding: 10px 16px; font-size: 17px; border-right: 2px solid #2d3748; color: #fff;" id="bug-away-score">0</div>
        <div style="background: #004c54; padding: 10px 16px; min-width: 45px; text-align: center;" id="bug-home-team">HOM</div>
        <div style="background: #0d1117; padding: 10px 16px; font-size: 17px; border-right: 3px solid #ffcc00; color: #fff;" id="bug-home-score">0</div>
        <div style="background: #1a202c; padding: 10px 12px; color: #a0aec0;" id="bug-quarter">1ST</div>
        <div style="background: #1a202c; padding: 10px 16px; min-width: 50px; text-align: center; border-right: 2px solid #2d3748;" id="bug-clock">5:00</div>
        <div style="background: #ffcc00; color: #000; padding: 10px 14px; font-size: 13px; font-weight: 800; min-width: 65px; text-align: center;" id="bug-down-distance">1ST & 10</div>
    `;

    document.body.appendChild(customBug);

    // 2. THE HIGH-FREQUENCY DATA & SCREEN CROPPING LOOP
    setInterval(() => {
        let saveData = localStorage.getItem("RetroBowl.0.savedata.ini") || "";
        const gameCanvas = document.querySelector('canvas');
        
        if (saveData) {
            // Memory references targeting team metrics, timers, and active down sequences
            let awayTeam = saveData.match(/away_team_name="([^"]+)"/) || saveData.match(/team_away="([^"]+)"/) || saveData.match(/t_away="([^"]+)"/);
            let homeTeam = saveData.match(/home_team_name="([^"]+)"/) || saveData.match(/team_home="([^"]+)"/) || saveData.match(/t_home="([^"]+)"/);
            let awayScore = saveData.match(/away_score="([^"]+)"/) || saveData.match(/score_away="([^"]+)"/) || saveData.match(/s_away="([^"]+)"/);
            let homeScore = saveData.match(/home_score="([^"]+)"/) || saveData.match(/score_home="([^"]+)"/) || saveData.match(/s_home="([^"]+)"/);
            let currentQtr = saveData.match(/current_quarter="([^"]+)"/) || saveData.match(/quarter="([^"]+)"/) || saveData.match(/qtr="([^"]+)"/);
            let currentTime = saveData.match(/quarter_time_remaining="([^"]+)"/) || saveData.match(/time_remaining="([^"]+)"/) || saveData.match(/time_left="([^"]+)"/);
            
            // Down and Distance mapping targets
            let currentDown = saveData.match(/current_down="([^"]+)"/) || saveData.match(/down="([^"]+)"/);
            let distanceToGain = saveData.match(/distance_to_go="([^"]+)"/) || saveData.match(/distance="([^"]+)"/) || saveData.match(/ytg="([^"]+)"/);

            // ACTIVE MATCH RENDERING RULES
            if (currentTime && currentTime !== undefined) {
                
                // Pull out custom bug panel
                customBug.style.display = 'flex';

                // THE EXACT TOP BAR ONLY CLIP: Slices off exactly the scoreboard and shifts the frame up
                if (gameCanvas) {
                    gameCanvas.style.clipPath = 'inset(52px 0px 0px 0px)'; // 52px targets the exact default top bar zone
                    gameCanvas.style.marginTop = '-52px';
                }

                // STREAM LIVE GAME MEMORY VALUES INTO YOUR INTERFACE
                if (awayTeam) document.getElementById('bug-away-team').innerText = awayTeam[1].substring(0,3).toUpperCase();
                if (homeTeam) document.getElementById('bug-home-team').innerText = homeTeam[1].substring(0,3).toUpperCase();
                if (awayScore) document.getElementById('bug-away-score').innerText = awayScore[1];
                if (homeScore) document.getElementById('bug-home-score').innerText = homeScore[1];
                
                // Process and compile standard formatting values for the Quarter tracking element
                if (currentQtr) {
                    let qText = "1ST";
                    if (currentQtr[1] === "2") qText = "2ND";
                    if (currentQtr[1] === "3") qText = "3RD";
                    if (currentQtr[1] === "4") qText = "4TH";
                    if (parseInt(currentQtr[1]) > 4) qText = "OT";
                    document.getElementById('bug-quarter').innerText = qText;
                }

                // Process clock timestamps
                let totalSeconds = parseInt(currentTime[1]);
                if (!isNaN(totalSeconds)) {
                    let mins = Math.floor(totalSeconds / 60);
                    let secs = totalSeconds % 60;
                    document.getElementById('bug-clock').innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
                }

                // Process live downs and conversions 
                if (currentDown && distanceToGain) {
                    let dn = currentDown[1];
                    let dist = distanceToGain[1];
                    let dnText = "1ST";
                    if (dn === "2") dnText = "2ND";
                    if (dn === "3") dnText = "3RD";
                    if (dn === "4") dnText = "4TH";
                    
                    // Format output down strip content string
                    document.getElementById('bug-down-distance').innerText = `${dnText} & ${dist}`;
                }

            } else {
                // RESET TO FRONT OFFICE / MAIN SELECTION MENU VIEWS
                customBug.style.display = 'none';
                if (gameCanvas) {
                    gameCanvas.style.clipPath = 'none';
                    gameCanvas.style.marginTop = '0px';
                }
            }
        }
    }, 150); // Accelerated refresh pace to track rapid down adjustments and clock reductions
});
</script>
