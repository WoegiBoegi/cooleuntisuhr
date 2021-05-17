var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

//var timetableFull = "timetable not yet obtained";
//var klasseName = "3AHWII";
//var schuleName = "HTL-Neufelden";
//var domainName = "hypate";

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }))

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.get('/currentData', function(req, res, next){
    try{
        var klasseName = req.url.split('=')[1].split('?')[0];
        var schuleName = req.url.split('=')[2].split('?')[0];
        var domainName = req.url.split('=')[3].split('?')[0];
    
        GetTimeTable(klasseName, schuleName, domainName, res, function sendResponse(timetable, res){
            res.send(timetable);
        });
    }
    catch(err){
        console.log("uh.oh");
        //res.send();
    }
});



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

//
//
//
//
//

function GetTimeTable(klasseName, schuleName, domainName, res, callback){
    const WebUntisLib = require('webuntis');
    const untis = new WebUntisLib.WebUntisAnonymousAuth(schuleName, domainName+'.webuntis.com');
    untis
        .login()
        .then(() => {
            return untis.getClasses();
        })
        .then((classes) => {
            var n = 0;
            var classID = 0;
            classes.forEach(klasse =>{
            if(klasse.longName == klasseName){
                classID = n;
            }
            n = n + 1;
            });
            return untis.getTimetableForToday(classes[classID].id, WebUntisLib.TYPES.CLASS);
        })
        .then((timetable) => {
            
            if(timetable.length == 0){
                callback("frei!", res);
                return;
            }

            timetable.sort(function(a, b) {
                var keyA = a.startTime,
                  keyB = b.startTime;
                if (keyA < keyB) return -1;
                if (keyA > keyB) return 1;
                return 0;
              });
              
            for(var i = 0; i < timetable.length-1; i++){
                if(timetable[i].startTime == timetable[i+1].startTime || timetable[i].endTime == timetable[i+1].endTime){
                    timetable.splice(i+1,1);
                    i = -1;
                }
                else{
                    var nextHours = Number(timetable[i+1].startTime.toString().slice(0, -2));
                    var nextMinutes = Number(timetable[i+1].startTime.toString().slice(-2));
                    var nextStart = nextHours * 60 + nextMinutes;
    
                    var currentHours = Number(timetable[i].endTime.toString().slice(0, -2));
                    var currentMinutes = Number(timetable[i].endTime.toString().slice(-2));
                    var currentEnd = currentHours * 60 + currentMinutes;
    
                    var minDiff = nextStart - currentEnd;
                    if(minDiff >= 50){
                        var mittagspause = new Object();
                        mittagspause.startTime = timetable[i].endTime;
                        mittagspause.endTime = timetable[i+1].startTime;
                        var pauseData = new Object();
                        pauseData.id = 0;
                        pauseData.name = "Pause";
                        pauseData.longName = "Pause";
                        mittagspause.su = pauseData;
                        timetable.splice(i+1,0,mittagspause);
                        i = -1;
                    }
                }
            }

            var today = new Date();
            var minutes = today.getMinutes();
            if(minutes < 10){
                minutes = "0" + minutes.toString();
            }
            var now = ((Number(today.getHours())+2).toString() + minutes);

            var timetableOutput = "";
            var isCurrentLesson = false;
            var isPause = false;
            for(var i = 0; i < timetable.length; i++){
                if(now >= timetable[i].startTime && now < timetable[i].endTime){
                    timetableOutput += ("<b><b>" + LessonName(timetable[i]) + " - bis " + timetable[i].endTime.toString().slice(0, -2) + ":" + timetable[i].endTime.toString().slice(-2) + "</b></b>" + "<br/>");
                    isCurrentLesson = true;
                    if(LessonName(timetable[i]) == "Pause"){
                        isPause = true;
                    }
                }
                else{
                    timetableOutput += (LessonName(timetable[i]) + "<br/>");
                }
            }
            if(isCurrentLesson == false){
                var breaktext = "";
                for(var i = 0; i < timetable.length-1; i++){
                    if(isPause){
                        if(now >= timetable[i-1].endTime && now <= timetable[i+1].startTime){
                        
                            var thenHours = timetable[i+1].startTime.toString().slice(0, -2);
                            var thenMinutes = timetable[i+1].startTime.toString().slice(-2);
                            
                            var timethen = Number(thenHours)*60*60 + Number(thenMinutes) * 60;
                            
                            breaktext = ("§"+timethen);
                            
                            break;
                        }
                    }
                    else{
                        if(now >= timetable[i].endTime && now <= timetable[i+1].startTime){
                        
                            var thenHours = timetable[i+1].startTime.toString().slice(0, -2);
                            var thenMinutes = timetable[i+1].startTime.toString().slice(-2);
                        
                            var timethen = Number(thenHours)*60*60 + Number(thenMinutes) * 60;
                        
                            breaktext = ("§"+timethen);
                        
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

            callback(timetableOutput, res);
        });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function LessonName(lesson){
    var name = JSON.stringify(lesson.su).split(':')[2].split(',')[0];
    return name.replace("]", "").replace("}", "").replace('"', '').replace('"', '');
}