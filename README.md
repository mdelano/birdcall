    ==========================================
    ______  _           _  _____         _  _ 
    | ___ \(_)         | |/  __ \       | || |
    | |_/ / _  _ __  __| || /  \/  __ _ | || |
    | ___ \| || '__|/ _` || |     / _` || || |
    | |_/ /| || |  | (_| || \__/\| (_| || || |
    \____/ |_||_|   \__,_| \____/ \__,_||_||_|
    ==========================================

MediaSilo's Web Hook Runner Bot

Birdcall responds to events by calling back to registered callback destinations. 

### How does it work?

BirdCall monitors a Q for events like this:
```json
  {
     "Message": {
         "eventName": "Marco",,
         "userId": "6EF6C1E9-E130-2427-8641E1A2E3DA4C8D",
         "accountId": "337635823HFOP",
         "hostname": "simon",
         "entity": {
             "marco": "polo",
             "details": {
                 "calledBackFrom": "phoenix"
             }
         }
     }
 }
```

When it receives events it then looks for registered webhooks that look like this:

```json
  {
    "id": "541b194744ae103792fd9903",
    "accountId": "337635823HFOP",
    "eventBinding": "Marco",
    "transport": "http",
    "transportProperties": {
        "endpoint": "https://mediasilo.slack.com/services/hooks/incoming-webhook?token=mRxnu8TL3rxWHKK0XdxCMvCh"
   },
    "body": "{\"text\": \"<%marco%>\"}",
    "createdBy": "6EF6C1E9-E130-2427-8641E1A2E3DA4C8D",
    "created": 1411062087165
  }
 ```
 
 It then uses the webhook to post call backs to. In the example above, a message it posted to slack that says "polo". Get it?
 
 ### How can I play?
 
 Birdcall is listening for events produced by MediaSilo's API. In order to recieve a call back forst reegister a webhook:
 
 ```
 POST /v3/webhooks
 
 {"accountId":"1234567890","eventBinding":"Marco","transport":"http","transportProperties":{"endpoint":"https://mediasilo.slack.com/services/hooks/incoming-webhook?token=mRxnu8TL3rxWHKK0XdxCMvCh"},"body":"{\"text\": \"<%marco%>\"}"}
 ```
 
 Then, when the vent is triggered, you will get a callback.
