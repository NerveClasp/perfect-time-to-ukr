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
let ref = db.ref("perfect/test"); // change to the prefered path in your Firebase database
let tweetsModerated, sn, tMod;
// ref.once("value", function(snapshot){
//   tweetsModerated = snapshot.val();
// })
for (var i = 0; i < 15; i++) {
  let refChild = ref.child(i);
  var json = {
        name: "name"+i,
        text: "bla bla bla "+i,
        author: "NerveClasp",
        title: "The Best Title ever "+i,
        posted: false,
        valid: true
  }
  refChild.on('value', (snap) => {
    if (snap.val() == null) {
      refChild.set(json);
    }
  });



}
let count = 0;
ref.on("value", function(snapshot) {
  console.log("rOnVal_sn.val: "+snapshot.val());
})

ref.on("child_added", function(snap, prevChildKey) {
  count++;
  console.log("rOnChAdd val: "+snap.val());
  console.log("rOnChAdd snap.key: "+snap.key);
  console.log("rOnChAdd prevChKey"+prevChildKey);
}, function (errorObject) {
  console.log("Error: "+errorObject.code);
});

// Get the data on a post that has changed
ref.on("child_changed", function(snapshot) {
  var changedPost = snapshot.val();
  console.log("chCha " + changedPost);
});
// Retrieve new posts as they are added to our database
ref.on("child_added", function(snapshot, prevChildKey) {
  var newPost = snapshot.val();
  console.log("Author: " + newPost.author);
  console.log("Title: " + newPost.title);
  console.log("Previous Post ID: " + prevChildKey);
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
/*
setInterval(function () {
  ref.orderByKey().on("value", function(snapshot){
    sn = snapshot.numChildren();
    tweetsModerated = snapshot.val();
  }, function(errorObject) {
    console.log("The read failed: "+errorObject.code);
  });
  for (var i = 0; i < sn; i++) {
    let id = "t"+i+"t";
    let posted = tweetsModerated[id].posted;
    let valid = tweetsModerated[id].valid;
    // tweetsModerated
    if (!posted && valid) {
      console.log(tweetsModerated[id].text);
      ref.child(id).update({"posted" : false});
      break;
    }
    // console.log(ref.child(id));
    console.log("i--"+ref.child(id));
    console.log("tm--"+tweetsModerated[id].text);
  }

  // console.log(tweetsModerated);
  // ref.child("t0t").update({
  //   "posted":true
  // })


}, 3000); // change the frequency of checking for tweets (1000 is 1 second)
*/
