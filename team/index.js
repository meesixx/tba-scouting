
function onTeamTeamNumberEnter(event, inputElement){
    if(event.key === "Enter"){
        updateTeamNumberInputElement(inputElement);
        updateTeamData()
    }
}
function onTeamClick(teamNumber){
    setCurrentTeamNumber(teamNumber);
    location.href = "../team/" + location.search;
}

function onMatchClick(matchKey) {
    setCurrentMatch(matchKey);
    location.href = "../match/" + location.search;
}
function getBasicMatchTDElements(match, robotRanking) {
    function getTeamsArray(keys) {
        const teams = [];
        for(const teamKey of keys){
            const number = getTeamNumberFromKey(teamKey);
            let teamString;
            if(number === robotRanking.teamNumber) {
                teamString = "<strong>" + number + "</strong>";
            } else {
                teamString = "" + number;
            }
            teams.push('<a onclick=onTeamClick(' + number + ')>' + teamString + '</a>');
        }
        return teams;
    }
    const keyTD = document.createElement("td");
    const colorTD = document.createElement("td");
    const allianceTD = document.createElement("td");
    const enemyTD = document.createElement("td");
    const key = match.key;
    keyTD.innerHTML = '<a onclick=onMatchClick("' + key + '")>' + key + "</a>";

    const redTeams = getTeamsArray(match.alliances.red.team_keys);
    const blueTeams = getTeamsArray(match.alliances.blue.team_keys);
    if (robotRanking.isRobotBlue(match)) {
        colorTD.innerHTML = "<a style='color: #0000ff'>Blue</a>";
        allianceTD.innerHTML = blueTeams.join(", ");
        enemyTD.innerHTML = redTeams.join(", ");
    } else {
        colorTD.innerHTML = "<a style='color: #ff5238'>Red</a>";
        allianceTD.innerHTML = redTeams.join(", ");
        enemyTD.innerHTML = blueTeams.join(", ");
    }
    return [keyTD, colorTD, allianceTD, enemyTD];
}

