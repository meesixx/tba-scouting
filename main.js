'use strict';
/*
 * This file contains helper functions that will be used throughout the website on other javascript files.
 */

const API_URL = "https://www.thebluealliance.com/api/v3";


function prettyPercent(percent){
	return "" + (Math.round(percent * 1000) / 10.0) + "%";
}
function prettyDecimal(decimal){
	return (Math.round(decimal * 10) / 10) + "";
}

function getJsonData(subUrl, authKey, successFunction, errorFunction=null){
	if(!subUrl){
		throw "subUrl cannot be blank and cannot be null. Value: '" + subUrl + "'";
	}
	if(!authKey){
		throw "Must provide auth key";
	}
	if(!successFunction){
		throw "Must provide success function";
	}

	if(subUrl[0] !== "/"){
		subUrl = "/" + subUrl;
	}
	if(subUrl[subUrl.length - 1] === "/"){
		subUrl = subUrl.slice(0, subUrl.length - 1);
	}
	let finalUrl = API_URL + subUrl;
	let request = new XMLHttpRequest();

	request.addEventListener("load", function(e){
		successFunction(JSON.parse(request.responseText));
	}, false);
	if(errorFunction) {
		request.addEventListener("error", function () {
			errorFunction();
		}, false);
	}
	request.open("GET", finalUrl, true);
	request.setRequestHeader("X-TBA-Auth-Key", authKey);
	request.send();
}

/**
 * Gets the data from everything after the "?" in the url
 * @returns {{}} A dictionary where each key is a string and each value is a string unless no value was provided then the value will be true (boolean)
 */
function getQueryObject(){
	let parameters = location.search;
	if(parameters.length <= 1){
		return {};
	}
	parameters = parameters.substring(1); // cut off ?
	let r = {};
	let arr = parameters.split("&");
	for(let i in arr){
		let keyValueString = arr[i];
		if(!keyValueString){
			continue;
		}
		let split = keyValueString.split("=");
		if(split.length === 0){
			continue;
		}
		let key = decodeURIComponent(split[0]);
		if(!key){ // if key is blank
			continue;
		}
		let currentKeyValue = r[key];
		if(currentKeyValue !== undefined){
			console.log("The query string already has key: '" + key + "' defined with value: '" + currentKeyValue + "'.");
		}
		if(split.length === 1){
			r[key] = true;
			continue;
		}
		let value = keyValueString.substring(key.length + 1); // get everything after first =
		value = decodeURIComponent(value);
		r[key] = value;
	}
	return r;
}
function getQueryString(object){
	let r = "";
	for(let key in object){
		let value = object[key];
		key = encodeURIComponent("" + key);
		value = encodeURIComponent(value);
		if(r){
			r += "&";
		} else {
			r += "?";
		}
		r += key + "=" + value;
	}
	return r;
}
function setQueryObject(object){
	window.history.replaceState(null, null, getQueryString(object));
}

/**
 *
 * @param key The key
 * @param value The value to set. If null, sets to "null" if undefined, removes key
 * @returns {boolean} false if the current value is equal to the new value or true if a new value was set.
 */
function setQueryKey(key, value){
	let object = getQueryObject();
	if(object[key] === "" + value){
		return false;
	}
	if(value === undefined){
		delete object[key];
	} else {
		object[key] = value;
	}
	setQueryObject(object);
	return true;
}
function setIDText(id, text){
	if(id === undefined || text === undefined) throw "You must pass both id, and text.";

	if(text === null){
		text = "?";
	}
	let element = document.getElementById(id);
	if(element === null){
		throw "Element with id: '" + id + "' not found.";
	}
	element.innerText = text;
}
function setIDHTML(id, html){
	if(id === undefined || html === undefined) throw "You must pass both id, and text.";

	if(html === null){
		html = "?";
	}
	let element = document.getElementById(id);
	if(element === null){
		throw "Element with id: '" + id + "' not found.";
	}
	element.innerHTML = html;
}
function setClassText(clazz, text){
	if(clazz === undefined || text === undefined) throw "You must pass both id, and text.";

	if(text === null) {
		text = "?";
	}
	let r = false;

	for(let element of document.getElementsByClassName(clazz)){
		r = true;
		element.innerText = text;
	}
	return r;
}
function setClassHTML(clazz, text){
	if(clazz === undefined || text === undefined) throw "You must pass both id, and text.";

	if(text === null) {
		text = "?";
	}
	let r = false;

	for(let element of document.getElementsByClassName(clazz)){
		r = true;
		element.innerHTML = text;
	}
	return r;
}
function setCurrentTeamNumber(number){ // number can be number or null
	if(number === undefined) throw "Must pass number argument (or null). Got undefined";
	if(typeof number !== 'number' && number !== null) throw "number must be a Number. got: '" + number + "' as : " + (typeof number);

	setQueryKey("team", number); // this will likely reload the page but the next time it's called it won't
	updateTeamNumber();
}

