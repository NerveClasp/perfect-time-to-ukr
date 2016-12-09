const fs = require('fs');
const twitter = require('twitter');
const tweets = require('./testPhrases.json');
const moment = require('moment');

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
  // if(true){
  if(time[0] == time[4] && time[1] == time[3] && time != lastTweetedTime){ // checking if the current time meets the AB:BA pattern
    // if(tweets.t.length == countMe && bufferCount != bufferTweets.length){ // if the length of available
    //   // tweets array is the same, as the number of already tweeted tweets +1 - start using buffer tweets
    //   tweet = bufferTweets[bufferCount];
    //   bufferCount++;
    //   countMe--; // countMe gets increased later in the code, decided to do this terrible trick, sorry
    //   console.log("first if "+tweet);
    //   console.log(tweets.t[0]+"   __"+tweets.t.length+"__"+countMe);
    // }else if(bufferCount == bufferTweets.length){ // if all buffer tweets were used, start posting old tweets from the beginning
    //   countMe = 0;
    //   bufferCount = 0;
    //   tweet = tweets.t[countMe];
    //   console.log("else if "+tweet);
    // }else{ // if there are still available tweets in the queue
    //   tweet = tweets.t[countMe];
    //   console.log("else "+tweet+" -- "+countMe);
    // }
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
