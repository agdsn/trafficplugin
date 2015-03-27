var usedTraffic = null,
	trafficVolumePerDay = 3 * 1024,
	trafficVolume = trafficVolumePerDay * 7;

var dormitories = {
	"HSS": {
		"dormitoryHome": "http://wh12.tu-dresden.de",
		"dormitoryTrafficSite": "http://wh12.tu-dresden.de/traffic-o-meter.html",
		"dormitoryTraffic": "http://wh12.tu-dresden.de/tom.addon2.php"
		},
		
	"WU": {
		"dormitoryHome": "http://www.wh2.tu-dresden.de",
		"dormitoryTrafficSite": "http://www.wh2.tu-dresden.de/de/usertraffic",
		"dormitoryTraffic": "http://www.wh2.tu-dresden.de/traffic/getMyTrafficTest.php"
	},
	
	"ZEU": {
		"dormitoryHome": "http://zeus.wh25.tu-dresden.de",
		"dormitoryTrafficSite": "http://zeus.wh25.tu-dresden.de/zeuser/agdsnISAPI.php?site=traffic",
		"dormitoryTraffic": "http://zeus.wh25.tu-dresden.de/traffic.php"
	},
	
	"BOR": {
		"dormitoryHome": "http://wh10.tu-dresden.de",
		"dormitoryTrafficSite": "http://www.wh10.tu-dresden.de/index.php/traffic.html",
		"dormitoryTraffic": "http://wh10.tu-dresden.de/phpskripte/getMyTraffic.php"
	},
	
	"GER": {
		"dormitoryHome": "http://www.wh17.tu-dresden.de/",
		"dormitoryTrafficSite": "http://www.wh17.tu-dresden.de/traffic/uebersicht",
		"dormitoryTraffic": "http://www.wh17.tu-dresden.de/traffic/prozent"
	}
};

/** Finds the dormitory this computer is in and updates the localStorage. 
 * 
 * @param cb - Callback that is called with the dormitory's acronym on success. */
function updateDormitory(cb){
	var done = 0;
	var works = null;
	
	$.each(dormitories, function(key, dormitory){
		/* Try to get traffic status from each dormitory - if server responds with a valid value,
		we can assume that we belong to its network */
		
		$.getJSON(dormitory.dormitoryTraffic, function(result){
			var version = parseInt(result.version, 10);
			if(version == 2){
				if(works) throw "Multiple dormitories reported a valid traffic status. Can only belong to one network!";
			
				works = key;
				localStorage["dormitory"] = key;
			}
		}).always(function(){
			done++;
			
			// Check if all servers have been asked
			if(done === Object.keys(dormitories).length){
				if(works){
					cb(null, works);
				} else {
					clearState();
					cb(chrome.i18n.getMessage("nothing"));
				}
			}
		});
	});
}

/** Resets all modified values to their defaults. */
function clearState() {
	chrome.browserAction.setIcon({path:"icon/inactive.png"});
	localStorage["dormitory"] = "";
	usedTraffic = null;
}

/** Requests the current traffic usage and updates the icon. */
function updateTraffic(){
	var dorm = localStorage["dormitory"];
	
	if(!dorm){
		updateDormitory(function(err){
			if(!err){
				updateTraffic();
			} else {
				clearState();
			}
		});
		return;
	}
	
	$.getJSON(dormitories[dorm].dormitoryTraffic, function(data){
		var quota = parseFloat(data.quota);
		var proc = Math.round(quota / trafficVolume * 100);
		if(proc > 100) proc = 100;
		var name = proc - (proc % 5);
		var ind = parseFloat(data.traffic["in"]);
		var outd = parseFloat(data.traffic["out"]);
		
		chrome.browserAction.setIcon({path: "icon/" + name + ".png"});
		
		usedTraffic = data;
	}).fail(function(){
		clearState();
		updateTraffic();
	});
}

chrome.browserAction.setBadgeBackgroundColor({color: [1, 1, 1, 1]});
updateTraffic();
chrome.alarms.onAlarm.addListener(updateTraffic);
chrome.alarms.create("updateTraffic", {periodInMinutes: 2});
