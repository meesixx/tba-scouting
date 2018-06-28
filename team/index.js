
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
		setCurrentTeamNumber(teamNumber);
		updateTeamData();
	}
}

function updateTeamData(){
	let teamNumber = getCurrentTeamNumber(); // null or number
	let authKey = getAuthKey();
	if(authKey === null){
		let result = prompt("Please enter auth key");
		if(result === null){
			alert("Please enter auth key next time. (Reload the page to reenter)");
			return;
		}
		setAuthKey(result);
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
			for (let link of document.getElementsByClassName("current_team_website_link")) {
				link.href = "";
				link.classList.add("disable");
			}
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
		console.log("Got error when updating team data.");
		setTagsTextToNull();
	});
}
function setTagsTextToNull(){
	setClassText("current_team_name", null);
	setClassText("current_team_website_link", "");
	setClassText("current_team_website_label", null);
	setClassText("current_team_location", null);
}

(function(){ // main function
	let teamNumber = getQueryObject()["team"];
	if(teamNumber === undefined || teamNumber === "null"){
		setCurrentTeamNumber(null);
	} else {
		setCurrentTeamNumber(+teamNumber);
	}
	setTagsTextToNull();
	updateTeamData()
})();