const fs = require('fs');
const twitter = require('twitter');
const tweets = require('./testPhrases.json');
const moment = require('moment');

let countMe, bufferCount = 0;
let config = require('./config.json');
let tweet = "";
let bufferTweets = [
  "твітнути щось з тегом #perfect_time_ukr ібо тут вже твіти вигадані @NerveClasp закінчуються!",
  "терміново твітнути щось з тегом #perfect_time_ukr бо @NerveClasp забув додати тупих фразочок..",
  "подзвонити @NerveClasp аби додав ще фразочок, бо старі закінчились зовсім.. #perfect_time_ukr",
  "всі про мене забули :,( Ну знач наша пісня гарна нóва, починаймо її знову, пра @NerveClasp ?"
];

var client = new twitter({
  consumer_key: config.consumerKey,
  consumer_secret: config.consumerSecret,
  access_token_key: config.accessToken,
  access_token_secret: config.accessTokenSecret
});

setInterval(function () {
  let time = moment().format('HH:mm');
  if(tweets.t.length == countMe || tweets.t.length < countMe){
    tweet = bufferTweets[bufferCount];
    bufferCount++;
  }else if(tweets.t.length < countMe && bufferCount == bufferTweets.length){
    countMe = 0;
    bufferCount = 0;
    tweet = tweets.t[countMe];
  }else{
    tweet = tweets.t[countMe];
  }
  if(time[0] == time[4] && time[1] == time[3]){
  // if(true){
    client.post('statuses/update', {status: tweet+'\n'+time},  function(error, tweet, response) {
      if(error){
        /* lol nothing */
      }else{
        console.log(moment().format("HH:mm:ss_")+"tweeted"+tweets.t[countMe]);
        countMe++;
      }
    });
  // }//
  }
}, 60000);