/**
 * @returns {?Number} The team number or null
 */
function getCurrentTeamNumber(){
	let currentTeamNumber = getQueryObject()["team"];
	if(currentTeamNumber === undefined || currentTeamNumber === "null"){
		return null;
	}
	return +currentTeamNumber;
}
function updateTeamNumber(){
	const number = getCurrentTeamNumber();
	const numberString = "" + number;

	document.title = "Scouting - " + numberString;

	setClassText("current_team_number", number === null ? null : "" + number);

	let inputElement = document.getElementById("team_number_input");
	if(inputElement !== null){
		if(number !== null){
			inputElement.value = numberString;
		} else {
			inputElement.value = "";
		}
	}
}
function getAuthKey(){
	let authKey = getQueryObject()["auth"];
	if(authKey === undefined || authKey === "null"){
		return null;
	}
	if(authKey === null || authKey.length === 0){
		console.error("Got unexpected auth key: '" + authKey + "'");
	}
	return authKey;
}

/**
 *
 * @returns {string} Gets the auth key from the query url or prompts the user for one if there isn't already one
 */
function requestAuthKey(){
	const authKey = getAuthKey();

	if(authKey === null){
		let result = prompt("Please enter auth key");
		if(result === null){
			alert("Please enter auth key next time. (Reload the page to reenter or press enter in team number input.)");
			return "";
		}
		setAuthKey(result);
		return getAuthKey();
	}
	return authKey;
}
function setAuthKey(authKey){
	setQueryKey("auth", authKey);
}

function getDesiredYear(){
	const year = getQueryObject()["year"];
	if(year === undefined || year === "null"){
		let r = new Date().getFullYear();
		setDesiredYear(r);
		return r;
	}

	return +year;
}
function setDesiredYear(year){
	if(year === null || year === undefined) throw "Year cannot be null or undefined";

	setQueryKey("year", year);
	updateYear();
}
function updateYear(){
	const year = getDesiredYear();
	for(let yearElement of document.getElementsByClassName("current_year")){
		yearElement.innerText = year;
	}
}

function getTeams(){
	const teamsString = getQueryObject()["teams"];
	if(teamsString === undefined){
		setQueryKey("teams", "");
		return [];
	}
	if(teamsString === "null" || teamsString === ""){
		return [];
	}
	const split = teamsString.split(",");
	const r = [];
	for(let s of split){
		if(s === ""){
			continue;
		}
		let value = +s;
		if(+s !== value){
			console.log("s must be NaN it's: '" + s + "' and value is: " + value);
			continue;
		}
		r.push(value);
	}
	return r;
}

function getEventDate(event){
	let dateString = event.start_date;
	let split = dateString.split("-");
	return new Date(+split[0], +split[1], +split[2]);
}


