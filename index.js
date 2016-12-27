const fs = require('fs');
const twitter = require('twitter');
const tweets = require('./testPhrases.json');
const moment = require('moment-timezone');
const http = require('http');

let conf = require('./config.json'); //change config0.json and fill in your data
const timeZone = conf.timeZone;
const sunRiseSetTime = "00:00";

let date = "today";
let path = "/json?lat="+conf.lat+"&lng="+conf.lng+"&date="+date+"&formatted=0";

let sunInfoOpt = {
  host: "api.sunrise-sunset.org",
  path: path
};

let lastTweetedTime = "";
let tweetText = "";
let owner = "@NerveClasp"; // for emergency notification of you, the owner :)

//firebase
const firebase = require('firebase/app');
const admin = require('firebase-admin');
require('firebase/auth');
require('firebase/database-node');

//Uncomment to initialize
firebase.initializeApp(conf.configFirebase);
admin.initializeApp({
  credential: admin.credential.cert(conf.admin),
  databaseURL: "https://perfect-time-to.firebaseio.com" // change the path here
})

//db
let db = admin.database();
let ref = db.ref("perfect/tweets/manual"); // change to the prefered path in your Firebase database
let refPile = db.ref("queue/pile");
let refDone = db.ref("done/tweets");
let refStaged = db.ref("staged/tweets");

var client = new twitter({
  consumer_key: conf.config.consumerKey,
  consumer_secret: conf.config.consumerSecret,
  access_token_key: conf.config.accessToken,
  access_token_secret: conf.config.accessTokenSecret
});

console.log("Initialization successfull. Waiting for the perfect time.. :) ");
setInterval(function () { // first the interval is passed, then the code is being executed
  let time = moment().tz(timeZone).format('HH:mm'); // getting the system time
  if (time == sunRiseSetTime && time != lastTweetedTime) { //posting the daily sun statistics
    http.request(sunInfoOpt, function(response) {
      let str = '';
      response.on('data', function(chunk) {
        str += chunk;
      })
      response.on('end', function() {
        let res = JSON.parse(str);
        /*
        {"results":{"sunrise":"6:01:28 AM","sunset":"2:12:38 PM",
        "solar_noon":"10:07:03 AM","day_length":"08:11:10",
        "civil_twilight_begin":"5:23:29 AM",
        "civil_twilight_end":"2:50:36 PM",
        "nautical_twilight_begin":"4:42:12 AM",
        "nautical_twilight_end":"3:31:54 PM",
        "astronomical_twilight_begin":"4:02:55 AM",
        "astronomical_twilight_end":"4:11:11 PM"},"status":"OK"}
        */
        // зустріти схід і захід сонця! DD.MM.YYYY 🌅 - HH:mm:ss AM 😎 - HH:mm:ss AM 🌆 - HH:mm:ss PM Тривалість сонячного дня - HH:mm:ss HH:mm
        if (res.status == "OK") {
          tweetText = "зустріти схід і захід сонця!\n";
          tweetText += moment().tz(timeZone).format("DD.MM.YYYY")+"\n🌅 - "+dateToMoment(res.results.sunrise);
          tweetText += "\n😎 - "+dateToMoment(res.results.solar_noon)+"\n🌆 - "+dateToMoment(res.results.sunset);
          tweetText += "\nТривалість сонячного дня - "+secondsToHours(res.results.day_length);
        }else{
          tweetText = "перевірити що не так з отриманням часу сходу і заходу сонця⁉️❎😕"
        }
        client.post('statuses/update', {status: tweetText+'\n'+time},  function(error, tweet, response) {
          if(error){
            console.log(error);
          }else{
            console.log(moment().tz(timeZone).format("HH:mm:ss ")+"tweeted -- "+tweetText);
            lastTweetedTime = time;
          }
        });
      })
    }).end();
  }
  if(time == "02:20" && time != lastTweetedTime){
    let tweetID = '812375313564864512';
    client.post('statuses/retweet/'+tweetID, function(err, tweet, resp) {
      if(!err){
        console.log(tweet);
      }
    })
  }
  if(time[0] == time[4] && time[1] == time[3] && time != lastTweetedTime && time != "02:20" && time != sunRiseSetTime){ // checking if the current time meets the AB:BA pattern
    postAndUpdateSource(time);
  }
  // }, 5000);
}, 30000);

function postAndUpdateSource(time){
  refPile.once("value").then(function(snapshot) {
    if(snapshot.hasChildren()){
      refPile.once("child_added", (snap) => {
        let tweet = snap.val();
        postTweet(tweet.text, snap.key, time);
      })
    }else{
      console.log("No tweets in the Pile");
    }
  });
}

function postTweet(text, key, time){
  if (text != "") {
    client.post('statuses/update', {status: text+"\n"+time},  function(error, tweet, response) {
      if(error){
        if(error.code == 187){
          console.log("Dup! "+key+" "+text);
        }else{
          console.log(error);
        }
      }else{
        lastTweetedTime = time;
        console.log("Tweeted! "+text);
        moveToDone(key, tweet);
      }
    });
  }
}

function moveToDone(key, tweet) {
  refStaged.child(key).once("value", (snap) => {
    let val = snap.val();
    val.id = tweet.id;
    val.id_str = tweet.id_str;
    val.posted = true;
    val.postedDate = moment().tz(timeZone).format("DD.MM.YYYY");
    val.postedTime = moment().tz(timeZone).format("HH:mm");
    refDone.child(val.author_uid+"/"+snap.key).set(val);
    refPile.child(snap.key).remove();
    refStaged.child(snap.key).remove();
  })
}

function dateToMoment(date) {
  return moment(new Date(date)).tz(timeZone).format("HH:mm:ss");
}
function secondsToHours(sec){
  var sec_num = parseInt(sec, 10); // don't forget the second param
  var hours   = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
  var seconds = sec_num - (hours * 3600) - (minutes * 60);

  if (hours   < 10) {hours   = "0"+hours;}
  if (minutes < 10) {minutes = "0"+minutes;}
  if (seconds < 10) {seconds = "0"+seconds;}
  return hours+':'+minutes+':'+seconds;
}
