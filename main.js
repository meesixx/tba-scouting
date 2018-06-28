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
