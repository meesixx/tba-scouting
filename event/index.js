let teams = null;
function sortTeams(){
	if(teams === null){
		return;
	}

	window.location.href = "../sort/" + getQueryString(Object.assign({}, getQueryObject(), {"teams": teams.join(",")}));
}
// (function(){
(function(){ // main function
	setIDText("event_name", null);
	setIDText("date", null);
	setIDText("location", null);
	setIDText("teams", null);

	const eventKey = getQueryObject()["event"];
	if(eventKey === undefined || eventKey === "null"){
		alert("No event key provided in url. Please find a team with the desired event, then click the link for the event.");
		return;
	}
	const authKey = requestAuthKey();

	getJsonData("event/" + eventKey, authKey, function(event){
		setIDText("event_name", event.name);
		setIDText("date", event.start_date);
		setIDText("location", event.location_name);

	}, function(){
		console.log("Couldn't get event data for: " + eventKey);
	});

	getJsonData("event/" + eventKey + "/teams/keys", authKey, function(teamKeys){
		teams = [];
		for(const teamKey of teamKeys){
			const teamNumber = +teamKey.slice(3, teamKey.length);
			teams.push(teamNumber);
		}
		setIDHTML("teams", teams.join("<br/>"));
	}, function(){
		console.log("Couldn't get event data for: " + eventKey);
	});
})();
// })();