class RobotRanking extends Object{
	constructor(teamNumber, matches){
		super();
		this.teamNumber = teamNumber;
		this.teamKey = "frc" + teamNumber;

		this.eventsAttendedKeys = [];
		this.countableMatches = 0; // aka breakdownable matches. Should be used with more advanced stats

		this.totalMatches = matches.length; // should be used with wins losses, etc.
		this.qualMatches = 0;
		this.playoffMatches = 0;

		this.totalWins = 0;
		this.totalLosses = 0;
		this.totalTies = 0;

		this.qualWins = 0;
		this.qualLosses = 0;
		this.qualTies = 0;
		this.playoffWins = 0;
		this.playoffLosses = 0;
		this.playoffTies = 0;

		this.autoPointsTotal = 0;
		this.telopPointsTotal = 0;
		this.totalPointsTotal = 0;
		this.foulPointsReceivedTotal = 0;

		this.teamFoulCommittedTotal = 0;
		this.teamTechFoulCommittedTotal = 0;


		this.successAutoRunCount = 0;
		this.unknownAutoRunCount = 0; // Amount of auto runs we don't have data on. Usually == totalMatches - countableMatches but use this for more accuracy

		for(let match of matches){
			let matchEventKey = match.event_key;
			if(!this.eventsAttendedKeys.includes(matchEventKey)){
				this.eventsAttendedKeys.push(matchEventKey);
			}
			let isOnBlue = this.isRobotBlue(match);

			let teamBreakdown = null;
			if(match.score_breakdown !== null){
				this.countableMatches++;
				teamBreakdown = (isOnBlue ? match.score_breakdown.blue : match.score_breakdown.red);
			}
			let isPlayoff = match.comp_level !== "qm";
			if(isPlayoff){
				this.playoffMatches++;
			} else {
				this.qualMatches++;
			}

			// === Wins and Losses
			if((match.winning_alliance === "blue" && isOnBlue) || (match.winning_alliance === "red" && !isOnBlue)){
				// we won
				this.totalWins++;
				if(isPlayoff){
					this.playoffWins++;
				} else {
					this.qualWins++;
				}
			} else if(match.winning_alliance === "red" || match.winning_alliance === "blue"){ // check to make sure winning_alliance is valid
				// we lost
				this.totalLosses++;
				if(isPlayoff){
					this.playoffLosses++;
				} else{
					this.qualLosses++;
				}
			} else {
				// possibly a tie
				if(match.score_breakdown === null){
					//tie
					this.totalTies++;
					if(isPlayoff){
						this.playoffTies++;
					} else {
						this.qualTies++;
					}
				} else {
					let bluePoints = match.score_breakdown.blue.total_points;
					let redPoints = match.score_breakdown.red.total_points;
					if (bluePoints === redPoints) {
						//tie
						this.totalTies++;
						if(isPlayoff){
							this.playoffTies++;
						} else {
							this.qualTies++;
						}
					} else if ((bluePoints > redPoints && isOnBlue) || (redPoints > bluePoints && !isOnBlue)) {
						// win
						this.totalWins++;
						if(isPlayoff){
							this.playoffWins++;
						} else{
							this.qualWins++;
						}
					} else {
						// loss
						this.totalLosses++;
						if(isPlayoff){
							this.playoffLosses++;
						} else{
							this.qualLosses++;
						}
					}
				}
			}
			// === End Wins and Losses ===
			let robotAuto;
			if(teamBreakdown === null){ // 2014 and before is always like this
				robotAuto = "Unknown";
			} else {
				robotAuto = teamBreakdown["autoRobot" + this.getRobotNumber(match)];
			}
			if(robotAuto === "Unknown"){ // it's possible that EITHER the if OR the else sets it to this
				this.unknownAutoRunCount++;
			} else if(robotAuto !== "None"){
				this.successAutoRunCount++;
			}
			if(teamBreakdown !== null){
				this.autoPointsTotal += teamBreakdown.autoPoints;
				this.telopPointsTotal += teamBreakdown.teleopPoints;
				this.totalPointsTotal += teamBreakdown.totalPoints;
				this.foulPointsReceivedTotal += teamBreakdown.foulPoints;

				this.teamTechFoulCommittedTotal += teamBreakdown.techFoulCount;
				this.teamFoulCommittedTotal += teamBreakdown.foulCount;
			}
		}
	}

	/**
	 *
	 * @returns {*[]} Returns an array with a length of 3. [0] is to compare, [1] array of strings, [2] array of strings
	 *          where each array of strings are things the robot is good at [1] is cool and [2] is extra cool
	 */
	rank(){
		return [this.totalWins, [], []];
	}

	isRobotBlue(match){
		return match.alliances.blue.team_keys.includes(this.teamKey);
	}
	getRobotNumber(match){
		let isOnBlue = this.isRobotBlue(match);
		return 1 + (isOnBlue ? match.alliances.blue.team_keys : match.alliances.red.team_keys).indexOf(this.teamKey);
	}
	getTotalRecordString(){
		return this.totalWins + "-" + this.totalLosses + "-" + this.totalTies;
	}
	getPlayoffRecordString(){
		return this.playoffWins + "-" + this.playoffLosses + "-" + this.playoffTies;
	}
	getQualRecordString(){
		return this.qualWins + "-" + this.qualLosses + "-" + this.qualTies;
	}
	getWinPercentage(){
		return this.totalWins / this.totalMatches;
	}
	getQualWinPercentage(){
		return this.qualWins / this.qualMatches;
	}
	getPlayoffWinPercentage(){
		return this.playoffWins / this.playoffMatches;
	}

