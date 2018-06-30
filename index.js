
function onHomeTeamNumberInputKey(inputElement){
	if(event.key === "Enter"){
		onTeamNumberInputKey(inputElement);
		location.href = "team/" + location.search;
	}
}

(function(){// main function
	updateTeamNumber();
})();