function updateTeamData(){
    const teamNumber = getCurrentTeamNumber(); // null or number
    if(teamNumber === null){
        console.log("tried updating team data with no team number.");
        setTagsTextToNull();
        return;
    }
    const authKey = requestAuthKey();
    const year = getDesiredYear();
    console.log("Updating data for : " + teamNumber);
    const codeGithub = "https://github.com/retrodaredevil/frc-code-database/tree/master/frc/" + teamNumber;
    for (const link of document.getElementsByClassName("database_github")) {
        link.classList.remove("disable");
        link.href = codeGithub;
    }

    getJsonData("team/frc" + teamNumber, authKey, function(jsonObject){
        console.log(jsonObject);
        if(jsonObject.Errors !== undefined){
            for(const error of jsonObject.Errors){
                console.error(error.team_id);
            }
            setTagsTextToNull();
            return;
        }
        setClassText("current_team_name", jsonObject.nickname);
        let website = jsonObject.website;
        if(website === null){
            disableWebsite();
            setClassText("current_team_website_label", "No website");
        } else {
            for (const link of document.getElementsByClassName("current_team_website_link")) {
                link.classList.remove("disable");
                link.href = website;
            }
            setClassText("current_team_website_label", website);
        }
        setClassText("current_team_location", jsonObject.city + ", " + jsonObject.state_prov + " (" + jsonObject.postal_code + "), " + jsonObject.country)
    }, function(){
        console.error("Got error when updating team data from team/frc");
        // setTagsTextToNull();
    });

    getTeamMatches(teamNumber, year, authKey, function(jsonObject){
        console.log("logging json object. The year is: " + year);
        console.log(jsonObject);
        const robotRanking = createRobotRanking(year, teamNumber, jsonObject);
        console.log(robotRanking);

        setClassText("current_record_total", robotRanking.getTotalRecordString());
        setClassText("current_record_qual", robotRanking.getQualRecordString());
        setClassText("current_record_playoff", robotRanking.getPlayoffRecordString());
        let unknownAutoRunsString = "";
        if(robotRanking.unknownAutoRunCount !== 0){
            unknownAutoRunsString = " successful | and " + robotRanking.unknownAutoRunCount + " unknown";
        }
        setClassText("success_auto_runs", robotRanking.successAutoRunCount + unknownAutoRunsString);
        setClassText("matches_played_number", robotRanking.totalMatches);
        setClassText("countable_matches_played_number", robotRanking.countableMatches);
        let dataArray = [];
        dataArray.push(
                "Data from: " + robotRanking.eventsAttendedKeys.length + " events. Keys: " + robotRanking.eventsAttendedKeys.join(", "),
                "",
                "Win Rate: " + prettyPercent(robotRanking.getWinPercentage()),
                "Qual Win Rate: " + prettyPercent(robotRanking.getQualWinPercentage()),
                "Playoff Win Rate: " + prettyPercent(robotRanking.getPlayoffWinPercentage()),
                "",
                "(Custom) Ranking Value: " + robotRanking.rank()[0],
        );
        if(robotRanking instanceof RobotRanking2018){
            dataArray.push(
                    "",
                    "Switch Auto: " + (robotRanking.hasSwitchAuto() ? "YES" : "NO"),
                    "Scale Auto: " + (robotRanking.hasScaleAuto() ? "YES" : "NO"),
                    "Average Teleop Scale Ownership: " + prettyPercent(robotRanking.getTeleopScaleOwnershipTimePercent()),
                    "Average Teleop Switch Ownership: " + prettyPercent(robotRanking.getTeleopSwitchOwnershipTimePercent()),
                    "Average Cubes in Vault: " + prettyDecimal(robotRanking.getAverageCubesInVault()),
                    "",
                    "Climb Rate: " + prettyPercent(robotRanking.getClimbPercent()),
                    "Total Climbs: " + robotRanking.endgameClimbTotal,
                    "Can Climb: " + (robotRanking.canClimb() ? "YES" : "NO"),
                    "Extra Robots When Climbing: " + robotRanking.extraSupportedRobotsWhileClimbing(),
                    "",
                    "Auto Switch Success Rate: " + prettyPercent(robotRanking.getAutoSwitchSuccessPercent()),
                    "Auto Scale Success Rate: " + prettyPercent(robotRanking.getAutoScaleSuccessPercent()),
                    "Number Double Climbs: " + robotRanking.numberDoubleClimbs,
                    "Number Triple Climbs: " + robotRanking.numberTripleClimbs
            );

        } else if(robotRanking instanceof RobotRanking2019){
            dataArray.push(
                    "",
                    "Matches Dead: " + robotRanking.getMatchesDeadString(),
                    "Cross in Sandstorm: " + robotRanking.getMatchesCrossSandstormString(),
                    "Cross in Teleop: " + robotRanking.getMatchesCrossTeleopString(),
                    "",
                    "Start and Cross Level 2: " + robotRanking.startLevel2AndCross,
                    "Start Level 1 or Never Cross: " + robotRanking.startOther,
                    "",
                    "Endgame Level 1: " + robotRanking.getEndgameLevel1String(),
                    "Endgame Level 2: " + robotRanking.getEndgameLevel2String(),
                    "Endgame Level 3: " + robotRanking.getEndgameLevel3String(),
                    "Endgame None: " + robotRanking.getEndgameNoneString(),
                    "",
                    "Alliance Cargo Ship Hatches Placed: " + robotRanking.getAllianceCargoShipHatchesPlacedString(),
                    "Alliance Cargo Ship Cargo Placed: " + robotRanking.getAllianceCargoShipCargoPlacedString(),
                    "",
                    "",
                    "Alliance Rocket 1 Hatches Placed: " + robotRanking.getAllianceLevel1RocketHatchesString(),
                    "Alliance Rocket 1 Cargo Placed: " + robotRanking.getAllianceLevel1RocketCargoString(),
                    "",
                    "Alliance Rocket 2 Hatches Placed: " + robotRanking.getAllianceLevel2RocketHatchesString(),
                    "Alliance Rocket 2 Cargo Placed: " + robotRanking.getAllianceLevel2RocketCargoString(),
                    "",
                    "Alliance Rocket 3 Hatches Placed: " + robotRanking.getAllianceLevel3RocketHatchesString(),
                    "Alliance Rocket 3 Cargo Placed: " + robotRanking.getAllianceLevel3RocketCargoString(),
                    "",
            );
        } else if(robotRanking instanceof RobotRanking2020){
            dataArray.push(
                    "",
                    "Init Exit: " + robotRanking.getInitLineExitString(),
                    "Init None: " + robotRanking.getInitLineNoneString(),
                    "",
                    "Auto Bottom: " + robotRanking.autoBottomTotal + " (" + prettyDecimal(robotRanking.autoBottomTotal / robotRanking.countableMatches) + " average)",
                    "Auto Outer: " + robotRanking.autoOuterTotal + " (" + prettyDecimal(robotRanking.autoOuterTotal / robotRanking.countableMatches) + " average)",
                    "Auto Inner: " + robotRanking.autoInnerTotal + " (" + prettyDecimal(robotRanking.autoInnerTotal / robotRanking.countableMatches) + " average)",
                    "",
                    "Teleop Bottom: " + robotRanking.teleopBottomTotal + " (" + prettyDecimal(robotRanking.teleopBottomTotal / robotRanking.countableMatches) + " average)",
                    "Teleop Outer: " + robotRanking.teleopOuterTotal + " (" + prettyDecimal(robotRanking.teleopOuterTotal / robotRanking.countableMatches) + " average)",
                    "Teleop Inner: " + robotRanking.teleopInnerTotal + " (" + prettyDecimal(robotRanking.teleopInnerTotal / robotRanking.countableMatches) + " average)",
                    "",
                    "Endgame Hang: " + robotRanking.getEndgameHangString(),
                    "Endgame Park: " + robotRanking.getEndgameParkString(),
                    "Endgame None: " + robotRanking.getEndgameNoneString(),
            );
        }
        dataArray.push(
                "",
                "Ranking Points: " + robotRanking.rankingPointsTotal,
                "",
                "",
                "Auto Points Average: " + prettyDecimal(robotRanking.autoPointsTotal / robotRanking.countableMatches),
                "Teleop Points Average: " + prettyDecimal(robotRanking.telopPointsTotal / robotRanking.countableMatches),
                "Foul Points Average: " + prettyDecimal(robotRanking.foulPointsReceivedTotal / robotRanking.countableMatches),
                "Total Points Average: " + prettyDecimal(robotRanking.totalPointsTotal / robotRanking.countableMatches)
        );
        const dataString = dataArray.join("<br/>");
        setIdHtml("additional_team_data", dataString);
        const playedMatches = [].concat(robotRanking.playedMatches);
        playedMatches.sort(function(a, b) { return b.predicted_time - a.predicted_time});
        const unplayedMatches = [].concat(robotRanking.unplayedMatches);
        unplayedMatches.sort(function(a, b) { return b.predicted_time - a.predicted_time});
        // const playedMatchDisplays = [];
        const latestMatchesTable = document.getElementById("latest_matches");

        for(const match of playedMatches){
            // noinspection DuplicatedCode
            const row = document.createElement("tr");
            const basicTDElements = getBasicMatchTDElements(match, robotRanking);
            const keyTD = basicTDElements[0];
            const colorTD = basicTDElements[1];
            const allianceTD = basicTDElements[2];
            const enemyTD = basicTDElements[3];
            const resultTD = document.createElement("td");
            const scoreTD = document.createElement("td");
            const allianceFoulTD = document.createElement("td");
            const allianceTechFoulTD = document.createElement("td");
            const enemyFoulTD = document.createElement("td");
            const enemyTechFoulTD = document.createElement("td");
            const extraTD = document.createElement("td");

            const onBlue = robotRanking.isRobotBlue(match);
            let outcomeString;
            const winningAlliance = match.winning_alliance;
            if((winningAlliance === "blue" && onBlue) || (winningAlliance === "red" && !onBlue)){
                outcomeString = "Win";
            } else if(winningAlliance === "") {
                outcomeString = "Tie";
            } else {
                outcomeString = "Loss";
            }
            resultTD.innerText = outcomeString;
            if(match.score_breakdown !== null){
                const breakdown = onBlue ? match.score_breakdown.blue : match.score_breakdown.red;
                const enemyBreakdown = onBlue ? match.score_breakdown.red : match.score_breakdown.blue;
                const foulCount = breakdown.foulCount;
                const techFoulCount = breakdown.techFoulCount;
                const enemyFoulCount = enemyBreakdown.foulCount;
                const enemyTechFoulCount = enemyBreakdown.techFoulCount;
                scoreTD.innerText = (breakdown.total_points || breakdown.totalPoints) + "-" + (enemyBreakdown.total_points || enemyBreakdown.totalPoints);
                allianceFoulTD.innerText = foulCount === 0 ? "" : "" + foulCount;
                allianceTechFoulTD.innerText = techFoulCount === 0 ? "" : "" + techFoulCount;
                enemyFoulTD.innerText = enemyFoulCount === 0 ? "" : "" + enemyFoulCount;
                enemyTechFoulTD.innerText = enemyTechFoulCount === 0 ? "" : "" + enemyTechFoulCount;
            }
            extraTD.innerText = robotRanking.getExtraMatchInfo(match);

            row.appendChild(keyTD);
            row.appendChild(colorTD);
            row.appendChild(allianceTD);
            row.appendChild(enemyTD);
            row.appendChild(resultTD);
            row.appendChild(scoreTD);
            row.appendChild(allianceFoulTD);
            row.appendChild(allianceTechFoulTD);
            row.appendChild(enemyFoulTD);
            row.appendChild(enemyTechFoulTD);
            row.appendChild(extraTD);
            latestMatchesTable.appendChild(row);
        }
        const upcomingMatchesTable = document.getElementById("upcoming_matches");
        for(const match of unplayedMatches){
            const row = document.createElement("tr");
            const basicTDElements = getBasicMatchTDElements(match, robotRanking);
            const keyTD = basicTDElements[0];
            const colorTD = basicTDElements[1];
            const allianceTD = basicTDElements[2];
            const enemyTD = basicTDElements[3];
            row.appendChild(keyTD);
            row.appendChild(colorTD);
            row.appendChild(allianceTD);
            row.appendChild(enemyTD);
            upcomingMatchesTable.appendChild(row);
        }
    }, function(){
        console.error("Was unable to get matches.");
    });

    getJsonData("team/frc" + teamNumber + "/events/" + getDesiredYear(), authKey, function(jsonObject){
        let eventsInfo = "(" + jsonObject.length + ") ";
        console.log(jsonObject);

        const eventsArray = jsonObject;
        eventsArray.sort(function(event, event2){
            return +getEventDate(event) - +getEventDate(event2);
        });
        for(let i = 0; i < eventsArray.length; i++){
            const event = eventsArray[i];

            const queryObject = Object.assign({}, getQueryObject(), {"event": event.key});
            const link = "../event/" + getQueryString(queryObject);
            const aElement = "<a href=\"" + link + "\">" + event.key + "<a/>";
            eventsInfo += event.name + "(" + aElement + ")";
            if(i === (eventsArray.length - 2)){
                eventsInfo += ", and ";
            } else if(i !== (eventsArray.length - 1)){
                eventsInfo += ", ";
            }
        }
        setClassHtml("events_attended", eventsInfo);
    }, function(){
        console.error("Got error when getting events.");
    });
}

function setTagsTextToNull(){
    setClassText("current_team_name", null);
    disableWebsite();
    setClassText("current_team_website_label", null);
    setClassText("current_team_location", null);

    setClassText("current_record_total", null);
    setClassText("current_record_qual", null);
    setClassText("current_record_playoff", null);

    setClassText("success_auto_runs", null);
    setClassText("matches_played_number", null);
    setClassText("countable_matches_played_number", null);
    setClassText("events_attended", null);

}
function disableWebsite(){
    for (const link of document.getElementsByClassName("current_team_website_link")) {
        link.href = "";
        link.classList.add("disable");
    }
}
(function(){ // main function
    updateTeamNumberTitle();
    updateYear();

    setTagsTextToNull();
    setIdText("additional_team_data", null);
    updateTeamData()
})();
