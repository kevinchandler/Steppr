Steppr
======


Steppr is an application that will utilize data from wearables such as: Up, Fitbit, Moves (iPhone app)

Create or join an organization. Compete for the most steps daily, weekly, monthly, for badges and bragging rights.

A working idea in progress. Currently only supports moves-app for iOS/Android


[Demo](http://step.ngrok.com) (Currently only a mobile UI)

If using [ngrok](https://ngrok.com/) you can run Steppr by "node app.js Steppr" That will start Steppr on an ngrok tunnel http://steppr.ngrok.com
Alternatively leave the NGROK variables alone. Except for NGROK_URL which is Steppr's main URL. ie. http://steppr.herokuapp.com and you can run Steppr by "node app.js"

You must have the following environment variables set:
```
// NGROK_URL is required even if not using ngrok to run Steppr. It is the main url:port of your app. 
// NGROK_TOKEN is not required. Can be obtained from https://ngrok.com/ for free to set a custom url. 
// NGROK_SUBDOMAIN is not required. Set it if you don't want to run Steppr by "node app.js Steppr"
// MOVES_REDIRECT_URL is where moves will redirect once they've authenticated a user through steppr. This is should be set    the value of NGROK_URL to be, *NGROK_URL*/moves/auth
// CLIENT_ID & CLIENT_SECRET are obtained from http://dev.moves-app.com
// MONGODB_URL is where Steppr will store it's data.

NGROK_URL = '' // the url and port of Steppr if you don't use ngrok
NGROK_TOKEN = ''
NGROK_SUBDOMAIN = '' // not needed this will be set once you start Steppr using "node app.js steppr" would give your domain http://steppr.ngrok.com
MOVES_REDIRECT_URL = ''
CLIENT_ID = ''
CLIENT_SECRET = ''
MONGODB_URL = ''
```

