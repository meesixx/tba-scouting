function onTeamClick(teamNumber){
	setCurrentTeamNumber(teamNumber);
	location.href = "../team/" + location.search;
}

(function(){
	function updateTeams() {
		const teams = getTeams();
		let teamsString = "";
		for (let i = 0; i < teams.length; i++) {
			if (i !== 0) {
				teamsString += ", ";
			}
			teamsString += teams[i];
		}
		setIDText("sort_teams", teamsString);
	}

	(function() { // main function
		// setQueryKey("event", undefined);
		updateYear();
		updateTeams();
		const year = getDesiredYear();
		const authKey = requestAuthKey();
		const rankings = [];
		let numberErrors = 0;
		const teams = getTeams();
		for (const team of teams) {
			getJsonData("team/frc" + team + "/matches/" + year, authKey, function (matches) {
				let robotRanking;
				if (year === 2018) {
					robotRanking = new RobotRanking2018(team, matches);
				} else {
					robotRanking = new RobotRanking(team, matches);
				}
				rankings.push(robotRanking);
			}, function () {
				console.log("got error for team: " + team);
				numberErrors++;
			});
		}

		function checkLoad() {
			if (rankings.length < teams.length - numberErrors) {
				console.log("setting time out");
				setTimeout(checkLoad, 3000);
				return;
			}
			console.log("yay");
			rankings.sort(function (a, b) { // sorts highest to lowest
				return b.rank()[0] - a.rank()[0];
			});
			console.log(rankings);
			const sortTable = document.getElementById("sort_table");
			if (sortTable === null) throw "sort_elements not in html";

			for (let i = 0; i < rankings.length; i++) {
				const ranking = rankings[i];
				const teamNumber = ranking.teamNumber;
				const rankNumber = i + 1;

				const rankArray = ranking.rank();

				const row = document.createElement("tr");

				const rankTD = document.createElement("td");
				const recordTD = document.createElement("td");
				const teleopTD = document.createElement("td");
				const teamTD = document.createElement("td");
				const coolTD = document.createElement("td");
				const extraTD = document.createElement("td");
				rankTD.innerText = "" + rankNumber;
				// teamTD.innerText = "" + teamNumber;
				teamTD.innerHTML = "<a onclick='onTeamClick(" + teamNumber + ")'>" + teamNumber + "</a>";
				teamTD.style.fontWeight = "bold";
				recordTD.innerText = ranking.getTotalRecordString();
				teleopTD.innerText = "" + ranking.telopPointsTotal;
				teleopTD.align = "right";
				coolTD.innerText = rankArray[1].join(", ");
				extraTD.innerText = rankArray[2].join(", ");
				row.appendChild(rankTD);
				row.appendChild(teamTD);
				row.appendChild(recordTD);
				row.appendChild(teleopTD);
				row.appendChild(coolTD);
				row.appendChild(extraTD);

				sortTable.appendChild(row);

			}
		}

		checkLoad();
	})();
})();