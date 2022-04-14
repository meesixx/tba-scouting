'use strict';
/*
 * This file contains helper functions that will be used throughout the website on other javascript files.
 */

const API_URL = "https://www.thebluealliance.com/api/v3";
function updateTeamNumberInputElement(inputElement){
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
}

function prettyPercent(percent){
    if(percent === null || percent === undefined){
        throw "percent is: " + percent;
    }
    return "" + (Math.round(percent * 1000) / 10.0) + "%";
}
function prettyDecimal(decimal){
    return (Math.round(decimal * 10) / 10) + "";
}
function realOrZero(number){
    if(isNaN(number) || !isFinite(number)){
        return 0;
    }
    return number;
}
function getTeamNumberFromKey(teamKey){
    return +teamKey.slice(3, teamKey.length);
}

function getJsonData(subUrl, authKey, successFunction, errorFunction=null){
    if(!subUrl){
        throw "subUrl cannot be blank and cannot be null. Value: '" + subUrl + "'";
    }
    if(authKey === null || authKey === undefined){
        throw "Auth key cannot be null or undefined.";
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
function getTeamMatches(teamNumber, year, authKey, successFunction, errorFunction=null){
    getJsonData("team/frc" + teamNumber + "/matches/" + year, authKey, successFunction, errorFunction);
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
    for(let keyValueString of arr){
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
        if(!object.hasOwnProperty(key)){
            throw "object: " + object + " doesn't have key: " + key;
        }
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
    const object = getQueryObject();
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
function setIdText(id, text){
    if(id === undefined || text === undefined) throw "You must pass both id, and text.";

    if(text === null){
        text = "?";
    }
    let element = null;
    try {
        element = document.getElementById(id);
    } catch(exception){
    }
    if(element === null){
        throw "Element with id: '" + id + "' not found.";
    }
    element.innerText = text;
}
function setIdHtml(id, html){
    if(id === undefined || html === undefined) throw "You must pass both id, and text.";

    if(html === null){
        html = "?";
    }
    let element = null;
    try {
        element = document.getElementById(id);
    } catch(exception){}

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
function setClassHtml(clazz, text){
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
    updateTeamNumberTitle();
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
function setCurrentMatch(matchKey){
    if(matchKey === undefined) throw "Must pass match key!";
    setQueryKey("match", matchKey);
}
function getCurrentMatch(){
    const r = getQueryObject()["match"];
    if(r === undefined){
        return null;
    }
    return r;
}
function updateTeamNumberTitle(){
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
function createRobotRanking(year, teamNumber, matches){
    const filteredMatches = [];
    const unplayedMatches = [];
    for(const match of matches){
        if(match.post_result_time !== null || match.winning_alliance !== ""){ // check if the match actually happened
            filteredMatches.push(match);
        } else {
            unplayedMatches.push(match);
        }
        // console.log("key: " + match.key + " post_result_time: " + match.post_result_time);
        // console.log(match);
    }
    switch(year){
        case 2018:
            return new RobotRanking2018(teamNumber, filteredMatches, unplayedMatches);
        case 2019:
            return new RobotRanking2019(teamNumber, filteredMatches, unplayedMatches);
        case 2020: case 2021:
            return new RobotRanking2020(teamNumber, filteredMatches, unplayedMatches);
        case 2022:
            return new RobotRanking2022(teamNumber, filteredMatches, unplayedMatches);
    }
    return new RobotRanking(teamNumber, filteredMatches, unplayedMatches);
}


class RobotRanking extends Object {
    constructor(teamNumber, matches, unplayedMatches){
        super();
        this.playedMatches = matches;
        this.unplayedMatches = unplayedMatches;

        this.teamNumber = teamNumber;
        this.teamKey = "frc" + teamNumber;

        this.eventsAttendedKeys = [];
        this.countableMatches = 0; // aka breakdownable matches. Should be used with more advanced stats

        this.rankingPointsTotal = 0;
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

        this.blueMatches = [];
        this.redMatches = [];
        this.blueMatchesUnplayed = [];
        this.redMatchesUnplayed = [];
        for(const match of unplayedMatches){
            const isOnBlue = this.isRobotBlue(match);
            if(isOnBlue){
                this.blueMatchesUnplayed.push(match.key);
            } else {
                this.redMatchesUnplayed.push(match.key);
            }
        }

        for(const match of matches){
            const matchEventKey = match.event_key;
            if(!this.eventsAttendedKeys.includes(matchEventKey)){
                this.eventsAttendedKeys.push(matchEventKey);
            }
            const isOnBlue = this.isRobotBlue(match);
            if(isOnBlue){
                this.blueMatches.push(match.key);
            } else {
                this.redMatches.push(match.key);
            }

            let teamBreakdown = null;
            if(match.score_breakdown !== null){
                if(match.score_breakdown === undefined){
                    throw "Score breakdown was undefined! This should not happen!";
                }
                this.countableMatches++;
                teamBreakdown = (isOnBlue ? match.score_breakdown.blue : match.score_breakdown.red);
                this.rankingPointsTotal += teamBreakdown.rp;
            }
            const isPlayoff = match.comp_level !== "qm";
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
    getExtraMatchInfo(match) {
        return "";
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
class RobotRanking2018 extends RobotRanking {
    constructor(teamNumber, matches, unplayedMatches){
        super(teamNumber, matches, unplayedMatches);
        /** The number of matches that affected these rankings (if a match had no score_breakdown, it wouldn't count as a "countable match" */

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
    // region 2018 Getters
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

        // let losses = this.totalLosses;
        // if(losses < 3){ // you need to rack up wins for this to do anything
        //     losses = 3;
        // }
        // r += Math.round(5 * this.totalWins / losses);
        // r += Math.round(this.rankingPointsTotal / 10.0);
        r += realOrZero(7 * this.totalWins / (this.totalWins + this.totalLosses)); // add a max of 7 points
        r += this.rankingPointsTotal / 10.0;
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
    // endregion

}

const ROCKET_LEVEL3_SLOTS = ["topLeftRocketFar", "topLeftRocketNear", "topRightRocketFar", "topRightRocketNear"];
const ROCKET_LEVEL2_SLOTS = ["midLeftRocketFar", "midLeftRocketNear", "midRightRocketFar", "midRightRocketNear"];
const ROCKET_LEVEL1_SLOTS = ["lowLeftRocketFar", "lowLeftRocketNear", "lowRightRocketFar", "lowRightRocketNear"];
const ALL_ROCKET_SLOTS = ROCKET_LEVEL1_SLOTS.concat(ROCKET_LEVEL2_SLOTS).concat(ROCKET_LEVEL3_SLOTS);

class RobotRanking2019 extends RobotRanking {
    constructor(teamNumber, matches, unplayedMatches){
        super(teamNumber, matches, unplayedMatches);
        this.endgame1 = 0;
        this.endgame2 = 0;
        this.endgame3 = 0;
        this.endgameNone = 0;

        this.crossSandstorm = 0;
        this.crossTeleop = 0;
        this.crossNever = 0;

        this.startLevel2AndCross = 0;
        this.startOther = 0; // start somewhere other than level 2 or started on level 2 and never crossed

        this.allianceCargoShipHatchesPlaced = 0;
        this.allianceCargoShipHatchesMissed = 0;

        this.allianceCargoShipCargoPlaced = 0;
        this.allianceCargoShipCargoMissed = 0;

        this.allianceRocket1HatchesPlaced = 0;
        this.allianceRocket1HatchesMissed = 0;
        this.allianceRocket2HatchesPlaced = 0;
        this.allianceRocket2HatchesMissed = 0;
        this.allianceRocket3HatchesPlaced = 0;
        this.allianceRocket3HatchesMissed = 0;

        this.allianceRocket1CargoPlaced = 0;
        this.allianceRocket1CargoMissed = 0;
        this.allianceRocket2CargoPlaced = 0;
        this.allianceRocket2CargoMissed = 0;
        this.allianceRocket3CargoPlaced = 0;
        this.allianceRocket3CargoMissed = 0;

        for(const match of matches){
            if(match.score_breakdown === null){
                continue;
            }
            const isOnBlue = this.isRobotBlue(match);
            const teamBreakdown = (isOnBlue ? match.score_breakdown.blue : match.score_breakdown.red);
            console.log(match.key);
            console.log(teamBreakdown);
            const robotNumber = this.getRobotNumber(match); // 1 - left, 2 - middle, 3 - right (driver station position)
            const endgame = teamBreakdown["endgameRobot" + robotNumber]; // HabLevel1 HabLevel2 HabLevel3 None Unknown
            const habLine = teamBreakdown["habLineRobot" + robotNumber]; // CrossedHabLineInSandstorm CrossedHabLineInTeleop None Unknown
            const startingLevel = teamBreakdown["preMatchLevelRobot" + robotNumber]; // HabLevel1 HabLevel2 Unknown

            switch(endgame){
                case "HabLevel1":
                    this.endgame1++;
                    break;
                case "HabLevel2":
                    this.endgame2++;
                    break;
                case "HabLevel3":
                    this.endgame3++;
                    break;
                case "None":
                    this.endgameNone++;
                    break;
                case "Unknown":
                    break;
                default:
                    console.log("Unsupported/unknown endgame: " + endgame);
                    break;
            }
            switch(habLine){
                case "CrossedHabLineInSandstorm":
                    this.crossSandstorm++;
                    break;
                case "CrossedHabLineInTeleop":
                    this.crossTeleop++;
                    break;
                case "None":
                    this.crossNever++;
                    break;
                case "Unknown":
                    break;
                default:
                    console.log("Unknown habLineRobot: " + habLine);
                    break;
            }
            if(startingLevel === "HabLevel1" || habLine === "None"){
                this.startOther++;
            } else if(startingLevel === "HabLevel2"){
                this.startLevel2AndCross++;
            }
            // const shipTopRight = match.bay1;
            // const shipMiddleRight = match.bay2;
            // const shipBottomRight = match.bay3;
            // const shipCenterRight = match.bay4; // correct
            // const shipCenterLeft = match.bay5; // correct
            // const shipBottomLeft = match.bay6;
            // const shipMiddleLeft = match.bay7;
            // const shipTopLeft = match.bay8;
            for(let i = 1; i <= 8; i++){
                const pre = teamBreakdown["preMatchBay" + i];
                const post = teamBreakdown["bay" + i];
                if(post !== "Unknown") {
                    if (pre !== "Panel" && pre !== "Unknown") {
                        if (post === "Panel" || post === "PanelAndCargo") {
                            this.allianceCargoShipHatchesPlaced++;
                        } else {
                            this.allianceCargoShipHatchesMissed++;
                        }
                    }
                    if (post === "PanelAndCargo") {
                        this.allianceCargoShipCargoPlaced++;
                    } else {
                        this.allianceCargoShipCargoMissed++;
                    }
                }
            }
            for(const rocketSlot of ALL_ROCKET_SLOTS){
                let level;
                if(ROCKET_LEVEL1_SLOTS.includes(rocketSlot)){
                    level = "1";
                } else if(ROCKET_LEVEL2_SLOTS.includes(rocketSlot)){
                    level = "2";
                } else if(ROCKET_LEVEL3_SLOTS.includes(rocketSlot)){
                    level = "3";
                } else {
                    throw new Error();
                }
                const value = teamBreakdown[rocketSlot];
                switch(value){
                    case "Panel":
                        this["allianceRocket" + level + "HatchesPlaced"]++;
                        this["allianceRocket" + level + "CargoMissed"]++;
                        break;
                    case "PanelAndCargo":
                        this["allianceRocket" + level + "HatchesPlaced"]++;
                        this["allianceRocket" + level + "CargoPlaced"]++;
                        break;
                    case "None":
                        this["allianceRocket" + level + "HatchesMissed"]++;
                        this["allianceRocket" + level + "CargoMissed"]++;
                        break;
                    case "Unknown":
                        break;
                    default:
                        console.log("Unknown value: " + value + " for rocketSlot: " + rocketSlot + " and level: " + level);
                }
            }

        }
    }

    // region endgame
    getEndgameLevel1String(){
        return this.endgame1 + " (" + prettyPercent(this.endgame1 / (this.endgame1 + this.endgame2 + this.endgame3 + this.endgameNone)) + ")";
    }
    getEndgameLevel2String(){
        return this.endgame2 + " (" + prettyPercent(this.endgame2 / (this.endgame1 + this.endgame2 + this.endgame3 + this.endgameNone)) + ")";
    }
    getEndgameLevel3String(){
        return this.endgame3 + " (" + prettyPercent(this.endgame3 / (this.endgame1 + this.endgame2 + this.endgame3 + this.endgameNone)) + ")";
    }
    getEndgameNoneString(){
        return this.endgameNone + " (" + prettyPercent(this.endgameNone / (this.endgame1 + this.endgame2 + this.endgame3 + this.endgameNone)) + ")";
    }
    // endregion

    // region crossing
    getMatchesDeadString(){
        return this.crossNever + " (" + prettyPercent(this.crossNever / (this.crossNever + this.crossTeleop + this.crossSandstorm)) + ")";
    }
    getMatchesCrossSandstormString(){
        return this.crossSandstorm + " (" + prettyPercent(this.crossSandstorm / (this.crossNever + this.crossTeleop + this.crossSandstorm)) + ")";
    }
    getMatchesCrossTeleopString(){
        return this.crossTeleop + " (" + prettyPercent(this.crossTeleop / (this.crossNever + this.crossTeleop + this.crossSandstorm)) + ")";
    }
    // endregion

    //region cargo
    getAllianceCargoShipHatchesPlacedString(){
        return this.allianceCargoShipHatchesPlaced + " (" + prettyPercent(this.allianceCargoShipHatchesPlaced / (this.allianceCargoShipHatchesPlaced + this.allianceCargoShipHatchesMissed)) + ")";
    }
    getAllianceCargoShipCargoPlacedString(){
        return this.allianceCargoShipCargoPlaced + " (" + prettyPercent(this.allianceCargoShipCargoPlaced / (this.allianceCargoShipCargoPlaced + this.allianceCargoShipCargoMissed)) + ")";
    }
    //endregion

    // region rocket
    getAllianceLevel1RocketHatchesString(){
        return this.allianceRocket1HatchesPlaced + " (" + prettyPercent(this.allianceRocket1HatchesPlaced / (this.allianceRocket1HatchesPlaced + this.allianceRocket1HatchesMissed)) + ")";
    }
    getAllianceLevel1RocketCargoString(){
        return this.allianceRocket1CargoPlaced + " (" + prettyPercent(this.allianceRocket1CargoPlaced / (this.allianceRocket1CargoPlaced + this.allianceRocket1CargoMissed)) + ")";
    }

    getAllianceLevel2RocketHatchesString(){
        return this.allianceRocket2HatchesPlaced + " (" + prettyPercent(this.allianceRocket2HatchesPlaced / (this.allianceRocket2HatchesPlaced + this.allianceRocket2HatchesMissed)) + ")";
    }
    getAllianceLevel2RocketCargoString(){
        return this.allianceRocket2CargoPlaced + " (" + prettyPercent(this.allianceRocket2CargoPlaced / (this.allianceRocket2CargoPlaced + this.allianceRocket2CargoMissed)) + ")";
    }

    getAllianceLevel3RocketHatchesString(){
        return this.allianceRocket3HatchesPlaced + " (" + prettyPercent(this.allianceRocket3HatchesPlaced / (this.allianceRocket3HatchesPlaced + this.allianceRocket3HatchesMissed)) + ")";
    }
    getAllianceLevel3RocketCargoString(){
        return this.allianceRocket3CargoPlaced + " (" + prettyPercent(this.allianceRocket3CargoPlaced / (this.allianceRocket3CargoPlaced + this.allianceRocket3CargoMissed)) + ")";
    }
    // endregion
    rank(){
        const cool = [];
        const special = [];

        let r = 0;

        const level3Percentage = this.endgame3 / (this.endgameNone + this.endgame1 + this.endgame2 + this.endgame3);
        if(!isNaN(level3Percentage)) {
            if (level3Percentage > .4) {
                special.push("Level 3 Climb");
            }
            r += 7 * level3Percentage;
        }
        const level2Percentage = this.endgame2 / (this.endgameNone + this.endgame1 + this.endgame2 + this.endgame3);
        if(!isNaN(level2Percentage)) {
            if (level2Percentage > .4) {
                cool.push("Level 2 Climb");
            }
            r += 4 * level2Percentage;
        }

        const endgameNonePercentage = this.endgameNone / (this.endgameNone + this.endgame1 + this.endgame2 + this.endgame3);

        if(!isNaN(endgameNonePercentage)) {
            r -= 10 * endgameNonePercentage; // max of -10 points
        }

        r -= this.crossNever * 3;

        r -= this.crossTeleop * .5;

        for(const obj of [
            {
                level: 1,
                hatchMultiplier: 2,
                cargoMultiplier: 4.5
            },
            {
                level: 2,
                hatchMultiplier: 6,
                cargoMultiplier: 8.5
            },
            {
                level: 3,
                hatchMultiplier: 10,
                cargoMultiplier: 15
            }
        ]){
            const level = obj.level;

            const hatchesPlaced = this["allianceRocket" + level + "HatchesPlaced"];
            const hatchesMissed = this["allianceRocket" + level + "HatchesMissed"];
            const rocketHatchPercentage = hatchesPlaced / Math.max(hatchesPlaced + hatchesMissed, 1);
            r += obj.hatchMultiplier * rocketHatchPercentage;
            if(rocketHatchPercentage >= .4){
                special.push("GREAT Rocket lv" + level + " Hatch");
            } else if(rocketHatchPercentage >= .25){
                cool.push("Rocket lv" + level + " Hatch");
            }

            const cargoPlaced = this["allianceRocket" + level + "CargoPlaced"];
            const cargoMissed = this["allianceRocket" + level + "CargoMissed"];
            const rocketCargoPercentage = cargoPlaced / Math.max(cargoPlaced + cargoMissed, 1);
            r += obj.cargoMultiplier * rocketCargoPercentage;
            if(rocketCargoPercentage >= .35){
                special.push("AMAZING Rocket lv" + level + " Cargo");
            } else if(rocketCargoPercentage >= .17){
                cool.push("Rocket lv" + level + " Cargo");
            }
        }

        const shipHatchPercentage = this.allianceCargoShipHatchesPlaced / Math.max(this.allianceCargoShipHatchesPlaced + this.allianceCargoShipHatchesMissed, 1);
        r += 2 * shipHatchPercentage;
        if (shipHatchPercentage > .7) {
            cool.push("Cargo Ship Hatch Placement");
        }

        const shipCargoPercentage = this.allianceCargoShipCargoPlaced / Math.max(this.allianceCargoShipCargoPlaced + this.allianceCargoShipCargoMissed, 1);
        r += 5 * shipCargoPercentage;
        if (shipCargoPercentage > .5) {
            special.push("Cargo Ship Great Cargo");
        }

        const start2CrossPercentage = this.startLevel2AndCross / Math.max(this.startLevel2AndCross + this.startOther, 1);
        r += 5 * start2CrossPercentage;
        if(start2CrossPercentage > .5){
            cool.push("Start Level 2");
        }

        r += realOrZero(7 * this.totalWins / (this.totalWins + this.totalLosses)); // add a max of 7 points
        r += this.rankingPointsTotal / 10.0;
        return [r, cool, special];
    }
}

class RobotRanking2020 extends RobotRanking {
    constructor(teamNumber, matches, unplayedMatches) {
        super(teamNumber, matches, unplayedMatches);

        this.initLineExitCount = 0;
        this.initLineNoneCount = 0;

        this.endgameNone = 0;
        this.endgamePark = 0;
        this.endgameHang = 0;

        this.levelHangs = 0;
        this.notLevelHangs = 0;
        this.singleLevelHangs = 0;
        this.singleNotLevelHangs = 0;
        this.doubleLevelHangs = 0;
        this.doubleNotLevelHangs = 0;
        this.tripleLevelHangs = 0;
        this.tripleNotLevelHangs = 0;

        this.endgameNoneWithNoHangs = 0;

        this.autoBottomTotal = 0;
        this.autoOuterTotal = 0;
        this.autoInnerTotal = 0;

        this.teleopBottomTotal = 0;
        this.teleopOuterTotal = 0;
        this.teleopInnerTotal = 0;

        for(const match of matches){
            if(match.score_breakdown === null){
                continue;
            }
            const isOnBlue = this.isRobotBlue(match);
            const teamBreakdown = isOnBlue ? match.score_breakdown.blue : match.score_breakdown.red;
            const robotNumber = this.getRobotNumber(match);
            const initLine = teamBreakdown["initLineRobot" + robotNumber]; // Unknown, None, Exited
            switch(initLine){
                case "None":
                    this.initLineNoneCount++;
                    break;
                case "Exited":
                    this.initLineExitCount++;
                    // only give them credit if they actually move
                    this.autoBottomTotal += teamBreakdown.autoCellsBottom;
                    this.autoOuterTotal += teamBreakdown.autoCellsOuter;
                    this.autoInnerTotal += teamBreakdown.autoCellsInner;
                    break;
                case "Unknown":
                    break;
                default:
                    console.log("Unknown init line: " + initLine);
                    break;
            }
            this.teleopBottomTotal += teamBreakdown.teleopCellsBottom;
            this.teleopOuterTotal += teamBreakdown.teleopCellsOuter;
            this.teleopInnerTotal += teamBreakdown.teleopCellsInner;

            const endgame = teamBreakdown["endgameRobot" + robotNumber]; // Unknown, None, Park, Hang
            const numberOfHangs = teamBreakdown.tba_numRobotsHanging;
            switch(endgame) {
                case "None":
                    this.endgameNone++;
                    if(numberOfHangs === 0){
                        this.endgameNoneWithNoHangs++;
                    }
                    break;
                case "Park":
                    this.endgamePark++;
                    break;
                case "Hang":
                    this.endgameHang++;
                    const levelEnum = teamBreakdown.endgameRungIsLevel;
                    switch(levelEnum){
                        case "IsLevel":
                            this.levelHangs++;
                            if(numberOfHangs === 1){
                                this.singleLevelHangs++;
                            } else if(numberOfHangs === 2){
                                this.doubleLevelHangs++;
                            } else if(numberOfHangs === 3){
                                this.tripleLevelHangs++;
                            }
                            break;
                        case "NotLevel":
                            this.notLevelHangs++;
                            if(numberOfHangs === 1){
                                this.singleNotLevelHangs++;
                            } else if(numberOfHangs === 2){
                                this.doubleNotLevelHangs++;
                            } else if(numberOfHangs === 3){
                                this.tripleNotLevelHangs++;
                            }
                            break;
                        case "Unknown":
                            console.log("Rung Is Level is unknown when this robot climbed...");
                            break;
                        default:
                            console.log("Unknown level enum: " + levelEnum);
                            break;
                    }
                    break;
                case "Unknown":
                    break;
                default:
                    console.log("Unknown endgame: " + endgame);
                    break;
            }
        }
    }
    getExtraMatchInfo(match) {
        const matchScoreBreakdown = match.score_breakdown;
        if(matchScoreBreakdown === null){
            return super.getExtraMatchInfo(match);
        }
        const breakdown = this.isRobotBlue(match) ? match.score_breakdown.blue : match.score_breakdown.red;
        const number = this.getRobotNumber(match);
        const initLine = breakdown["initLineRobot" + number];
        const endgame = breakdown["endgameRobot" + number];
        return "Init: " + initLine + " | Endgame: " + endgame + " | Hang Total: " + breakdown["tba_numRobotsHanging"];
    }
    rank() {
        const cool = [];
        const special = [];

        let r = 0;
        r += this.rankingPointsTotal / 10.0;

        const totalInitLine = this.initLineNoneCount + this.initLineExitCount;
        if(totalInitLine !== 0){
            r -= this.initLineNoneCount / totalInitLine * 3.0;
        }

        const totalEndgames = this.endgameNone + this.endgamePark + this.endgameHang;

        if(totalEndgames !== 0){
            r -= this.endgameNoneWithNoHangs / totalEndgames * 5.0;

            const endgameHangPercent = this.endgameHang / totalEndgames;
            r += 12 * endgameHangPercent;
            if(endgameHangPercent > .9){
                special.push("Very Reliable Hang");
            } else if(endgameHangPercent > .7){
                special.push("Reliable Hang");
            } else if(endgameHangPercent > .45){
                cool.push("Good Hang");
            } else if(endgameHangPercent > .2){
                cool.push("OK Hang");
            }
        }

        if(this.countableMatches > 0){
            const autoBottomAverage = this.autoBottomTotal / this.countableMatches;
            const autoUpperAverage = (this.autoOuterTotal + this.autoInnerTotal) / this.countableMatches;
            if(autoBottomAverage > 2.5){
                r += 3;
                cool.push("Reliable Bottom Auto");
            } else if(autoBottomAverage > 2.0){
                r += 2;
                cool.push("Bottom Auto");
            }
            if(autoUpperAverage > 10){
                r += 9;
                special.push("10 Ball Upper Auto")
            } else if(autoUpperAverage > 7){
                r += 8.5;
                special.push("7 Ball Upper Auto")
            } else if(autoUpperAverage > 5.1){
                r += 8;
                special.push("Reliable 5 Ball Upper Auto")
            } else if(autoUpperAverage >= 4.7){
                r += 7;
                special.push("5 Ball Upper Auto");
            } else if(autoUpperAverage >= 3.0){
                r += 5;
                cool.push("Reliable Upper Auto")
            }else if(autoUpperAverage >= 2.7){
                r += 4;
                cool.push("Upper Auto");
            }
            const teleopBottomAverage = this.teleopBottomTotal / this.countableMatches;
            const teleopUpperAverage = (this.teleopOuterTotal + this.teleopInnerTotal) / this.countableMatches;
            r += teleopBottomAverage * 1.1;
            r += teleopUpperAverage * 2.0;
            if(teleopBottomAverage > 20){
                special.push("Holy Crap! Bottom");
            } else if(teleopBottomAverage > 15){
                special.push("Super Bottom");
            } else if(teleopBottomAverage > 8){
                cool.push("Good Bottom");
            } else if(teleopBottomAverage > 5){
                cool.push("Decent Bottom");
            } else if(teleopBottomAverage >= 3){
                cool.push("Can Do Bottom")
            }
            if(teleopUpperAverage > 30){
                special.push("Holy Crap! Upper");
            } else if(teleopUpperAverage > 25){
                special.push("Super Duper Upper");
            } else if(teleopUpperAverage > 20){
                special.push("Super Upper");
            } else if(teleopUpperAverage > 12){
                cool.push("Good Upper");
            } else if(teleopUpperAverage > 7){
                cool.push("Decent Upper");
            }
        }

        return [r, cool, special]
    }

    getInitLineNoneString(){
        return this.initLineNoneCount + "(" + prettyPercent(this.initLineNoneCount / (this.initLineNoneCount + this.initLineExitCount)) + ")";
    }
    getInitLineExitString(){
        return this.initLineExitCount + "(" + prettyPercent(this.initLineExitCount / (this.initLineNoneCount + this.initLineExitCount)) + ")";
    }

    getEndgameHangString(){
        return this.endgameHang + "(" + prettyPercent(this.endgameHang / (this.endgameNone + this.endgamePark + this.endgameHang)) + ")";
    }
    getEndgameParkString(){
        return this.endgamePark + "(" + prettyPercent(this.endgamePark / (this.endgameNone + this.endgamePark + this.endgameHang)) + ")";
    }
    getEndgameNoneString(){
        return this.endgameNone + "(" + prettyPercent(this.endgameNone / (this.endgameNone + this.endgamePark + this.endgameHang)) + ")";
    }
    getEndgameNoneWithNoHangsString() {
        return this.endgameNoneWithNoHangs + "(" + prettyPercent(this.endgameNoneWithNoHangs / this.endgameNone) + ")";
    }
}

const ENDGAME_TRAVERSAL = "Traversal";
const ENDGAME_HIGH = "High";
const ENDGAME_MID = "Mid";
const ENDGAME_LOW = "Low";
const ENDGAME_NONE = "None";

class RobotRanking2022 extends RobotRanking {

    constructor(teamNumber, matches, unplayedMatches) {
        super(teamNumber, matches, unplayedMatches);
        this.endgameTraversalCount = 0;
        this.endgameHighCount = 0;
        this.endgameMidCount = 0;
        this.endgameLowCount = 0;
        this.endgameNoneCount = 0;

        this.autonomousMoved = 0;
        this.autonomousStill = 0;

        this.autoCargoLowerTotal = 0;
        this.autoCargoUpperTotal = 0;
        this.teleopCargoLowerTotal = 0;
        this.teleopCargoUpperTotal = 0;
        this.totalBreakdownCount = 0;

        for (const match of matches) {
            const endgame = this.getEndgame(match);
            switch (endgame) {
                case ENDGAME_TRAVERSAL:
                    this.endgameTraversalCount++;
                    break;
                case ENDGAME_HIGH:
                    this.endgameHighCount++;
                    break;
                case ENDGAME_MID:
                    this.endgameMidCount++;
                    break;
                case ENDGAME_LOW:
                    this.endgameLowCount++;
                    break;
                case ENDGAME_NONE:
                    this.endgameNoneCount++;
                    break;
                case null:
                    break;
                default:
                    throw "Unknown endgame: " + endgame;
            }
            const taxi = this.getTaxi(match);
            if (taxi !== null) {
                if (taxi) {
                    this.autonomousMoved++;
                } else {
                    this.autonomousStill++;
                }
            }
            const matchScoreBreakdown = match.score_breakdown;
            if(matchScoreBreakdown !== null){
                this.totalBreakdownCount++;
                const breakdown = this.isRobotBlue(match) ? match.score_breakdown.blue : match.score_breakdown.red;
                this.autoCargoLowerTotal += breakdown.autoCargoLowerBlue + breakdown.autoCargoLowerFar + breakdown.autoCargoLowerNear + breakdown.autoCargoLowerRed;
                this.autoCargoUpperTotal += breakdown.autoCargoUpperBlue + breakdown.autoCargoUpperFar + breakdown.autoCargoUpperNear + breakdown.autoCargoUpperRed;
                this.teleopCargoLowerTotal += breakdown.teleopCargoLowerBlue + breakdown.teleopCargoLowerFar + breakdown.teleopCargoLowerNear + breakdown.teleopCargoLowerRed;
                this.teleopCargoUpperTotal += breakdown.teleopCargoUpperBlue + breakdown.teleopCargoUpperFar + breakdown.teleopCargoUpperNear + breakdown.teleopCargoUpperRed;
            }
        }
    }

    getEndgame(match) {
        const matchScoreBreakdown = match.score_breakdown;
        if(matchScoreBreakdown === null){
            return null;
        }
        const breakdown = this.isRobotBlue(match) ? match.score_breakdown.blue : match.score_breakdown.red;
        const number = this.getRobotNumber(match);
        return breakdown["endgameRobot" + number];
    }
    getTaxi(match) {
        const matchScoreBreakdown = match.score_breakdown;
        if(matchScoreBreakdown === null){
            return null;
        }
        const breakdown = this.isRobotBlue(match) ? match.score_breakdown.blue : match.score_breakdown.red;
        const number = this.getRobotNumber(match);
        return breakdown["taxiRobot" + number] === "Yes";
    }

    rank() {
        const cool = [];
        const special = [];

        let r = 0;
        r += this.rankingPointsTotal / 10.0;

        const totalEndgameCount = this.endgameTraversalCount + this.endgameHighCount + this.endgameMidCount + this.endgameLowCount + this.endgameNoneCount;

        if (totalEndgameCount > 0) {
            const traversalPercent = this.endgameTraversalCount / totalEndgameCount;
            const highPercent = (this.endgameTraversalCount + this.endgameHighCount) / totalEndgameCount;
            const midPercent = (this.endgameTraversalCount + this.endgameHighCount + this.endgameMidCount) / totalEndgameCount;
            const nonePercent = this.endgameNoneCount / totalEndgameCount;
            const anyPercent = 1.0 - nonePercent;

            //r += Math.max(traversalPercent * 14, highPercent * 11, midPercent * 7, anyPercent * 4);
            if (traversalPercent >= 0.75) {
                special.push(prettyPercent(traversalPercent) + " traversal")
            } else if (highPercent >= 0.75) {
                special.push(prettyPercent(highPercent) + " high or above")
            } else if (midPercent >= 0.75) {
                special.push(prettyPercent(midPercent) + " mid or above")
            } else if (anyPercent >= 0.75) {
                special.push(prettyPercent(midPercent) + " low or above")
            } else if (traversalPercent > 0) {
                cool.push(prettyPercent(traversalPercent) + " traversal")
            } else if (highPercent > 0) {
                cool.push(prettyPercent(highPercent) + " high or above")
            } else if (midPercent >= 0.25) {
                cool.push(prettyPercent(midPercent) + " mid or above")
            } else if (anyPercent >= 0.25) {
                cool.push(prettyPercent(midPercent) + " low or above")
            }
        }
        const totalAutonomousCount = this.autonomousMoved + this.autonomousStill;
        if (totalAutonomousCount > 0) {
            const movePercent = this.autonomousMoved / totalAutonomousCount;
            if (movePercent >= 0.8) {
                cool.push("Moves in auto")
                r += 3;
            } else if (movePercent >= 0.6) {
                cool.push("Sometimes moves in auto")
                r += 1;
            } else if (movePercent <= 0.25) {
                r -= 4;
            }
        }
        if (this.totalBreakdownCount > 0) {
            const averageLowerAutoCount = this.autoCargoLowerTotal / this.totalBreakdownCount;
            const averageUpperAutoCount = this.autoCargoUpperTotal / this.totalBreakdownCount;

            if (averageLowerAutoCount > 3.0) {
                r += 3;
                cool.push("Reliable low auto")
            } else if (averageLowerAutoCount >= 1.0) {
                r += 1.5;
                cool.push("Low auto")
            }

            if (averageUpperAutoCount >= 3.5) {
                r += 6;
                special.push("Amazing upper auto")
            } else if (averageUpperAutoCount >= 2.0) {
                r += 4;
                cool.push("Upper auto")
            } else if (averageUpperAutoCount >= 1.1) {
                r += 2;
                cool.push("Sometimes upper auto")
            }

            const averageLowerTeleopCount = this.teleopCargoLowerTotal / this.totalBreakdownCount;
            const averageUpperTeleopCount = this.teleopCargoUpperTotal / this.totalBreakdownCount;

            if (averageUpperTeleopCount >= 18.0) {
                special.push("Amazing upper")
                r += 8;
            } else if (averageUpperTeleopCount >= 16.0) {
                special.push("Great upper")
                r += 6;
            } else {
                const teleopScoreTotal = averageLowerTeleopCount + averageUpperTeleopCount;
                if (teleopScoreTotal >= 18.0) {
                    special.push("Amazing low");
                    r += 4.2;
                } else if (teleopScoreTotal >= 14.0) {
                    cool.push("Good low");
                    r += 3.8;
                } else if (averageUpperTeleopCount >= 10.0) {
                    cool.push("Upper");
                    r += 3.5;
                }
            }
        }

        return [r, cool, special]
    }
}
