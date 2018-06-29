
function onInputKey(inputElement){
	if(event.key === "Enter"){
		let value = inputElement.value;
		let teamNumber;
		if(typeof value === 'string') {
			if (value.length === 0) {
				teamNumber = null;
			} else {
				teamNumber = +value;
			}
		} else {
			if(typeof value !== 'number') throw "Unexpected value: " + value;

			teamNumber = value;
		}
		if(getCurrentTeamNumber() === teamNumber){
			return;
		}
		setCurrentTeamNumber(teamNumber);
		setTagsTextToNull();
		updateTeamData();
	}
}

function updateTeamData(){
	let teamNumber = getCurrentTeamNumber(); // null or number
	if(teamNumber === null){
		console.log("tried updating team data with no team number.");
		setTagsTextToNull();
		return;
	}
	let authKey = getAuthKey();
	if(authKey === null){
		let result = prompt("Please enter auth key");
		if(result === null){
			alert("Please enter auth key next time. (Reload the page to reenter or press enter in team number input.)");
			return;
		}
		setAuthKey(result);
		authKey = getAuthKey();
	}
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

	getJsonData("team/frc" + teamNumber + "/matches/" + getDesiredYear(), authKey, function(jsonObject){
		let totalArray = [0, 0, 0];
		let qualArray = [0, 0, 0];
		let playoffArray = [0, 0, 0];
		let successAutoRuns = 0;
		let unknownAutoRuns = 0;
		console.log(jsonObject);
		for(let match of jsonObject){
			let isPlayoff = match.comp_level !== "qm";
			let subArray = (isPlayoff ? playoffArray : qualArray);
			// console.log(match.alliances.blue);
			let isOnBlue = match.alliances.blue.team_keys.includes("frc" + teamNumber);
			if((match.winning_alliance === "blue" && isOnBlue) || (match.winning_alliance === "red" && !isOnBlue)){
				// we won
				totalArray[0] += 1;
				subArray[0] += 1;
			} else if(match.winning_alliance === "red" || match.winning_alliance === "blue"){ // check to make sure winning_alliance is valid
				// we lost
				totalArray[1] += 1;
				subArray[1] += 1;
			} else {
				// possibly a tie
				if(match.score_breakdown === null){
					//tie
					totalArray[2] += 1;
					subArray[2] += 1;
				} else {
					console.log("winning_alliance is: '" + match.winning_alliance + "'. It is either a tie or we will use the score to figure out who won.");
					let bluePoints = match.score_breakdown.blue.total_points;
					let redPoints = match.score_breakdown.red.total_points;
					if (bluePoints === redPoints) {
						//tie
						totalArray[2] += 1;
						subArray[2] += 1;
					}
					if ((bluePoints > redPoints && isOnBlue) || (redPoints > bluePoints && !isOnBlue)) {
						// win
						totalArray[0] += 1;
						subArray[0] += 1;
					} else {
						// loss
						totalArray[1] += 1;
						subArray[1] += 1;
					}
				}
			}
			let robotAuto;
			if(match.score_breakdown === null){ // 2014 and before is always like this
				robotAuto = "Unknown";
			} else {
				if (isOnBlue) {
					robotAuto = match.score_breakdown.blue["autoRobot" + (1 + match.alliances.blue.team_keys.indexOf("frc" + teamNumber))];
				} else {
					robotAuto = match.score_breakdown.red["autoRobot" + (1 + match.alliances.red.team_keys.indexOf("frc" + teamNumber))];
				}
			}
			if(robotAuto === "Unknown"){
				unknownAutoRuns++;
			} else if(robotAuto !== "None"){
				successAutoRuns++;
			}
		}
		setClassText("current_record_total", totalArray[0] + "-" + totalArray[1] + "-" + totalArray[2]);
		setClassText("current_record_qual", qualArray[0] + "-" + qualArray[1] + "-" + qualArray[2]);
		setClassText("current_record_playoff", playoffArray[0] + "-" + playoffArray[1] + "-" + playoffArray[2]);
		let unknownAutoRunsString = "";
		if(unknownAutoRuns !== 0){
			unknownAutoRunsString = " successful | and " + unknownAutoRuns + " unknown";
		}
		setClassText("success_auto_runs", successAutoRuns + unknownAutoRunsString);
		setClassText("matches_played_number", jsonObject.length);
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
			let event = eventsArray[i];
			eventsInfo += event.name;
			if(i === (eventsArray.length - 2)){
				eventsInfo += ", and ";
			} else if(i !== (eventsArray.length - 1)){
				eventsInfo += ", ";
			}
		}
		setClassText("events_attended", eventsInfo);
	}, function(){
		console.error("Got error when getting events.");
	});
}
function disableWebsite(){
	for (let link of document.getElementsByClassName("current_team_website_link")) {
		link.href = "";
		link.classList.add("disable");
	}
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
	setClassText("events_attended", null);
}

(function(){ // main function
	let teamNumber = getQueryObject()["team"];
	if(teamNumber === undefined || teamNumber === "null"){
		setCurrentTeamNumber(null);
	} else {
		setCurrentTeamNumber(+teamNumber);
	}
	let desiredYear = getQueryObject()["year"]; // string, undefined, or "null"
	if(desiredYear === undefined || desiredYear === "null"){
		setDesiredYear(new Date().getFullYear());
	} else {
		setDesiredYear(+desiredYear);
	}
	setTagsTextToNull();
	updateTeamData()
})();