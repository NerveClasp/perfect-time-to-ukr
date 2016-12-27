const twitter = require('twitter');
const moment = require('moment-timezone'); // I just love Moment.js. Do not use it here yet though..

//firebase
const firebase = require('firebase/app');
const admin = require('firebase-admin');
require('firebase/auth');
require('firebase/database-node');
const conf= require('./config.json'); // rename the config0.json and fill it with your data

firebase.initializeApp(conf.configFirebase);
admin.initializeApp({
  credential: admin.credential.cert(conf.admin),
  databaseURL: "https://perfect-time-to.firebaseio.com" // change the path here
})
//db
var client = new twitter({
  consumer_key: conf.config.consumerKey,
  consumer_secret: conf.config.consumerSecret,
  access_token_key: conf.config.accessToken,
  access_token_secret: conf.config.accessTokenSecret
});

let params = {screen_name: 'perfect_time_to'}
// client.get("following/list", params, function(error, tweets, resp) {
//   if(error) console.error();
//   console.log(tweets);
// });
client.get('friends/list', function(err, tweets, resp) {
  if(err) console.error(err);
  // console.log(tweets.users[0]);
  for (var i = 0; i < tweets.users.length; i++) {
    let cur = tweets.users[i];
    // if(!cur.following){
    console.log(cur.screen_name);
    console.log(cur.name);
    console.log("Follows?", cur.following);
    console.log("______________");
    // }
  }
  // console.log(tweets.length);
})
//id 812375313564864500
//id_str 812375313564864512

/*
client.get('search/tweets', {q: "випити вина"}, function(error, tweets, response) {
// console.log(tweets);
let st = tweets.statuses; // basically statuses is all we need
let cur = st[0];
// console.log(st);
for (var i = 0; i < st.length; i++) {
console.log(st[i].text);
console.log(st[i].id);
console.log(st[i].id_str);
console.log();
}
let id = cur.id; // tweet id that is used to add it to the database
//  let tweetsRef = ref.child(id); // separate section for found tweets for moderation purposes
let jsonSet = {
id: cur.id,
id_str: cur.id_str,
text: cur.text,
author: cur.user.name,
uid: cur.user.id_str,
photoURL: cur.user.profile_background_image_url,
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
// console.log(jsonSet);
});
*/

/*
let db = admin.database();
// let ref = db.ref("perfect/test"); // change to the prefered path in your Firebase database
let refReady = db.ref("ready"); // change to the prefered path in your Firebase database
let refReadyTweets = db.ref("ready/tweets");
let refStaged = db.ref("staged/tweets");
let refQueue = db.ref("queue/pile");
let refDone = db.ref("done/tweets");
let refPile = db.ref("queue/pile");
*/
/*
postTweet("Test!\nДля @NerveClasp", "123")

function postTweet(text, key){
  if (text != "") {
    client.post('statuses/update', {status: "Test tweet. Please ignore :) \n"+text},  function(error, tweet, response) {
      if(error){
        if(error.code == 187){
          console.log("Dup! ", key, text);
        }else if(error.code == 186){
          console.log("Oops, too long! ", key, text);
        }else{
          console.log(error);
        }
      }else{
        console.log("Tweeted! "+text);
        // moveToDone(key, tweet);
      }
    });
  }
}
*/
/*
db.ref("done/tweets/undefined").on("child_changed", function(snap) {
postAndUpdateSource("01:10");
})

function postAndUpdateSource(time){
refPile.once("value").then(function(snapshot) {
if(snapshot.hasChildren()){
refPile.once("child_added", (snap) => {
let tweet = snap.val();
postTweet(tweet.text, snap.key);
})
}else{
console.log("No tweets in the Pile");
}
}

function moveToDone(key, tweet) {
refStaged.child(key).once("value", (snap) => {
let val = snap.val();
val.id = tweet.id;
val.id_str = tweet.id_str;
val.posted = true;
val.postedDate = moment().format("DD.MM.YYYY");
val.postedTime = moment().format("HH:mm");

refDone.child(val.author_uid+"/"+snap.key).set(val);
refPile.child(snap.key).remove();
refStaged.child(snap.key).remove();
})
}
*/
