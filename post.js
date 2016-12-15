const fs = require('fs');
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
let refQueue = db.ref("queue");
let refDone = db.ref("done/tweets");
let refPile = db.ref("queue/pile");
let tweetsModerated, sn, tMod;
let count = 0;

// First the Staged list is checked for Valid tweets
refStaged.on("child_changed", function(snap) {
  console.log('refStaged.on("child_changed",');
  var obj = snap.val();
  console.log("chCha.S " + obj.text);
  console.log("+                           +");
  if(obj.valid && !obj.posted && !obj.queued){
    console.log(snap.key+" is ready");
    // let result = postTweet("Test!\n"+snap.key+" is ready\nPlease ignore.", snap.key);
    addToQueue(obj, snap.key); // When the tweet in Staged list becomes Valid, put it into the Queue
    refStaged.child(snap.key).update({queued: true});
    // refStaged.child(snap.key).remove();
    // refStaged.child(snap.key).update({"id": result.id, "id_str": result.id_str});
  };
  if (obj.posted) {
    refDone.child(obj.author_uid+"/"+snap.key).set(obj);
    refStaged.child(snap.key).remove();
  }
});

// Retrieve new posts as they are added to our database
refStaged.on("child_added", function(snap) {
  var obj = snap.val();
  if(obj.valid && !obj.queued){
    addToQueue(obj, snap.key);
    refStaged.child(snap.key).update({queued: true});
  }
}, function (errorObject) {
  console.log("Error.S: "+errorObject.code);
  console.log("+                           +");
});

// Once something is added to Queued list check any empty spots for tweets in Ready queue
// refQueue.child("pile").on("child_added", function(snap) {
//   refReadyTweets.orderByChild("order").once("child_added"), function(snapReady) {
//     var objReady = snapReady.val();
//     ////////
//   }
// })

refReadyTweets.on('child_changed', function (snap) {
  var obj = snap.val();
  if(obj.posted && obj.text == "" && !obj.ready){
    postedTweetWantSomeMoreFromTheQueue(snap.key); // looking for the specific timed tweet
    // refReadyTweets.child(snap.key).update({order: Date.now()});
  }
  // if(obj.posted && obj.text != ""){
  //   updateSourceTweet(snap.key, obj); // updating the tweet in Staged with the tweet IDs
  // }
});

function checkAndPost(time){
  refReadyTweets.child(time).once("value", function(snap) {
    let obj = snap.val();
      postedTweetWantSomeMoreFromTheQueue(time);
      // lastTweetedTime[0] = time;
  });
}

function postTweet(text, key, time){
  if (text != "") {
    client.post('statuses/update', {status: text},  function(error, tweet, response) {
      if(error){
        console.log(error);
      }else{
        console.log("Tweeted! "+text);
        refStaged.child(key).update({"id": tweet.id, "id_str": tweet.id_str, "posted": true, "postedDate": moment().format("DD.MM.YYYY")}); // HARDCODED! Change later
        let dataReady = { posted: true, ready: false, text: "" };
        refReadyTweets.child(time).update(dataReady);
      }
    });
  }
}


function updateSourceTweet(time, obj) {
  let stagedData = {
    id: obj.id,
    id_str: obj.id_str,
    postedTime: time,
    postedDate: obj.postedDate,
    posted: true
  };
  let readyData = {
    text: "",
    order: Date.now(),
    ready: false
  }
  refStaged.child(obj.key).update(stagedData);
  refReadyTweets.child(time).update(readyData);
}

function postedTweetWantSomeMoreFromTheQueue(time) {
  refPile.once("value").then(function(snap) {
    if(snap.hasChildren()){
      refPile.once('child_added', function(snap) {
        let obj = snap.val();
        let updateStaged = {
          queued: true
        };
        let updateReady = {
          text: obj.text,
          key: obj.key,
          posted: false,
          ready: true,
          order: Date.now()
        };
        refReadyTweets.child(time).update(updateReady);
        refStaged.child(obj.key).update(updateStaged);
        refPile.child(snap.key).remove();
        postTweet(obj.text, obj.key, time);
      });
    }
    // else{
    //   let updateReady = {
    //     posted: false,
    //     order: Date.now()
    //   };
    //   refReadyTweets.child(time).update(updateReady);
    // }
  })
}

function addedToTheQueueLookingForAvailableReady(queueKey) {
  refReadyTweets;
}

// ========================== GET READY ======================================
function addToQueue(tweet, key) {
  function add(section){
    let ref = db.ref(section);
    let obj = tweet;
    obj.queued = true;
    obj.key = key;
    // obj.param to add some
    ref.child(key).set(obj);
  }
  if       (tweet.timeDate     != null){
    add("queue/date/"+tweet.date+"/time");
  }else if (tweet.timeDay      != null) {
    add("queue/"+tweet.day+"/time");
  }else if (tweet.partDate     != null){
    add("queue/date/"+tweet.date+"/part");
  }else if (tweet.time         != null){
    add("queue/"+tweet.time);
  }else if (tweet.day          != null){
    add("queue/"+tweet.day);
  }else if (tweet.date         != null){
    add("queue/"+tweet.date);
  }else if (tweet.partOfTheDay != null){
    add("queue/"+tweet.partOfTheDay);
  }else{
    add("queue/pile")
  }

}

var client = new twitter({
  consumer_key: conf.config.consumerKey,
  consumer_secret: conf.config.consumerSecret,
  access_token_key: conf.config.accessToken,
  access_token_secret: conf.config.accessTokenSecret
});

console.log("Let's get going");

db.ref("done/tweets/undefined").on("child_changed", function(snap) {
  let time = "01:10";
  if(time != lastTweetedTime){
    checkAndPost("01:10");
  }

})

let lastTweetedTime = "12:21";
