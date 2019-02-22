
function onHomeTeamNumberEnter(event, inputElement){
	if(event.key === "Enter"){
		updateTeamNumberInputElement(inputElement);
		location.href = "team/" + location.search;
	}
}
function onYearInputEnter(event, inputElement){
	if(event.key === "Enter"){
		setQueryKey("year", inputElement.value);
	}
}

(function(){// main function
	updateTeamNumberTitle();
	document.getElementById("year_input").value = getDesiredYear();
})();