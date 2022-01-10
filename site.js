var paramKlasse = "4AHWII";
var paramSchule = "HTL-Neufelden";
var paramDomain = "hypate";
var currenturl = window.location.href;
var initDone = false;
var timetable = [];
var countdownlimit = 0;
var timetableDisplayText = "";

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
    UpdateTimeTableInit();
}

function UpdateTime(){
    sleep(100).then(function(){
        data = GetDateTime();
        
        document.getElementById('TimeDisplay').innerHTML = data[0];
        document.getElementById('DateDisplay').innerHTML = data[1];
        document.getElementById('WeekDisplay').innerHTML = data[2];
        document.getElementById('InfoDisplay').innerHTML = paramSchule + " - " + paramKlasse;

        if(timetable.length > 1){
            
            var timetableOutput = "";
            var isCurrentLesson = false;
            var isPause = false;
            var now = GetNow()
            for(var i = 0; i < timetable.length; i++){
                var lessonName = timetable[i].name.toString();
                if(now >= timetable[i].startTime && now < timetable[i].endTime){
                    if(lessonName.includes("%C")){
                        timetableOutput += "<b><b><span class=\"strikeout\">" + lessonName.replace("%I","").replace("%C","") + "</span> - bis " + timetable[i].endTime.toString().slice(0, -2) + ":" + timetable[i].endTime.toString().slice(-2) + "</b></b>" + "<br/>";
                    }
                    else if (lessonName.includes("%I")){
                        timetableOutput += "<b><b><span class=\"colored\">" + lessonName.replace("%I","").replace("%C","") + " - bis " + timetable[i].endTime.toString().slice(0, -2) + ":" + timetable[i].endTime.toString().slice(-2) + "</b></b></span>" + "<br/>";
                    }
                    else{
                        //determine if there are only cancelled lessons from here on out
                        if (lessonName == "Pause"){
                            var allCancelled = true;
                            for(var n = i+1; n < timetable.length; n++){
                                if(!timetable[n].name.toString().includes("%C"))
                                allCancelled = false;
                            }
                            if(allCancelled)
                                timetableOutput += "<b><b><span class=\"strikeout\">" + lessonName.replace("%I","").replace("%C","") + "</span> - bis " + timetable[i].endTime.toString().slice(0, -2) + ":" + timetable[i].endTime.toString().slice(-2) + "</b></b>" + "<br/>";
                            else
                            timetableOutput += "<b><b>" + lessonName.replace("%I","").replace("%C","") + " - bis " + timetable[i].endTime.toString().slice(0, -2) + ":" + timetable[i].endTime.toString().slice(-2) + "</b></b>" + "<br/>";
                        }
                        else
                            timetableOutput += "<b><b>" + lessonName.replace("%I","").replace("%C","") + " - bis " + timetable[i].endTime.toString().slice(0, -2) + ":" + timetable[i].endTime.toString().slice(-2) + "</b></b>" + "<br/>";
                    }
                    isCurrentLesson = true;
                    if(lessonName == "Pause"){
                        isPause = true;
                        isCurrentLesson = false;
                    }
                    
                }
                else if(i < timetable.length-1 && now >= timetable[i].endTime && now < timetable[i+1].startTime){
                    if(lessonName.includes("%I")){
                        lessonName = lessonName.replace("%I","");
                        lessonName = "<b class=\"colored\">" + lessonName + "</b>";
                    }
                    else if (lessonName.includes("%C")){
                        lessonName = lessonName.replace("%C","");
                        lessonName = "<span class=\"strikeout\">" + lessonName + "</span>";
                    }
                    else if (lessonName == "Pause"){
                        var allCancelled = true;
                        for(var n = i+1; n < timetable.length; n++){
                            if(!timetable[n].name.toString().includes("%C"))
                            allCancelled = false;
                        }
                        if(allCancelled)
                            lessonName = "<span class=\"strikeout\">" + lessonName + "</span>";
                    }
                    timetableOutput += (lessonName + "<br/>" + "<hr>");
                }
                else{
                    if(lessonName.includes("%I")){
                        lessonName = lessonName.replace("%I","");
                        lessonName = "<span class=\"colored\">" + lessonName + "</span>";
                    }
                    else if (lessonName.includes("%C")){
                        lessonName = lessonName.replace("%C","");
                        lessonName = "<span class=\"strikeout\">" + lessonName + "</span>";
                    }
                    else if (lessonName == "Pause"){
                        var allCancelled = true;
                        for(var n = i+1; n < timetable.length; n++){
                            if(!timetable[n].name.toString().includes("%C"))
                            allCancelled = false;
                        }
                        if(allCancelled)
                            lessonName = "<span class=\"strikeout\">" + lessonName + "</span>";
                    }
                    timetableOutput += (lessonName + "<br/>");
                }
            }
            
            
            if(isCurrentLesson == false){
                var breaktext = "";
                for(var i = 1; i < timetable.length-1; i++){
                    if(isPause == true){
                        if(now >= timetable[i-1].endTime && now < timetable[i+1].startTime){
                        
                            var thenHours = timetable[i+1].startTime.toString().slice(0, -2);
                            var thenMinutes = timetable[i+1].startTime.toString().slice(-2);
                            
                            var timethen = Number(thenHours)*60*60 + Number(thenMinutes) * 60;
            
                            countdownlimit = timethen;
                            
                            break;
                        }
                    }
                    else{
                        if(now >= timetable[i].endTime && now <= timetable[i+1].startTime){
                        
                            var thenHours = timetable[i+1].startTime.toString().slice(0, -2);
                            var thenMinutes = timetable[i+1].startTime.toString().slice(-2);
                        
                            var timethen = Number(thenHours)*60*60 + Number(thenMinutes) * 60;
                        
                            countdownlimit = timethen;
                        
                            break;
                        }
                    }
                }
                if(now >= timetable[timetable.length-1].endTime){
                    breaktext = "<b><b>bis bald!</b></b>";
                }
                else if (now <= timetable[0].startTime){
                    breaktext = "<b><b>guten morgen!</b></b>";
                }
                timetableOutput += breaktext;
            }

            timetableDisplayText = timetableOutput;

            var ttd = timetableDisplayText;

            if(countdownlimit > 0){
                var today = new Date();

                var timeleft = "0:00";

                var timenow = Number(today.getHours())*60*60 + Number(today.getMinutes()) * 60 + Number(today.getSeconds());

                var secleft = countdownlimit - timenow;

                if(secleft != 0){
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
                    ttd += breaktext;
                }
                else{
                    countdownlimit = 0;
                }
                
            }
            document.getElementById('ClassDisplay').innerHTML = ttd;
        }
        UpdateTime();
    });
}

