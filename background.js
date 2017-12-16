var usedTraffic = null,
	quotaPerDay = 3 * 1024 * 1024,
	maxQuota = quotaPerDay * 21;

/** Resets all modified values to their defaults. */
function clearState() {
	chrome.browserAction.setIcon({path:"icon/inactive.png"});
	usedTraffic = null;
}

/** Requests the current traffic usage and updates the icon. */
function updateTraffic(){
	$.getJSON("https://agdsn.de/sipa/usertraffic/json", function(data){
		if(!data["version"]){
			clearState();
			return;
		}
		var quota = parseFloat(data.quota);
		var proc = Math.round(quota / maxQuota * 100);
		if(proc > 100) proc = 100;
		var name = proc - (proc % 5);

		chrome.browserAction.setIcon({path: "icon/" + name + ".png"});

		usedTraffic = data;
	}).fail(function(){
		clearState();
	});
}

chrome.browserAction.setBadgeBackgroundColor({color: [1, 1, 1, 1]});
updateTraffic();
chrome.alarms.onAlarm.addListener(updateTraffic);
chrome.alarms.create("updateTraffic", {periodInMinutes: 2});
