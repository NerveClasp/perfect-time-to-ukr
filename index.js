const fs = require('fs');
const twitter = require('twitter');
const tweets = require('./testPhrases.json');
const moment = require('moment');

let countMe = 0;
let bufferCount = 0;
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
  if(time[0] == time[4] && time[1] == time[3]){
    if(tweets.t.length == countMe && bufferCount != bufferTweets.length){
      tweet = bufferTweets[bufferCount];
      bufferCount++;
      countMe--;
      console.log("first if "+tweet);
      console.log(tweets.t[0]+"   __"+tweets.t.length+"__"+countMe);
    }else if(bufferCount == bufferTweets.length){
      countMe = 0;
      bufferCount = 0;
      tweet = tweets.t[countMe];
      console.log("else if "+tweet);
    }else{
      tweet = tweets.t[countMe];
      console.log("else "+tweet+" -- "+countMe);
    }
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
}, 1000);
// }, 60000);
