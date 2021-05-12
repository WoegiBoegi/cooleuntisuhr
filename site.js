var paramKlasse = "3AHWII";
var paramSchule = "HTL-Neufelden";
var paramDomain = "hypate";
var currenturl = window.location.href;

function Init(){
    if(currenturl.includes('?')){
        var params = currenturl.split('?');
        for(var i = 1; i < params.length; i++){
            var name = params[i].split('=')[0].toLowerCase();
            var value = params[i].split('=')[1];
            if(name == "klasse"){
                paramKlasse = value;
            }
            else if(name = "schule"){
                paramSchule = value;
            }
            else if(name = "domain"){
                paramDomain = value;
            }
        }
        
    }
    else{
        
    }
    UpdateTime();
    UpdateTimeTable();
}

function UpdateTime(){
    sleep(100).then(function(){
        data = GetDateTime();
        
        document.getElementById('TimeDisplay').innerHTML = data[0];
        document.getElementById('DateDisplay').innerHTML = data[1];
        document.getElementById('WeekDisplay').innerHTML = data[2];
        document.getElementById('InfoDisplay').innerHTML = paramSchule + " - " + paramKlasse;
        UpdateTime();
    });
}

function UpdateTimeTable(){
    sleep(700).then(function(){
        document.getElementById('ClassDisplay').innerHTML = GetTimeTable();
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