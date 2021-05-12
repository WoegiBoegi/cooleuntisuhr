var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var jquery = require('jquery');

var app = express();

var timetableFull = "timetable not yet obtained";
var klasseName = "";

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
    //res.setHeader('Content-Type', 'text/html');
    //res.writeHead(200, { 'Content-Type': 'text/plain' });
    //res.end("fuck");
    //res.end(GetTimeTable(req.url.split('=')[1]));
    //var timetable = GetTimeTable();
    //console.log(timetable);
    klasseName = req.url.split('=')[1];
    res.send(timetableFull);
    //res.send("oasch");
    //next();
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

SetTimeTable()

//
//
//
//
//

function SetTimeTable(){
    sleep(900).then(function(){
    const WebUntisLib = require('webuntis');
    const untis = new WebUntisLib.WebUntisAnonymousAuth('HTL-Neufelden', 'hypate.webuntis.com');
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
            
            timetable.sort(function(a, b) {
                var keyA = a.startTime,
                  keyB = b.startTime;
                if (keyA < keyB) return -1;
                if (keyA > keyB) return 1;
                return 0;
              });
              
            for(var i = 0; i < timetable.length-1; i++){
                if(timetable[i].startTime == timetable[i+1].startTime){
                    timetable.splice(i+1,1);
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
            for(var i = 0; i < timetable.length; i++){
                if(now >= timetable[i].startTime && now <= timetable[i].endTime){
                    timetableOutput += ("<b><b>" + LessonName(timetable[i]) + " - bis " + timetable[i].endTime.toString().slice(0, -2) + ":" + timetable[i].endTime.toString().slice(-2) + "</b></b>" + "<br/>");
                    isCurrentLesson = true;
                }
                else{
                    timetableOutput += (LessonName(timetable[i]) + "<br/>");
                }
            }
            if(isCurrentLesson == false){
                var breaktext = "";
                for(var i = 0; i < timetable.length-1; i++){
                    if(now >= timetable[i].endTime && now <= timetable[i+1].startTime){
                        var timeleft = "0:00";
                        var nowHours = now.toString().slice(0, -2);
                        var nowMinutes = now.toString().slice(-2);
                        var thenHours = timetable[i+1].startTime.toString().slice(0, -2);
                        var thenMinutes = timetable[i+1].startTime.toString().slice(-2);
                        var timenow = Number(nowHours)*60*60 + Number(nowMinutes) * 60 + Number(today.getSeconds());
                        var timethen = Number(thenHours)*60*60 + Number(thenMinutes) * 60;
                        var secleft = timethen - timenow;

                        var minleft = parseInt(secleft / 60);
                        var secleft = secleft - (minleft * 60);

                        if (secleft < 10) {
                            secleft = "0" + secleft;
                        }

                        if (minleft < 10) {
                            minleft = "0" + minleft;
                        }
                        timeleft = minleft + ":" + secleft;
                        breaktext = ("<br/> <b><b>jetzt ist Pause: </b></b>" + timeleft);
                        break;
                    }
                }
                if(now >= timetable[timetable.length-1].endTime){
                    breaktext = "<br/> <b><b>bis bald!</b></b>";
                }
                else if (now <= timetable[0].startTime){
                    breaktext = "<br/> <b><b>guten morgen!</b></b>";
                }
                timetableOutput += breaktext;
            }

            timetableFull = timetableOutput;
        });
        SetTimeTable();
    });
    
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function LessonName(lesson){
    var name = JSON.stringify(lesson.su).split(':')[3].split(',')[0];
    return name.replace("]", "").replace("}", "").replace('"', '').replace('"', '');
}

function PfuschUntis(Stundenplan) {

        var today = new Date();
        var y = today.getDay() + 1;

        var x = 15;
        for (var i = 0; i < 16; i++) {
            var time = Stundenplan[i][0].split(':');
            time[0] = parseInt(time[0]);
            time[1] = parseInt(time[1]);
            if ((time[0] * 60 + time[1]) > (today.getHours() * 60 + today.getMinutes())) {
                x = i - 1;
                break;
            }
        }

        var StundenHeute = "";
        for (var i = 0; i < 16; i++) {
            var Stunde = Stundenplan[i][y];
            if (Stunde != "5 min Pause") {
                if (i == x) {
                    if (i < 15) {
                        StundenHeute += ("<b><b>" + Stundenplan[i][y] + " - bis " + Stundenplan[x + 1][0] + "</b></b>" + "<br/>");
                    }
                    else {
                        StundenHeute += ("<b><b>" + Stundenplan[i][y] + "</b></b>" + "<br/>");
                    }
                }
                else {
                    StundenHeute += (Stundenplan[i][y] + "<br/>");
                }
            }

        }

        if (Stundenplan[x][y] == "5 min Pause" || Stundenplan[x][y] == "Mittagspause") {

            var secend = (parseInt(Stundenplan[x+1][0].split(':')[0]) * 60 * 60 )+ (parseInt(Stundenplan[x+1][0].split(':')[1]) * 60);
            var secnow = (parseInt(today.getHours()) * 60 * 60) + (parseInt(today.getMinutes()) * 60) + parseInt(today.getSeconds());
            var secleft = secend - secnow;

            var minleft = parseInt(secleft / 60);
            var secleft = secleft - (minleft * 60);

            if (secleft < 10) {
                secleft = "0" + secleft;
            }

            if (minleft < 10) {
                minleft = "0" + minleft;
            }

            var timeleft = minleft + ":" + secleft;


            StundenHeute += ("<br/> <b><b>jetzt ist Pause: </b></b>" + timeleft);
        }
        return StundenHeute
}