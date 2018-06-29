'use strict';
/*
 * This file contains helper functions that will be used throughout the website on other javascript files.
 */

const API_URL = "https://www.thebluealliance.com/api/v3";



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
function setQueryObject(object){
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
	// location.search = r;
	window.history.replaceState(null, null, r);
}

/**
 *
 * @param key The key
 * @param value The value to set
 * @returns {boolean} false if the current value is equal to the new value or true if a new value was set.
 *          NOTE that true will probably never be returned because calling this function will make the page automatically reload
 */
function setQueryKey(key, value){
	let object = getQueryObject();
	if(object[key] === "" + value){
		return false;
	}
	object[key] = value;
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
function setCurrentTeamNumber(number){ // number can be number or null
	if(number === undefined) throw "Must pass number argument (or null). Got undefined";
	if(typeof number !== 'number' && number !== null) throw "number must be a Number. got: '" + number + "' as : " + (typeof number);

	let numberString = "" + number; // A string representing a number or representing "null"

	setQueryKey("team", number); // this will likely reload the page but the next time it's called it won't
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

/**
 * @returns {?Number} The team number or null
 */
function getCurrentTeamNumber(){
	let currentTeamNumber = getQueryObject()["team"];
	if(currentTeamNumber === undefined){
		return null;
	}
	return +currentTeamNumber;
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
function setAuthKey(authKey){
	setQueryKey("auth", authKey);
}

function getDesiredYear(){
	let year = getQueryObject()["year"];
	if(year === undefined || year === "null"){
		let r = new Date().getFullYear();
		setDesiredYear(r);
		return r;
	}

	return year;
}
function setDesiredYear(year){
	if(year === null || year === undefined) throw "Year cannot be null or undefined";

	setQueryKey("year", year);
	for(let yearElement of document.getElementsByClassName("current_year")){
		yearElement.innerText = year;
	}
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
					console.log("winning_alliance is: '" + match.winning_alliance + "'. It is either a tie or we will use the score to figure out who won.");
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
			if(match.score_breakdown === null){ // 2014 and before is always like this
				robotAuto = "Unknown";
			} else {
				robotAuto = teamBreakdown["autoRobot" + this.getRobotNumber(match)];
			}
			if(robotAuto === "Unknown"){
				this.unknownAutoRunCount++;
			} else if(robotAuto !== "None"){
				this.successAutoRunCount++;
			}
			if(match.score_breakdown !== null){
				this.autoPointsTotal += match.score_breakdown.autoPoints;
				this.telopPointsTotal += match.score_breakdown.teleopPoints;
				this.totalPointsTotal += match.score_breakdown.totalPoints;
				this.foulPointsReceivedTotal += match.score_breakdown.foulPoints;

				this.teamTechFoulCommittedTotal += match.score_breakdown.techFoulCount;
				this.teamFoulCommittedTotal += match.score_breakdown.foulCount;
			}
		}
	}
	isRobotBlue(match){
		return match.alliances.blue.team_keys.includes(this.teamKey);
	}
	getRobotNumber(match){
		let isOnBlue = this.isRobotBlue(match);
		return 1 + (isOnBlue ? match.alliances.blue.team_keys : match.alliances.red.team_keys).indexOf(this.teamKey);
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
			let breakdown = (isOnBlue ? match.score_breakdown.blue : match.score_breakdown.red);

			this.rankingPointsTotal += breakdown.rp;
			let endgame = breakdown["endgameRobot" + this.getRobotNumber(match)];
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
				default:
					console.log("got: '" + endgame + "' as endgame.");
					this.endgameNothingTotal++;
					break;
			}
			let teamNumberClimbs = 0;
			for(let i = 0; i < 3; i++){
				let teamEndgame = breakdown["endgameRobot" + (1 + i)];
				if(teamEndgame === "Climbing"){
					teamNumberClimbs++;
				}
			}
			if(teamNumberClimbs === 2){
				this.numberDoubleClimbs++;
			} else if(teamNumberClimbs === 3){
				this.numberTripleClimbs++;
			}
			let autoSwitchSeconds = breakdown.autoSwitchOwnershipSec;
			this.teamAutoSwitchOwnershipTotalSeconds += autoSwitchSeconds;
			if(autoSwitchSeconds > 0 || breakdown.autoSwitchAtZero) this.timesTeamOwnSwitchAfterAuto++;

			let autoScaleSeconds = breakdown.autoScaleOwnershipSec;
			this.teamAutoScaleOwnershipTotalSeconds += autoScaleSeconds;
			if(autoScaleSeconds > 0) this.timesTeamOwnScaleAfterAuto++;

			this.teamTeleopSwitchOwnershipTotalSeconds += breakdown.teleopSwitchOwnershipSec;
			this.teamTeleopScaleOwnershipTotalSeconds += breakdown.teleopScaleOwnershipsec;

			if(breakdown.vaultBoostPlayed > 0) this.timesBoostPlayed++;
			if(breakdown.vaultForcePlayed > 0) this.timesForcePlayed++;
			if(breakdown.vaultLevitatePlayed === 3) this.timesLevitatePlayed++;
			this.totalCubesAtMatchEndTotal += breakdown.vaultBoostTotal + breakdown.vaultForceTotal + breakdown.vaultLevitateTotal;

		}
	}
}
