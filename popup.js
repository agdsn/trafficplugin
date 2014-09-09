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
	$("#dormitory_homepage").text(chrome.i18n.getMessage("dormitory_homepage"));
	$("#my_traffic").text(chrome.i18n.getMessage("my_traffic"));
}

function updateTraffic() {
	if (bgp.globalTraffic == -1) {
		$("#traffic, #traffic_remaining").empty();
		return;
	}
	var remaining = Math.floor((bgp.trafficVolume - bgp.trafficVolume * (bgp.usedTraffic / 100)));
	if(remaining < 0 || isNaN(remaining)) remaining = 0;
	
	$("#traffic").text(bgp.usedTraffic.toFixed(2) + " %");
	$("#traffic_remaining").text(remaining + " MB " + chrome.i18n.getMessage("remaining"));
}


$(function(){
	chrome.runtime.getBackgroundPage(function(bgPage){
		bgp = bgPage;
		
		internationalisation();
		updateTraffic();
		
		$("#dormitory_homepage").click(openDormitoryHome);
		$("#my_traffic").click(openTrafficSite);
	});
});
