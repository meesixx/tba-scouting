
function onTeamTeamNumberEnter(event, inputElement){
	if(event.key === "Enter"){
		updateTeamNumberInputElement(inputElement);
	}
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

	getJsonData("team/frc" + teamNumber, authKey, function(jsonObject){
		console.log(jsonObject);
		if(jsonObject.Errors !== undefined){
			for(let error of jsonObject.Errors){
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
			for (let link of document.getElementsByClassName("current_team_website_link")) {
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

	getJsonData("team/frc" + teamNumber + "/matches/" + year, authKey, function(jsonObject){
	    console.log("logging json object. The year is: " + year);
		console.log(jsonObject);
		let robotRanking;
		if(year === 2018){
			robotRanking = new RobotRanking2018(teamNumber, jsonObject);
		} if(year === 2019){
            robotRanking = new RobotRanking2019(teamNumber, jsonObject);
		} else {
			robotRanking = new RobotRanking(teamNumber, jsonObject);
		}
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
				"Endgame None: " + robotRanking.getEndgameNoneString()
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
		let dataString = dataArray.join("<br/>");
		console.log("hi");
		setIDHTML("additional_team_data", dataString);
	}, function(){
		console.error("Was unable to get matches.");
	});

	getJsonData("team/frc" + teamNumber + "/events/" + getDesiredYear(), authKey, function(jsonObject){
		let eventsInfo = "(" + jsonObject.length + ") ";
		console.log(jsonObject);

		let eventsArray = jsonObject;
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
		setClassHTML("events_attended", eventsInfo);
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
	for (let link of document.getElementsByClassName("current_team_website_link")) {
		link.href = "";
		link.classList.add("disable");
	}
}
(function(){ // main function
	updateTeamNumberTitle();
	updateYear();

	setTagsTextToNull();
	setIDText("additional_team_data", null);
	updateTeamData()
})();