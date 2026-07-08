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
        display: 'none', // Start hidden by default until a game begins!
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

    // 2. THE INTELLIGENT MONITOR LOOP
    setInterval(() => {
        let saveData = localStorage.getItem("RetroBowl.0.savedata.ini") || "";
        const gameCanvas = document.querySelector('canvas');
        
        // Scan for active game variables
        let awayTeam = saveData.match(/away_team_name="([^"]+)"/) || saveData.match(/team_away="([^"]+)"/);
        let homeTeam = saveData.match(/home_team_name="([^"]+)"/) || saveData.match(/team_home="([^"]+)"/);
        let awayScore = saveData.match(/away_score="([^"]+)"/) || saveData.match(/score_away="([^"]+)"/);
        let homeScore = saveData.match(/home_score="([^"]+)"/) || saveData.match(/score_home="([^"]+)"/);
        let currentQtr = saveData.match(/current_quarter="([^"]+)"/) || saveData.match(/quarter="([^"]+)"/);
        let currentTime = saveData.match(/quarter_time_remaining="([^"]+)"/) || saveData.match(/time_remaining="([^"]+)"/);

        // CHECK CONDITION: Are we actually playing a match right now?
        // If currentTime exists, a live match is running.
        if (currentTime && currentTime[1] !== undefined) {
            
            // A. Show our Custom Scorebug
            bugContainer.style.display = 'flex';

            // B. Crop out the native pixelated scoreboard
            if (gameCanvas) {
                gameCanvas.style.clipPath = 'inset(45px 0px 0px 0px)';
                gameCanvas.style.marginTop = '-45px';
            }

            // C. Push the Live Match Data into the Scorebug
            if (awayTeam) document.getElementById('bug-away-team').innerText = awayTeam[1].substring(0,3).toUpperCase();
            if (homeTeam) document.getElementById('bug-home-team').innerText = homeTeam[1].substring(0,3).toUpperCase();
            if (awayScore) document.getElementById('bug-away-score').innerText = awayScore[1];
            if (homeScore) document.getElementById('bug-home-score').innerText = homeScore[1];
            
            if (currentQtr) {
                let qText = "1ST";
                if (currentQtr[1] === "2") qText = "2ND";
                if (currentQtr[1] === "3") qText = "3RD";
                if (currentQtr[1] === "4") qText = "4TH";
                if (parseInt(currentQtr[1]) > 4) qText = "OT";
                document.getElementById('bug-quarter').innerText = qText;
            }

            let totalSeconds = parseInt(currentTime[1]);
            let mins = Math.floor(totalSeconds / 60);
            let secs = totalSeconds % 60;
            document.getElementById('bug-clock').innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

        } else {
            // BACK TO MENU CONDITION: No live match detected!
            
            // A. Instantly hide the modded scorebug completely
            bugContainer.style.display = 'none';

            // B. Instantly undo the crop so the main menus fit your screen perfectly again
            if (gameCanvas) {
                gameCanvas.style.clipPath = 'none';
                gameCanvas.style.marginTop = '0px';
            }
        }
    }, 200); 
});
