const mongo = require('mongodb');
const mongoClient = mongo.MongoClient;
const MONGO_URL = 'mongodb+srv://root:root@codermehta.xbdvy9d.mongodb.net/?appName=CODERMEHTA'; 

let _db;

const mongoConnect = (callback) =>{
    mongoClient.connect(MONGO_URL).then((client)=>{
        callback(client);
        _db = client.db('USERINFO')
    }).catch(error =>{
        console.log('Error while connecting to mongo', error)
    })
}

const getDB = () =>{
    if(!_db){
        throw new error("Mongo not connected")
    }
    return _db
}

exports.mongoConnect = mongoConnect;
exports.getDB = getDB; 