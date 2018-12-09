var app = angular.module('colBetsApp', ['ngMaterial']);

app.controller('mainCtrl', function ($scope, $http, $httpParamSerializerJQLike, $mdToast) {	//Main controller
	//$http.get("https://colossusdevtest.herokuapp.com/api/pools.json") //Not used as original file is corrupted
	$http.get("json/pools.json")	// Get pools.json API (corrected file used)
	    .then(function(response) {
		$scope.dataIn = response.data;
		console.log("Pools: ", $scope.dataIn);
		toast("API pools.json imported with success");
	    });
	
	$scope.getPool = function(poolId) {	// Get json/id.json API
		//$http.get("https://colossusdevtest.herokuapp.com/api/pools/" + id + ".json") //Not used as original files are corrupted
		$http.get("json/" + poolId + ".json")	// corrected files used
		.then(function(response) {
			$scope.pool = response.data;
			$scope.sel = {};		//Selections data binding
 		   	$scope.sel.selected = [];
			$scope.stake = {};		//Stake data binding
			$scope.stake.selected = 1;
			$scope.stake.values = [2, 1, 0.50, 0.20];
			prepSel($scope.pool);
			$scope.dataOut = {"poolId": poolId, "numberOfLines": 0, "selections": []};
			console.log("Selected Pool ID=" + poolId + ": ", $scope.pool);
			toast("Pool ID=" + poolId + " selected");
		});

		function prepSel(pool) {	//Prepare selections in pool to receive "leg.id---selection.id" info for ng-model
			pool.legs.forEach(function (e1) {
				e1.selections.forEach(function (e2) {
					e2.legIdSelId = e1.id + "---" + e2.id;
				});
			});
		}	
	}
	
	$scope.getSelections = function (leg, selection) {	//Get selected selections
		console.log("Leg ID=" + leg.id + " and Selection ID=" + selection.id + ": ", selection);
	}

	$scope.numberOfLines = function () {	//Calculate number of lines
		var data = $scope.dataOut;
		data.selections = $scope.sel.selected;
		data.selections.summary = getNumberOfSelectionsPerLeg(data.selections);
		data.numberOfLines = calcNumberOfLines(data.selections.summary, data.selections.length);
		return data.numberOfLines;

		function getNumberOfSelectionsPerLeg(arr) {	//Get number of selections per leg
			var legs = [];
			arr.map(function (e, index) {	//Get all legs together
				legs.push(e.split("---")[0]);
			});

			var summary = legs.reduce( function (prev, item) { //Get the number of leg occurences
			  	if (item in prev) {
					prev[item] ++;
				} else {
			  		prev[item] = 1;
				} 
			  	return prev; 
				}, {} );
			return summary;
		}

		function calcNumberOfLines(obj, totalSelections) {	//Calculate number of lines
			var numOfLines;
			var i = 0;
			Object.keys(obj).forEach(function(key,index) {	//looping through unique legs
				if (obj[key] >= 2) {
					i += 1;
				}
			});
			if (i >= 2) {
				numOfLines = 4;
			} else if (i === 1) {
				numOfLines = 2;
			} else if ((i === 0) && (totalSelections >= 1)) {
				numOfLines = 1;
			} else {
				numOfLines = 0;
			}
			return numOfLines;
		}
	}

	$scope.getStake = function (value) {	//Get selected selections
		console.log("Stake=" + value);
		$scope.dataOut.stake = value;
		$scope.dataOut.cost = $scope.dataOut.stake * $scope.dataOut.numberOfLines;
	}

	$scope.placeBet = function () {	//Place a bet
		if ($scope.dataOut.selections.length > 0) {
			console.log("You have selected: " + $scope.dataOut.selections + " in the pool: " + $scope.dataOut.poolId, $scope.dataOut);
			$scope.dataOut.stake = $scope.stake.selected;
			$scope.dataOut.cost = $scope.dataOut.stake * $scope.dataOut.numberOfLines;
			//toast($scope.sel.selected);

			postObj($scope.dataOut);

			function postObj(dataObj) {
				var data = JSON.stringify(dataObj);
				$http({
					url: 'tickets.json',
					method: "POST",
					data: data
				})
				.then(function(response) {
				    // success
					console.log("Tickets posted to server with success", data);
					alert("Tickets posted to server with success: " + data);
				}, 
				function(response) { // optional
				   	// failed
					console.log("Failure in posting the data to the server");
					alert("Failure in posting the data to the server");
				});
			}
		} else {
			toast("Please make your selection");
		}
	}

	function toast(text) {	//Create toast on the top-right hand corner
		$mdToast.show(
			$mdToast.simple()
			.content(text)
			.position("top right")
			.hideDelay(3000)
		);
	}
});

