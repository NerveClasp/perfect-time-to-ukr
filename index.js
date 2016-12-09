const fs = require('fs');
const twitter = require('twitter');
const tweets = require('./testPhrases.json');
const moment = require('moment');
const http = require('http');

let lat = 50.000992;
let lng = 26.417630;
let date = "today";
let path = "/json?lat="+lat+"&lng="+lng+"&date="+date;

let sunInfoOpt = {
  host: "api.sunrise-sunset.org",
  path: path
};

let lastTweetedTime = "";
let countMe = 0; // counts how many tweets were tweeted
let bufferCount = 0; // counts buffer tweets (details below)
let conf = require('./config.json'); //change config0.json and fill in your data
let tweetText = "";
let owner = "@NerveClasp"; // for emergency notification of you, the owner :)
let bufferTweets = [ // tweets that are used when there are no new tweets in the database
  "твітнути щось з тегом #perfect_time_ukr ібо тут вже твіти вигадані "+owner+" закінчуються!",
  "терміново твітнути щось з тегом #perfect_time_ukr бо "+owner+" забув додати тупих фразочок..",
  "подзвонити "+owner+" аби додав ще фразочок, бо старі закінчились зовсім.. #perfect_time_ukr",
  "всі про мене забули :,( Ну знач наша пісня гарна нóва, починаймо її знову, пра "+owner+" ?"
];

//firebase
const firebase = require('firebase/app');
const admin = require('firebase-admin');
require('firebase/auth');
require('firebase/database-node');
// const configFirebase= require('./configFirebase.json'); // rename the configFirebase0.json and fill it with your data
// const adminCert = require('./admin.json'); // rename admin0.json and fill it with your data

firebase.initializeApp(conf.configFirebase);
admin.initializeApp({
  credential: admin.credential.cert(conf.admin),
  databaseURL: "https://perfect-time-to.firebaseio.com" // change the path here
})

//db
let db = admin.database();
let ref = db.ref("perfect/tweets/manual"); // change to the prefered path in your Firebase database
let tweetsModerated, sn, tMod;


var client = new twitter({
  consumer_key: conf.config.consumerKey,
  consumer_secret: conf.config.consumerSecret,
  access_token_key: conf.config.accessToken,
  access_token_secret: conf.config.accessTokenSecret
});
console.log("Initialization successfull. Waiting for the perfect time.. :) ");
setInterval(function () { // first the interval is passed, then the code is being executed
  ref.orderByKey().on("value", function(snapshot){
    sn = snapshot.numChildren();
    tweetsModerated = snapshot.val();
  }, function(errorObject) {
    console.log("The read failed: "+errorObject.code);
  });
  let time = moment().format('HH:mm'); // getting the system time
  if (time == "00:00" && time != lastTweetedTime) {
    http.request(options, function(response) {
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
          tweetText += moment().format("DD.MM.YYYY")+"\n🌅 - "+res.results.sunrise;
          tweetText += "\n😎 - "+res.results.solar_noon+"\n🌆 - "+res.results.sunset;
          tweetText += "\nТривалість сонячного дня - "+res.results.day_length;
        }else{
          tweetText = "перевірити що не так з отриманням часу сходу і заходу сонця⁉️❎😕"
        }
        client.post('statuses/update', {status: tweetText+'\n'+time},  function(error, tweet, response) {
          if(error){
            /* lol nothing */
          }else{
            console.log(moment().format("HH:mm:ss ")+"tweeted -- "+tweetText);
            lastTweetedTime = time;
            countMe++;
          }
        });
      })
    }).end();

    found = true;
  }
  if(time[0] == time[4] && time[1] == time[3] && time != lastTweetedTime && time != "00:00"){ // checking if the current time meets the AB:BA pattern
    let found = false;
    let i = 0;
    while (i < sn && !found) {
      let id = "t"+i+"t";
      let posted = tweetsModerated[id].posted;
      let valid = tweetsModerated[id].valid;
      // tweetsModerated
      if (!posted && valid) {
        tweetText = tweetsModerated[id].text;
        ref.child(id).update({"posted" : true});
        console.log(tweetText);
        client.post('statuses/update', {status: tweetText+'\n'+time},  function(error, tweet, response) {
          if(error){
            /* lol nothing */
          }else{
            console.log(moment().format("HH:mm:ss ")+"tweeted -- "+tweetText);
            lastTweetedTime = time;
            countMe++;
          }
        });
        found = true;
        break;
      }
      i++;
    }
  }
  // }, 5000);
}, 30000);
