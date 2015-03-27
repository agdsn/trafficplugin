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
	if (!bgp.usedTraffic) {
		$("#traffic_k").hide();
		$("#traffic_err").show();
		$("#traffic").text(chrome.i18n.getMessage("error"));
		return;
	}
	$("#traffic_k").show();
	$("#traffic_err").hide();
	
	var quota = parseFloat(bgp.usedTraffic.quota);
	$("#traffic").text(chrome.i18n.getMessage("remaining") + " " + (quota / 1024).toFixed(2) + " GB");
	
	var ind = parseFloat(bgp.usedTraffic.traffic["in"]);
	var outd = parseFloat(bgp.usedTraffic.traffic["out"]);
	$("#traffic_k").text(chrome.i18n.getMessage("today") + " " +  (ind / 1024 + outd / 1024).toFixed(2) + " GB / " + (bgp.trafficVolumePerDay / 1024).toFixed(2) + " GB " + chrome.i18n.getMessage("used"));
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
