const mongoose = require('mongoose');
const MONGO_URL = "mongodb+srv://root:root@codermehta.xbdvy9d.mongodb.net/USERINFO?retryWrites=true&w=majority&appName=CODERMEHTA";
const Host = require('../models/hostlogin');
const bcrypt = require('bcryptjs');

mongoose.connect(MONGO_URL)
.then(async ()=>{
    console.log("Mongo DB Connected");

    const hashedPassword = await bcrypt.hash('admin#shiv@112', 12)
    const host = new Host({
        name : 'Shiv Kumar',
        email: 'adminshiv@gmail.com',
        password : hashedPassword
    });

    await host.save();

    console.log("Host created");
    mongoose.disconnect();
}).catch(err => {
    console.log("Error while creating host", err)
})