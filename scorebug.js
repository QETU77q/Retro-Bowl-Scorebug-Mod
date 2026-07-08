<script>
window.addEventListener('load', () => {
    // 1. CREATE THE MODERN SCOREBUG LAYER
    const bugContainer = document.createElement('div');
    bugContainer.id = 'modern-scorebug';
    
    Object.assign(bugContainer.style, {
        position: 'absolute',
        top: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: '99999',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        display: 'none', // Starts hidden on menus, pops up instantly in-game
        alignItems: 'center',
        background: '#1a1a1a',
        color: '#ffffff',
        border: '2px solid #333',
        borderRadius: '6px',
        overflow: 'hidden',
        boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
        fontSize: '16px',
        fontWeight: 'bold',
        letterSpacing: '1px'
    });

    // Clean ESPN style layout
    bugContainer.innerHTML = `
        <div style="background: #e10600; padding: 8px 12px; color: #fff; font-style: italic; font-weight: 900; border-right: 2px solid #222;">ESPN</div>
        <div style="background: #111; padding: 8px 15px; min-width: 50px; text-align: center; border-right: 1px solid #333;" id="bug-away-team">AWY</div>
        <div style="background: #222; padding: 8px 15px; border-right: 2px solid #000;" id="bug-away-score">0</div>
        <div style="background: #111; padding: 8px 15px; min-width: 50px; text-align: center; border-right: 1px solid #333;" id="bug-home-team">HOM</div>
        <div style="background: #222; padding: 8px 15px; border-right: 2px solid #000;" id="bug-home-score">0</div>
        <div style="background: #1c1c1c; padding: 8px 15px; color: #fff; min-width: 50px; text-align: center;" id="bug-quarter">1ST</div>
        <div style="background: #ffffff; color: #000; padding: 8px 15px; min-width: 50px; text-align: center;" id="bug-clock">5:00</div>
    `;

    document.body.appendChild(bugContainer);

    // 2. THE HIGH-ACCURACY MEMORY LOOP
    setInterval(() => {
        // Scrapes the absolute raw browser save data where Retro Bowl keeps live numbers
        let saveData = localStorage.getItem("RetroBowl.0.savedata.ini") || "";
        const gameCanvas = document.querySelector('canvas');
        
        if (saveData) {
            // Broadened regex scan targets to match all types of open-source web builds
            let awayTeam = saveData.match(/away_team_name="([^"]+)"/) || saveData.match(/team_away="([^"]+)"/) || saveData.match(/t_away="([^"]+)"/);
            let homeTeam = saveData.match(/home_team_name="([^"]+)"/) || saveData.match(/team_home="([^"]+)"/) || saveData.match(/t_home="([^"]+)"/);
            let awayScore = saveData.match(/away_score="([^"]+)"/) || saveData.match(/score_away="([^"]+)"/) || saveData.match(/s_away="([^"]+)"/);
            let homeScore = saveData.match(/home_score="([^"]+)"/) || saveData.match(/score_home="([^"]+)"/) || saveData.match(/s_home="([^"]+)"/);
            let currentQtr = saveData.match(/current_quarter="([^"]+)"/) || saveData.match(/quarter="([^"]+)"/) || saveData.match(/qtr="([^"]+)"/);
            let currentTime = saveData.match(/quarter_time_remaining="([^"]+)"/) || saveData.match(/time_remaining="([^"]+)"/) || saveData.match(/time_left="([^"]+)"/);

            // DETECT GAMEPLAY STATE: If a timer exists, we are playing football
            if (currentTime && currentTime[1]) {
                
                // A. Force drop down the modded scorebug
                bugContainer.style.display = 'flex';

                // B. APPLY A DEEPER CROP: Slices off the top 75 pixels to completely hide the original scoreboard & timer
                if (gameCanvas) {
                    gameCanvas.style.clipPath = 'inset(75px 0px 0px 0px)';
                    gameCanvas.style.marginTop = '-75px';
                }

                // C. LINK DATA: Update team abbreviations and scores in real-time
                if (awayTeam) document.getElementById('bug-away-team').innerText = awayTeam[1].substring(0,3).toUpperCase();
                if (homeTeam) document.getElementById('bug-home-team').innerText = homeTeam[1].substring(0,3).toUpperCase();
                if (awayScore) document.getElementById('bug-away-score').innerText = awayScore[1];
                if (homeScore) document.getElementById('bug-home-score').innerText = homeScore[1];
                
                // D. FORMAT QUARTER TEXT
                if (currentQtr) {
                    let qVal = currentQtr[1];
                    let qText = "1ST";
                    if (qVal === "2") qText = "2ND";
                    if (qVal === "3") qText = "3RD";
                    if (qVal === "4") qText = "4TH";
                    if (parseInt(qVal) > 4) qText = "OT";
                    document.getElementById('bug-quarter').innerText = qText;
                }

                // E. FORMAT THE TIMER CLOCK
                let totalSeconds = parseInt(currentTime[1]);
                if (!isNaN(totalSeconds)) {
                    let mins = Math.floor(totalSeconds / 60);
                    let secs = totalSeconds % 60;
                    document.getElementById('bug-clock').innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
                }

            } else {
                // MENU STATE: Turn off crop and hide mod bug so menus look 100% normal
                bugContainer.style.display = 'none';
                if (gameCanvas) {
                    gameCanvas.style.clipPath = 'none';
                    gameCanvas.style.marginTop = '0px';
                }
            }
        }
    }, 200); // Scans 5 times a second to keep everything perfectly synchronized
});
</script>
