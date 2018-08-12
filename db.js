const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/* Schemas */

const exercise = new Schema({
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  }
});

const userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  log: {
    type: [exercise]
  }
});

const User = mongoose.model('User', userSchema);

/* CRUD Methods */

// CREATE NEW USER
const createNewUser = (username, done) => {
  let newUser = new User({ "username": username });
  newUser.save((err, data) => {
    done(err, data);
  })
}

// ADD EXERCISE TO USER'S LOG
const addExercise = (id, logEntry, done) => {
  User.findById(id, (err, data) => {
    data.log.push(logEntry);
    data.log.sort((a, b) => {
      let aDate = new Date(a.date);
      let bDate = new Date(b.date);
      return aDate - bDate;
    })
    data.save((err, doc) => {
      done(err, doc);
    })
  })
}

// GET EXERCISES
const getExercises = (id, filter, done) => {
  User.findById(id, (err, data) => {
    //console.log(data);
    if (data.log.length && filter.from || filter.to) {
      data.log = data.log.filter((e, i) => {
        let eDate = new Date(e.date);
        if (filter.from && filter.to) {
          return eDate >= new Date(filter.from) && eDate <= new Date(filter.to);
        }
        else if (filter.from) {
          return eDate >= new Date(filter.from);
        } else if (filter.to) {
          return eDate <= new Date(filter.to);
        }
      });
    }
    let p = data.log.length;
    let prettyLog = [];
    if (filter.limit) {
      p = filter.limit;
    }
    
    for (let i = 0; i < p; i++) {
      let d = new Date(data.log[i].date).toDateString();
      prettyLog.push({
        "description": data.log[i].description,
        "duration": data.log[i].duration,
        "date": d
      });
    }
    let prettyData = {
      "_id": data._id,
      "username": data.username,
      "count": prettyLog.length,
      "log": prettyLog
    };
    done(err, prettyData);
  });
  
}

module.exports.exercise = exercise;
module.exports.User = User;
module.exports.createNewUser = createNewUser;
module.exports.addExercise = addExercise;
module.exports.getExercises = getExercises;
