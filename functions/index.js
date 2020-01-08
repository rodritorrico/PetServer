const functions = require('firebase-functions');
var admin = require('firebase-admin');
var serviceAccount = require("./petappserver2-firebase-adminsdk-42nn1-d0927028bb");

var express = require('express');
var app = express();

const bodyParser = require('body-parser');

const cors = require('cors');

app.use(bodyParser.text());
app.use(bodyParser.json());
app.use(cors());


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://petappserver2.firebaseio.com"
});

let db = admin.firestore();

let thingCollecntion = db.collection('ThingData');
let webCollecntion = db.collection('WebData');
let webDataDocRef = webCollecntion.doc('user1');

let feedTimes;
let userWantsToFeedPet
let lastData;
let platePercentage;


app.get('/', function (req, res) {
  res.send('The api works');
});

app.get('/feedPet',async (request, response)=> {
    userWantsToFeedPet = await  (await webDataDocRef.get()).data().feedCat;
   
    response.send(userWantsToFeedPet);
})

app.post('/thingData', async (request, response)=>{
    let thingData = request.body;
    if(thingData === "6.5"){
        await webDataDocRef.update({feedCat: false});
    }
    await webDataDocRef.update({lastData: thingData});
    
    thingCollecntion.add({data: thingData});
    response.sendStatus(200);
})

app.get('/getFeedTimes', async (request, response)=>{
    feedTimes = await  (await webDataDocRef.get()).data().feedTimes;
    response.send(feedTimes.toString());
})

app.get('/getPlatePercentage', async(request, response) =>{
    lastData = await (await webDataDocRef.get()).data().lastData;
    const limitData = 7;
    let calculatedPlatePercentage = Math.round((10 - lastData )*33.33);
    await webDataDocRef.update({platePercentage: calculatedPlatePercentage});

    response.send(calculatedPlatePercentage.toString());
})

app.post('/giveFood', async (request,response)=>{

    feedTimes = await  (await webDataDocRef.get()).data().feedTimes;
    let feedTimesValue = feedTimes + 1;
    let data = { feedTimes: feedTimesValue };
    await webDataDocRef.update(data);

    let giveFoodData = request.body;

    if(giveFoodData === 'true') {
        await webDataDocRef.update({feedCat: true});
    }
    response.sendStatus(200);
})





exports.app = functions.https.onRequest(app);

