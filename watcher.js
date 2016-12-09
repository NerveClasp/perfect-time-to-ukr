const fs = require('fs');
const twitter = require('twitter');

//firebase
const firebase = require('firebase/app');
const admin = require('firebase-admin');
require('firebase/auth');
require('firebase/database-node');
const conf= require('./config.json'); // rename the configFirebase0.json and fill it with your data

firebase.initializeApp(conf.configFirebase);
admin.initializeApp({
  credential: admin.credential.cert(conf.admin),
  databaseURL: "https://perfect-time-to.firebaseio.com" // change the path here
})

//db
let db = admin.database();
let ref = db.ref("perfect/tweets"); // change to the prefered path in your Firebase database
let refEx = db.ref('perfect/tweets/manual');
let sn;


const moment = require('moment'); // I just love Moment.js. Do not use it here yet though..

var client = new twitter({
  consumer_key: conf.consumerKey,
  consumer_secret: conf.consumerSecret,
  access_token_key: conf.accessToken,
  access_token_secret: conf.accessTokenSecret
});
let searchText = "#perfect_time_ukr"; // change this to whatever you would like to search for

const manualSubmit = require('./testPhrases.json'); // in case you would like to add tweets manually from file
let validDef = false; //Default value for moderation flag. Set to false if you would like to moderate tweets before posting
refEx.orderByKey().once("value", function(snapshot){
  sn = snapshot.numChildren();
  console.log(sn);
  // tweetsModerated = snapshot.val();
}, function(errorObject) {
  console.log("The read failed: "+errorObject.code);
});
console.log("Let's get going");
setInterval(function () {

  for (var k = 0; k < manualSubmit.t.length; k++) {

    let text = manualSubmit.t[k];
    let id = k+sn;
    let tweetsManualRef = ref.child("manual/t"+id+"t"); // separate section for manually added tweets.
    let jsonManual = {
      text: text,
      valid: true, // default to 'true' for texts manually submited by you from the textfile
      posted: false, // default 'false' for new tweets added to the database
      day: "", // placeholder for day of the week
      date: "", // placeholder for a specific date from parsed tweet
      time: "", // placeholder for the specific time from parced tweet
      partOfTheDay: "", // placeholder for a certain part of the day
    };
    tweetsManualRef.set(jsonManual); // pushing data to the database
    console.log("pushed "+text);
  }

  client.get('search/tweets', {q: searchText}, function(error, tweets, response) {
     let st = tweets.statuses; // basically statuses is all we need
     for (var i = 0; i < st.length; i++) {
       let cur = st[i]; // current tweet from the tweets array
       let id = cur.id; // tweet id that is used to add it to the database
       let tweetsRef = ref.child("unmoderated/"+id); // separate section for found tweets for moderation purposes
       let jsonSet = {
           id_str: cur.id_str,
           text: cur.text,
           valid: validDef,
           posted: false, // default 'false' for new tweets added to the database
           day: "", // placeholder for day of the week
           date: "", // placeholder for a specific date from parsed tweet
           time: "", // placeholder for the specific time from parced tweet
           partOfTheDay: "", // placeholder for a certain part of the day
           mentioned: cur.entities.user_mentions, // handy place to see who was mentioned in the tweet
           in_reply_to_status_id: cur.in_reply_to_status_id,
           in_reply_to_status_id_str: cur.in_reply_to_status_id_str,
           in_reply_to_user_id: cur.in_reply_to_user_id,
           in_reply_to_user_id_str: cur.in_reply_to_user_id_str,
           in_reply_to_screen_name: cur.in_reply_to_screen_name,
           from: {
             id: cur.user.id,
             id_str: cur.user.id_str,
             name: cur.user.name,
             screen_name: cur.user.screen_name,
             profile_background_color: cur.user.profile_background_color,
             profile_background_image_url: cur.user.profile_background_image_url,
             profile_image_url: cur.user.profile_image_url,
             profile_link_color: cur.user.profile_link_color,
             profile_sidebar_border_color: cur.user.profile_sidebar_border_color,
             profile_sidebar_fill_color: cur.user.profile_sidebar_fill_color,
             profile_text_color: cur.user.profile_text_color
           }
       };
       tweetsRef.set(jsonSet); // push found tweets to the database
       // just for troubleshooting
      //  console.log(st[i].user.screen_name);
      //  console.log(st[i].text);
       if (st[i].entities.user_mentions.length > 0) { // makes a list of people who are mentioned in the tweet
         for (var j = 0; j < st[j].entities.user_mentions.length; j++) {
           console.log("--for "+st[i].entities.user_mentions[j].screen_name);
         }
       }
       console.log();
     }
  });
  console.log("==== Are we done? ====?");
}, 30000); // change the frequency of checking for tweets (1000 is 1 second)
