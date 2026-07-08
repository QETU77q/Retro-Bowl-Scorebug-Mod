window.addEventListener('load', () => {
    // 1. Create and inject our modern scorebug UI container
    const bugContainer = document.createElement('div');
    bugContainer.id = 'modern-scorebug';
    
    Object.assign(bugContainer.style, {
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: '99999',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        display: 'flex',
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

    // Our HTML structure with clear IDs so we can target and change the text live
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

    // Crop out the top of the native canvas game board so the old scoreboard is hidden
    const gameCanvas = document.querySelector('canvas');
    if (gameCanvas) {
        gameCanvas.style.clipPath = 'inset(45px 0px 0px 0px)';
        gameCanvas.style.marginTop = '-45px';
    }

    // 2. THE GAME LOOP: Run a function every 200 milliseconds to scrape live stats
    setInterval(() => {
        // Fetch the raw text-based data where Retro Bowl keeps live match variables
        let saveData = localStorage.getItem("RetroBowl.0.savedata.ini");
        
        if (saveData) {
            // Use regex patterns to scan the data array for active team strings and scores
            let awayTeam = saveData.match(/away_team_name="([^"]+)"/);
            let homeTeam = saveData.match(/home_team_name="([^"]+)"/);
            let awayScore = saveData.match(/away_score="([^"]+)"/);
            let homeScore = saveData.match(/home_score="([^"]+)"/);
            let currentQtr = saveData.match(/current_quarter="([^"]+)"/);
            let currentTime = saveData.match(/quarter_time_remaining="([^"]+)"/);

            // 3. UPDATE THE SCOREBUG: If data exists, push it live to our HTML fields
            if (awayTeam && document.getElementById('bug-away-team')) {
                document.getElementById('bug-away-team').innerText = awayTeam[1].substring(0,3).toUpperCase();
            }
            if (homeTeam && document.getElementById('bug-home-team')) {
                document.getElementById('bug-home-team').innerText = homeTeam[1].substring(0,3).toUpperCase();
            }
            if (awayScore && document.getElementById('bug-away-score')) {
                document.getElementById('bug-away-score').innerText = awayScore[1];
            }
            if (homeScore && document.getElementById('bug-home-score')) {
                document.getElementById('bug-home-score').innerText = homeScore[1];
            }
            
            // Format the Quarter display text nicely
            if (currentQtr && document.getElementById('bug-quarter')) {
                let qText = "1ST";
                if (currentQtr[1] === "2") qText = "2ND";
                if (currentQtr[1] === "3") qText = "3RD";
                if (currentQtr[1] === "4") qText = "4TH";
                if (parseInt(currentQtr[1]) > 4) qText = "OT";
                document.getElementById('bug-quarter').innerText = qText;
            }

            // Calculate and format the game clock from total remaining seconds
            if (currentTime && document.getElementById('bug-clock')) {
                let totalSeconds = parseInt(currentTime[1]);
                let mins = Math.floor(totalSeconds / 60);
                let secs = totalSeconds % 60;
                let formattedTime = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
                document.getElementById('bug-clock').innerText = formattedTime;
            }
        }
    }, 200); // Runs 5 times every single second to keep it perfectly synchronized
});
