
var db = require('../tools/db_tools').getDBConexion();
var mongoClient = require('mongodb').MongoClient;

module.exports.getExamples = function() {
    return db.db("PandemicMOFO").collection("Good_Pictures");
}