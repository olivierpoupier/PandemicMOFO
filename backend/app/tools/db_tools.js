var MongoClient = require('mongodb').MongoClient;
var url = require('../../config/db').url;
var db;

exports.DBConnectMongo = function() {
    return new Promise(function(resolve, reject) {
        if (db) {
            return db;
        }
        var mongoClient = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
        mongoClient.Promise = global.Promise;

        mongoClient.connect()
            .then(x => {
                console.log('mongo connection created');
                db = x;
                resolve(db);
            })
            .catch(err => {
                console.log('error creating db connection: ' + err);
                reject(db);
            });
    });
};

exports.getDBConexion = function () {
    if (db) {
        return db;
    }

    console.log('There is no mongo connection');
    return null;
}