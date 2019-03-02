let teams = null;
function sortTeams(){
	if(teams === null){
		return;
	}

	window.location.href = "../sort/" + getQueryString(Object.assign({}, getQueryObject(), {"teams": teams.join(",")}));
}
function onMatchCodeEnter(event, inputElement){
	if(event.key === "Enter"){
		const stringValue = inputElement.value;
		setQueryKey("match", stringValue);
		requestMatchTeams();
	}
}
function requestMatchTeams(){
	const authKey = requestAuthKey();
	const matchKey = getQueryObject()["match"];
	if(matchKey === undefined){
		alert("Please enter an event code or find an event");
	}
	getJsonData("match/" + matchKey, authKey, function(match){
		if(match === null || match === undefined){
			throw "match is null or undefined";
		}
		setIDText("match_key", match.key);
		setIDText("event_key", match.event_key);
		let level;
		switch(match.comp_level){
			case "qm":
				level = "Qualification";
				break;
			case "ef":
				level = "Eighth Final";
				break;
			case "qf":
				level = "Quarter Final";
				break;
			case "sf":
				level = "Semi Final";
				break;
			case "f":
				level = "Final";
				break;
			default:
				level = "Unknown";
				break;
		}
		setIDText("match_name", level + " " + match.match_number);
		const scheduled = match.time;
		const actual = match.actual_time;
		const dateString = "Scheduled: " + (scheduled === null ? "unknown" : new Date(scheduled * 1000).toString())
			+ "\nActual: " + (actual === null ? "unknown" : new Date(actual * 1000).toString());
		setIDText("date", dateString);

		teams = [];
		let blueString = "";
		let redString = "";

		for(const teamKey of match.alliances.blue.team_keys){
		    const team = +teamKey.slice(3, teamKey.length);
			teams.push(team);
			blueString += "<a onclick='onTeamClick(" + team + ")'>" + team + "</a>,";
		}
		for(const teamKey of match.alliances.red.team_keys){
			const team = +teamKey.slice(3, teamKey.length);
			teams.push(team);
			redString += "<a onclick='onTeamClick(" + team + ")'>" + team + "</a>,";
		}
		setIDHTML("blue_alliance", blueString);
		setIDHTML("red_alliance", redString);

	}, function(){
		console.log("Couldn't get event data for: " + eventKey);
	});

}
function onTeamClick(teamNumber){
    setCurrentTeamNumber(teamNumber);
	location.href = "../team/" + location.search;
}

// (function(){
(function(){ // main function
    setIDText("match_key", null);
	setIDText("event_key", null);
	setIDText("match_name", null);
	setIDText("date", null);
	setIDText("red_alliance", null);
	setIDText("blue_alliance", null);

	const match = getQueryObject()["match"];
	if(match === null || match === undefined){
		console.log("no event in query object");
	} else {
		document.getElementById("match_code_input").value = match;
	}

	requestMatchTeams();
})();
// })();