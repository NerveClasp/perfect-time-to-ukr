const fs = require('fs');
const twitter = require('twitter');

//firebase
const firebase = require('firebase/app');
const admin = require('firebase-admin');
require('firebase/auth');
require('firebase/database-node');
const configFirebase= require('./configFirebase.json'); // rename the configFirebase0.json and fill it with your data
const adminCert = require('./admin.json'); // rename admin0.json and fill it with your data

firebase.initializeApp(configFirebase);
admin.initializeApp({
  credential: admin.credential.cert(adminCert),
  databaseURL: "https://perfect-time-to.firebaseio.com" // change the path here
})

//db
let db = admin.database();
let ref = db.ref("perfect/tweets/manual"); // change to the prefered path in your Firebase database
let tweetsModerated;
// ref.once("value", function(snapshot){
//   tweetsModerated = snapshot.val();
// })

ref.orderByKey().on("value", function(snapshot){
  tweetsModerated = snapshot.val();
}, function(errorObject) {
  console.log("The read failed: "+errorObject.code);
});

const moment = require('moment'); // I just love Moment.js. Do not use it here yet though..
let config = require('./config.json'); // rename config0.json and fill it with your data

var client = new twitter({
  consumer_key: config.consumerKey,
  consumer_secret: config.consumerSecret,
  access_token_key: config.accessToken,
  access_token_secret: config.accessTokenSecret
});

// new here
console.log("Let's get going");
setInterval(function () {
  // for (var i = 0; i < tweetsModerated.numChildren; i++) {
    // let cur = tweetsModerated.child(i+"tweet");
    // if (!cur.posted && cur.valid) {
    //   console.log(cur.text);
    //   let childRef = tweetsModerated.child(i+"tweet");
    //   childRef.update({"posted" : true});
    //   break;
    // }

  // }
  console.log(tweetsModerated);

}, 3000); // change the frequency of checking for tweets (1000 is 1 second)
