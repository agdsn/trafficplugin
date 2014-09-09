var bgp = null;

function openDormitoryHome() {
	var dormitoryHomeURL = bgp.dormitories[localStorage["dormitory"]]["dormitoryHome"];
	if (!dormitoryHomeURL) {
		return;
	}
	chrome.tabs.create({'url':dormitoryHomeURL});
	window.close();
}

function openTrafficSite() {
	var trafficSiteURL = bgp.dormitories[localStorage["dormitory"]]["dormitoryTrafficSite"];
	if (!trafficSiteURL) {
		return;
	}
	chrome.tabs.create({'url':trafficSiteURL});
	window.close();
}

function internationalisation() {
	document.getElementById("dormitory_homepage").innerHTML = chrome.i18n.getMessage("dormitory_homepage");
	document.getElementById("my_traffic").innerHTML = chrome.i18n.getMessage("my_traffic");
}

function updateTraffic() {
	if (bgp.globalTraffic == -1) {
		document.getElementById("traffic").innerHTML = "";
		document.getElementById("traffic_remaining").innerHTML = "";
		return;
	}
	var remaining = Math.floor((bgp.trafficVolume - bgp.trafficVolume * (bgp.usedTraffic / 100)));
	if(remaining < 0 || isNaN(remaining)) remaining = 0;
	
	document.getElementById("traffic").innerHTML = bgp.usedTraffic.toFixed(2) + " %";
	document.getElementById("traffic_remaining").innerHTML = remaining + " MB " + chrome.i18n.getMessage("remaining");
}


$(function(){
	chrome.runtime.getBackgroundPage(function(bgPage){
		bgp = bgPage;
		internationalisation();
		updateTraffic();
	});
});
