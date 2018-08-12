const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
const db = require('./db');
const User = db.User;

mongoose.connect(process.env.MLAB_URI, {useMongoClient: true})

app.use(cors())

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/exercise/new-user', (req, res, next) => {
  db.createNewUser(req.body.username, (err, data) => {
    let user = { "_id": data._id, "username": data.username };
    res.json(user);
  });
});

app.post('/api/exercise/add', (req, res, next) => {
  let entry = {
    "description": req.body.description,
    "duration": req.body.duration,
    "date": new Date(req.body.date)
  };
  
  db.addExercise(req.body.userId, entry, (err, doc) => {
    //console.log(doc);
    let d = new Date(doc.log[doc.log.length - 1].date).toDateString();
    let readable = {
      "_id": doc._id,
      "username": doc.username,
      "description": doc.log[doc.log.length - 1].description,
      "duration": doc.log[doc.log.length - 1].duration,
      "date": d
    };
    res.json(readable);
  });
});

app.get('/api/exercise/log', (req, res, next) => {
  let filter = {"from": req.query.from, "to": req.query.to, "limit": req.query.limit};
  db.getExercises(req.query.userId, filter, (err, doc) => {
    res.json(doc);
  });
});

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
