
function loadNav(relativeHomepage, pageName){
	const pages = [[".", "Home"], ["team", "Team Stats"], ["sort", "Sort"], ["event", "Event"]];
	if(!relativeHomepage){
		throw "relativeHomepage cannot be blank, null, or undefined. Please use '.' instead of ''.";
	}
	if(relativeHomepage[relativeHomepage - 1] === "/"){
		relativeHomepage = relativeHomepage.slice(0, relativeHomepage.length - 1);
	}

	const table = document.createElement("table");
	const row = document.createElement("tr");
	table.appendChild(row);
	table.id = "nav_table";
	for(const page of pages){
		const url = relativeHomepage + "/" + page[0];
		const label = page[1];
		const header = document.createElement("th");
		header.innerHTML = label;
		if(page[0] === pageName){
			header.classList.add("current_nav");
		} else {
			header.onclick = function () {
				location.href = url + "/" + location.search;
			};
		}
		row.appendChild(header);
	}


	document.body.appendChild(table);
}
