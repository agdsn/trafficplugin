var usedTraffic = null;

var dormitories = {
	"HSS": {
		"dormitoryHome": "http://wh12.tu-dresden.de",
		"dormitoryTrafficSite": "http://wh12.tu-dresden.de/traffic-o-meter.html",
		"dormitoryTraffic": "https://wh12.tu-dresden.de/tom.addon2.php"
		},
		
	"WU": {
		"dormitoryHome": "http://www.wh2.tu-dresden.de",
		"dormitoryTrafficSite": "http://www.wh2.tu-dresden.de/de/usertraffic",
		"dormitoryTraffic": "http://www.wh2.tu-dresden.de/traffic/getMyTraffic.php"
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
		
		$.get(dormitory.dormitoryTraffic, function(result){
			var value = parseFloat(result);
			if(typeof value === 'number' && value >= 0){
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
	chrome.browserAction.setIcon({path:"icon/hide.png"});
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
	
	$.getJSON(dormitories[dorm].dormitoryTraffic, function(value){
		var value = parseFloat(value);
		if(typeof value === 'number' && value >= 0){
			var name = Math.round((32.0/100) * (value < 100 ? value : 100));
			chrome.browserAction.setIcon({path:"icon/" + name + ".png"});
			usedTraffic = value;
		} else {
			clearState();
			updateTraffic();
		}
	}).fail(function(){
		clearState();
		updateTraffic();
	});
}

chrome.browserAction.setBadgeBackgroundColor({color: [1, 1, 1, 1]});
updateTraffic();
chrome.alarms.onAlarm.addListener(updateTraffic);
chrome.alarms.create("updateTraffic", {periodInMinutes: 2});
