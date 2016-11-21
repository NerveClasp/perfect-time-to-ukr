const fs = require('fs');
const twitter = require('twitter');

//firebase
const firebase = require('firebase/app');
const admin = require('firebase-admin');
require('firebase/auth');
require('firebase/database-node');
const configFirebase= require('./configFirebase.json');
const adminCert = require('./admin.json');

firebase.initializeApp(configFirebase);
admin.initializeApp({
  credential: admin.credential.cert(adminCert),
  databaseURL: "https://perfect-time-to.firebaseio.com"
})

//db
let db = admin.database();
let ref = db.ref("server/saving-data/perfect");

// let usersRef = ref.child()
ref.once("value", function(snapshot){
  console.log(snapshot.val());
})


const moment = require('moment');
let config = require('./config.json');

var client = new twitter({
  consumer_key: config.consumerKey,
  consumer_secret: config.consumerSecret,
  access_token_key: config.accessToken,
  access_token_secret: config.accessTokenSecret
});
let tw;
console.log("Let's get going");
setInterval(function () {

  client.get('search/tweets', {q: '#perfect_time_ukr'}, function(error, tweets, response) {
    //  console.log(tweets.statuses[0]);
     let st = tweets.statuses;
     for (var i = 0; i < st.length; i++) {
       let cur = st[i];
       let id = cur.id;
       let tweetsRef = ref.child("tweets/"+id);
       let jsonSet = {
           id_str: cur.id_str,
           text: cur.text,
           mentioned: cur.entities.user_mentions,
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

      //  let add = JSON.parse(jsonSet);
       tweetsRef.set(jsonSet); //that's a long json :)


       console.log(st[i].user.screen_name);
       console.log(st[i].text);
       if (st[i].entities.user_mentions.length > 0) { // makes a list of people who are mentioned in the tweet
         for (var j = 0; j < st[j].entities.user_mentions.length; j++) {
           console.log("--for "+st[i].entities.user_mentions[j].screen_name);
         }
       }
       console.log();
     }
  });
  // for (var i = 0; i < tw.statuses.length; i++) {
  //   console.log(tw.statuses[i].user);
  // }
}, 10000);
