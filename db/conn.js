const mongoose = require('mongoose');


const DB = `mongodb+srv://${process.env.USERNAMEMONGODB}:${process.env.PASSWORDMONGODB}@cluster0.cjewmvh.mongodb.net/iynkdata?retryWrites=true&w=majority&appName=Cluster0`

mongoose.connect(DB).then(() => {
    console.log("connected");
    
}).catch((err) => {
    console.log(err);
    console.log("nope");
});