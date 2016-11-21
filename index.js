const fs = require('fs');
const twitter = require('twitter');
const tweets = require('./testPhrases.json');
const moment = require('moment');

let countMe = 0; // counts how many tweets were tweeted
let bufferCount = 0; // counts buffer tweets (details below)
let config = require('./config.json'); //change config0.json and fill in your data
let tweet = "";
let owner = "@NerveClasp"; // for emergency notification of you, the owner :)
let bufferTweets = [ // tweets that are used when there are no new tweets in the database
  "твітнути щось з тегом #perfect_time_ukr ібо тут вже твіти вигадані "+owner+" закінчуються!",
  "терміново твітнути щось з тегом #perfect_time_ukr бо "+owner+" забув додати тупих фразочок..",
  "подзвонити "+owner+" аби додав ще фразочок, бо старі закінчились зовсім.. #perfect_time_ukr",
  "всі про мене забули :,( Ну знач наша пісня гарна нóва, починаймо її знову, пра "+owner+" ?"
];

var client = new twitter({
  consumer_key: config.consumerKey,
  consumer_secret: config.consumerSecret,
  access_token_key: config.accessToken,
  access_token_secret: config.accessTokenSecret
});

setInterval(function () { // first the interval is passed, then the code is being executed
  let time = moment().format('HH:mm'); // getting the system time
  if(time[0] == time[4] && time[1] == time[3]){ // checking if the current time meets the AB:BA pattern
    if(tweets.t.length == countMe && bufferCount != bufferTweets.length){ // if the length of available
      // tweets array is the same, as the number of already tweeted tweets +1 - start using buffer tweets
      tweet = bufferTweets[bufferCount];
      bufferCount++;
      countMe--; // countMe gets increased later in the code, decided to do this terrible trick, sorry
      console.log("first if "+tweet);
      console.log(tweets.t[0]+"   __"+tweets.t.length+"__"+countMe);
    }else if(bufferCount == bufferTweets.length){ // if all buffer tweets were used, start posting old tweets from the beginning
      countMe = 0;
      bufferCount = 0;
      tweet = tweets.t[countMe];
      console.log("else if "+tweet);
    }else{ // if there are still available tweets in the queue
      tweet = tweets.t[countMe];
      console.log("else "+tweet+" -- "+countMe);
    }
    // if(true){
    client.post('statuses/update', {status: tweet+'\n'+time},  function(error, tweet, response) {
      if(error){
        /* lol nothing */
      }else{
        console.log(moment().format("HH:mm:ss_")+"tweeted "+tweets.t[countMe]);
        countMe++;
      }
    });
  }
}, 60000);
