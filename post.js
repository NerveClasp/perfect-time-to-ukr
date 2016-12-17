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
let db = admin.database();
// let ref = db.ref("perfect/test"); // change to the prefered path in your Firebase database
let refReady = db.ref("ready"); // change to the prefered path in your Firebase database
let refReadyTweets = db.ref("ready/tweets");
let refStaged = db.ref("staged/tweets");
let refQueue = db.ref("queue/pile");
let refDone = db.ref("done/tweets");
let refPile = db.ref("queue/pile");

var client = new twitter({
  consumer_key: conf.config.consumerKey,
  consumer_secret: conf.config.consumerSecret,
  access_token_key: conf.config.accessToken,
  access_token_secret: conf.config.accessTokenSecret
});

function postTweet(text, key){
  if (text != "") {
    client.post('statuses/update', {status: "Test tweet. Please ignore :) \n"+text},  function(error, tweet, response) {
      if(error){
        if(error.code == 187){
          console.log("Dup! "+key+" "+text);
        }else{
          console.log(error);
        }
      }else{
        console.log("Tweeted! "+text);
        moveToDone(key, tweet);
      }
    });
  }
}

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
