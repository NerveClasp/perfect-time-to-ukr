# Perfect time to..
## NodeJS + Firebase Twitter bot
A **_nodejs_** twitter bot that tweets a random _"What a perfect time to.."_ whenever the current time matches _AB:BA_ pattern. New suggestion phrases can be added by using **#perfect_time_ukr** hashtag.
WIP at the moment.

![@perfect_time_to](https://pbs.twimg.com/profile_images/798350343256023040/eheY1ldX_400x400.jpg)

Fork or simply clone the repo to your computer (home server), then run
`npm install`

1. Create a project at https://console.firebase.google.com/
2. Follow [this][19dbd91c] amazing youtube tutorial from @rob_dodson
3. `firebase deploy` once you're done with the tutorial.
3. Find instructions on how to configure twitter functionality [here][e1a46579].
4. See how to make NodeJS be able to work with [Firebase database][62c4f841].
5. See _testPhrases.json_ for tweets you can populate your database with or set the search text inside _watcher.js_
6. Rename and fill configuration files, that end with ***0.json** with your data, provided by respectful services.
7. `node watcher.js` to fill your database.
8. `node index.js` to start tweeting:)

I'm far from a good coder, therefore any constructive feedback is much and trully appreciated.
Feel free to hit me up at @NerveClasp and check out my working twitter (in Ukrainian) here:
[https://twitter.com/perfect_time_to][42600048]

  [42600048]: https://twitter.com/perfect_time_to "What a perfect time to.."


  [19dbd91c]: https://www.youtube.com/watch?v=SkhCs-IDgS4 "Polymer + Firebase Authentication"
  [e1a46579]: https://www.npmjs.com/package/twitter "npm twitter"
  [62c4f841]: https://firebase.google.com/docs/database/admin/start "Firebase Admin Get Started"