function UpdateTimeTableInit(){
    var serverResponse = GetTimeTable();
    var timetableText = serverResponse.split('|');
    var timetableNew = [];

    for(var i = 0; i < timetableText.length; i++){
        var lessondata = timetableText[i].split(';');
        var lessonName = lessondata[0];
        var lessonStart = lessondata[1];
        var lessonEnd = lessondata[2];

        var lesson = new Object();
        lesson.name = lessonName;
        lesson.startTime = lessonStart;
        lesson.endTime = lessonEnd;
        timetableNew.push(lesson);
    }
    timetable = timetableNew;
    UpdateTimeTable();
}

function UpdateTimeTable(){
    sleep(3600000).then(function(){
        var serverResponse = GetTimeTable();
        var timetableText = serverResponse.split('|');
        var timetableNew = [];
    
        for(var i = 0; i < timetableText.length; i++){
            var lessondata = timetableText[i].split(';');
            var lessonName = lessondata[0];
            var lessonStart = lessondata[1];
            var lessonEnd = lessondata[2];
    
            var lesson = new Object();
            lesson.name = lessonName;
            lesson.startTime = lessonStart;
            lesson.endTime = lessonEnd;
            timetableNew.push(lesson);
        }
        timetable = timetableNew;
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
const monthNames = ["Jänner", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

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

function GetNow(){
    var today = new Date();
    var minutes = today.getMinutes();
    if(minutes < 10){
        minutes = "0" + minutes.toString();
    }
    return Number((today.getHours().toString() + minutes.toString())); 
}