	getAutoSuccessPercent(){
		return this.successAutoRunCount / (this.totalMatches - this.unknownAutoRunCount);
	}

}
class RobotRanking2018 extends RobotRanking{
	constructor(teamNumber, matches){
		super(teamNumber, matches);
		/** The number of matches that affected these rankings (if a match had no score_breakdown, it wouldn't count as a "countable match" */
		this.rankingPointsTotal = 0;

		this.endgameNothingTotal = 0; // "None"
		this.endgameLevitateTotal = 0; // "Levitate"
		this.endgameParkingTotal = 0; // "Parking"
		this.endgameClimbTotal = 0; // "Climbing"

		this.numberDoubleClimbs = 0;
		this.numberTripleClimbs = 0;

		this.teamAutoSwitchOwnershipTotalSeconds = 0;
		this.timesTeamOwnSwitchAfterAuto = 0; // only incremented by 1 each time above is incremented
		this.teamAutoScaleOwnershipTotalSeconds = 0;
		this.timesTeamOwnScaleAfterAuto = 0;

		this.teamTeleopSwitchOwnershipTotalSeconds = 0;
		this.teamTeleopScaleOwnershipTotalSeconds = 0;

		this.timesBoostPlayed = 0; // number of times boost was played
		// this.powerupBoostPowerCubeTotal = 0; // total amount of power cubes that were played for boost powerup
		this.timesForcePlayed = 0;
		// this.powerupForcePowerCubeTotal = 0;
		this.timesLevitatePlayed = 0;

		this.totalCubesAtMatchEndTotal = 0; // total number of cubes in the vault

		for(let match of matches){
			if(match.score_breakdown === null){
				continue;
			}
			let isOnBlue = this.isRobotBlue(match);
			let teamBreakdown = (isOnBlue ? match.score_breakdown.blue : match.score_breakdown.red);

			this.rankingPointsTotal += teamBreakdown.rp;
			let endgame = teamBreakdown["endgameRobot" + this.getRobotNumber(match)];
			switch(endgame){
				case "Climbing":
					this.endgameClimbTotal++;
					break;
				case "Parking":
					this.endgameParkingTotal++;
					break;
				case "Levitate":
					this.endgameLevitateTotal++;
					break;
				case "None":
					this.endgameNothingTotal++;
					break;
				case "Unknown":
					console.log("Got Unknown at endgame. Match below");
					console.log(match);
					this.endgameNothingTotal++;
					break;
				default:
					console.log("got: '" + endgame + "' as endgame.");
					this.endgameNothingTotal++;
					break;
			}
			let teamNumberClimbs = 0;
			if(endgame === "Climbing") { // make sure we actually climbed before seeing if we participated in a double or triple
				for (let i = 0; i < 3; i++) {
					let teamEndgame = teamBreakdown["endgameRobot" + (1 + i)];
					if (teamEndgame === "Climbing") {
						teamNumberClimbs++;
					}
				}
				if(teamNumberClimbs === 2){
					this.numberDoubleClimbs++;
				} else if(teamNumberClimbs === 3){
					this.numberTripleClimbs++;
				}
			}
			let autoSwitchSeconds = teamBreakdown.autoSwitchOwnershipSec;
			this.teamAutoSwitchOwnershipTotalSeconds += autoSwitchSeconds;
			if(autoSwitchSeconds > 0 || teamBreakdown.autoSwitchAtZero) this.timesTeamOwnSwitchAfterAuto++;

			let autoScaleSeconds = teamBreakdown.autoScaleOwnershipSec;
			this.teamAutoScaleOwnershipTotalSeconds += autoScaleSeconds;
			if(autoScaleSeconds > 0) this.timesTeamOwnScaleAfterAuto++;

			this.teamTeleopSwitchOwnershipTotalSeconds += teamBreakdown.teleopSwitchOwnershipSec;
			this.teamTeleopScaleOwnershipTotalSeconds += teamBreakdown.teleopScaleOwnershipSec;

			if(teamBreakdown.vaultBoostPlayed > 0) this.timesBoostPlayed++;
			if(teamBreakdown.vaultForcePlayed > 0) this.timesForcePlayed++;
			if(teamBreakdown.vaultLevitatePlayed === 3) this.timesLevitatePlayed++;
			this.totalCubesAtMatchEndTotal += teamBreakdown.vaultBoostTotal + teamBreakdown.vaultForceTotal + teamBreakdown.vaultLevitateTotal;

		}
	}
	valueOf(){
		return this.rank()[0];
	}
	rank(){
		const cool = [];
		const special = [];

		let r = 0;
		if(this.canClimb()){
			cool.push("can climb");
			r += 16;
			const extra = this.extraSupportedRobotsWhileClimbing();
			r += extra * 5;
			if(extra === 1){
				special.push("double climb");
			} else if(extra === 2){
				special.push("triple climb");
			}
		}
		if(this.hasSwitchAuto()){
			r += 10;
			cool.push("switch auto");
		}
		if(this.hasScaleAuto()){
			r += 15;
			special.push("scale auto");
		}
		let cubes = this.getAverageCubesInVault();
		if(cubes > 6){
			r += 10;
			special.push("super cubes vault");
		} else if(cubes > 5.5){
			r += 8;
			special.push("great cubes vault");
		} else if(cubes > 5){
			cool.push("good cubes vault");
			r += 5;
		}
		if(this.getTeleopSwitchOwnershipTimePercent() > .9){
			r += 5;
			special.push("high switch ownership");
		}
		let scale = this.getTeleopScaleOwnershipTimePercent();
		if(scale > .9){
			r += 15;
			special.push("super high scale ownership");
		} else if(scale > .8){
			r += 10;
			special.push("high scale ownership");
		} else if(scale > .65){
			r += 7;
			special.push("great scale ownership");
		} else if(scale > .4){
			r += 5;
			cool.push("good scale");
		}
		if(this.endgameNothingTotal / this.countableMatches < .1){
			r += 2;
			cool.push("moves at end");
		}

		let losses = this.totalLosses;
		if(losses < 3){ // you need to rack up wins for this to do anything
			losses = 3;
		}
		r += Math.round(5 * this.totalWins / losses);
		r += Math.round(this.rankingPointsTotal / 10.0);
		return [r, cool, special];
	}
	getClimbPercent(){
		return this.endgameClimbTotal / this.countableMatches;
	}
	// telop
	getTeleopSwitchOwnershipTimePercent(){
		return this.teamTeleopSwitchOwnershipTotalSeconds / (135 * this.countableMatches);
	}
	getTeleopScaleOwnershipTimePercent(){
		return this.teamTeleopScaleOwnershipTotalSeconds / (135 * this.countableMatches);
	}
	//auto
	getAutoSwitchOwnershipTimeAverage(){
		return this.teamAutoSwitchOwnershipTotalSeconds / this.countableMatches;
	}
	getAutoScaleOwnershipTimeAverage(){
		return this.teamAutoScaleOwnershipTotalSeconds / this.countableMatches;
	}
	getSuccessfulAutoSwitchOwnershipTimeAverage(){
		return this.teamAutoSwitchOwnershipTotalSeconds / this.timesTeamOwnSwitchAfterAuto;
	}
	getSuccessfulAutoScaleOwnershipTimeAverage(){
		return this.teamAutoScaleOwnershipTotalSeconds / this.timesTeamOwnScaleAfterAuto;
	}

