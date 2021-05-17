var paramKlasse = "3AHWII";
var paramSchule = "HTL-Neufelden";
var paramDomain = "hypate";
var currenturl = window.location.href;
var initDone = false;
var isPause = false;
var timetable = "";
var pauseEnd = 0;

function Init(){
    if(currenturl.includes('?')){
        var params = currenturl.split('?');
        for(var i = 1; i < params.length; i++){
            var name = params[i].split('=')[0].toLowerCase();
            var value = params[i].split('=')[1];
            if(name == "klasse"){
                paramKlasse = value.toUpperCase();
            }
            else if(name = "schule"){
                paramSchule = value;
            }
            else if(name = "domain"){
                paramDomain = value.toLowerCase();
            }
        }
        
    }
    UpdateTime();
    UpdateTimeTable();
}

function UpdateTime(){
    sleep(10).then(function(){
        data = GetDateTime();
        
        document.getElementById('TimeDisplay').innerHTML = data[0];
        document.getElementById('DateDisplay').innerHTML = data[1];
        document.getElementById('WeekDisplay').innerHTML = data[2];
        document.getElementById('InfoDisplay').innerHTML = paramSchule + " - " + paramKlasse;
        UpdateTime();
    });
}

function UpdateTimeTable(){
    sleep(900).then(function(){
        try{
            if(document.getElementById('TimeDisplay').innerHTML.split(':')[2] == "00</b>" || initDone == false){
                var serverResponse = GetTimeTable();
                if(serverResponse.includes('§')){
                    isPause = true;
                    timetable = serverResponse.split('§')[0];
                    pauseEnd = serverResponse.split('§')[1];
                }
                else{
                    timetable = serverResponse;
                    isPause = false;
                }
            }
    
            var timetableFull = timetable;
    
            if(isPause){
                var today = new Date();
    
                var timeleft = "0:00";
    
                var timenow = Number(today.getHours())*60*60 + Number(today.getMinutes()) * 60 + Number(today.getSeconds());
    
                var secleft = pauseEnd - timenow;
    
                var minleft = parseInt(secleft / 60);
                var secleft = secleft - (minleft * 60);
    
                if (secleft < 10) {
                    secleft = "0" + secleft;
                }
    
                if (minleft < 10) {
                    minleft = "0" + minleft;
                }
                timeleft = minleft + ":" + secleft;
                breaktext = ("<b><b>jetzt ist Pause: </b></b>" + timeleft);
                timetableFull = timetable + breaktext;
            }
    
            document.getElementById('ClassDisplay').innerHTML = timetableFull;
    
            initDone = true;
        }
        catch(err){
            console.log("oopsie-woopsie, the server made a fucky-wucky >.<");
        }
        
        UpdateTimeTable();
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function GetTimeTable()
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", (currenturl.split('?')[0] + "currentData?klasse="+paramKlasse+"?schule="+paramSchule+"?domain="+paramDomain), false ); // false for synchronous request
    xmlHttp.send();
    return xmlHttp.responseText;
}

const dayNames = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

function GetDateTime() {

    var today = new Date();
    var date = dayNames[today.getDay()] + " " + today.getDate() + ". " + monthNames[today.getMonth()] + " " + today.getFullYear();
    var week = "KW " + getWeekNumber(new Date())[1];
    var time = "<b>" + ("0" + today.getHours()).slice(-2) + ":" + ("0" + today.getMinutes()).slice(-2) + ":" + ("0" + today.getSeconds()).slice(-2) + "</b>";

    return [time, date, week];
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return [d.getUTCFullYear(), weekNo];
}