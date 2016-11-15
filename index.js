const fs = require('fs');
const twitter = require('twitter');
const tweets = require('./testPhrases.json');
const moment = require('moment');

let countMe = 0;
let config = require('./config.json');
console.log(countMe);
console.log(config.consumerKey);
console.log(moment().format('HH:mm'));

var client = new twitter({
  consumer_key: config.consumerKey,
  consumer_secret: config.consumerSecret,
  access_token_key: config.accessToken,
  access_token_secret: config.accessTokenSecret
});

let time = moment().format('HH:mm');

setInterval(function () {
  if(time[0] == time[4] && time[1] == time[3]){
    client.post('statuses/update', {status: tweets[countMe]+'\n'+time},  function(error, tweet, response) {
      if(error){
        /* lol nothing */
      }else{
        countMe++;
      }
    });
  }else{
    console.log(moment().format("HH:mm:ss")+" - no tweeting required at this time.");
  }
}, 60000);