	getAutoSwitchSuccessPercent(){
		return this.timesTeamOwnSwitchAfterAuto / this.countableMatches;
	}
	getAutoScaleSuccessPercent(){
		return this.timesTeamOwnScaleAfterAuto / this.countableMatches;
	}


	getAverageCubesInVault(){
		return this.totalCubesAtMatchEndTotal / this.countableMatches;
	}

	hasAnyAuto(){
		return this.getAutoSuccessPercent() >= .50;
	}
	hasSwitchAuto(){
		return this.getAutoSwitchSuccessPercent() >= .54 && this.hasAnyAuto();
	}
	hasScaleAuto(){
		return this.getAutoScaleSuccessPercent() >= .40 && this.hasAnyAuto();
	}
	canClimb(){
		return this.getClimbPercent() >= .3;
	}

	/**
	 *
	 * @returns {number} -1 if !canClimb(), 0 if we can't double or triple climb, 1 for able to double climb and 2 for able to triple climb
	 */
	extraSupportedRobotsWhileClimbing(){
		if(!this.canClimb()){
			return -1;
		}
		let extraClimbs = this.numberDoubleClimbs + this.numberTripleClimbs;
		if(extraClimbs / this.endgameClimbTotal >= .3){
			if(this.numberTripleClimbs >= 2){
				return 2;
			}
			return 1;
		}
		return 0;
	}


}
