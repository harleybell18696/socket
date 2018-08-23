var mongodb = require('mongodb');
var Conf = require('./config');
const http = require("http");
var config = new Conf();

var MongoClient = mongodb.MongoClient;
//var url = 'mongodb://' + config.mongodb.ip + ':' + config.mongodb.port + '/' + config.mongodb.db;

var url = config.web.mongodburl;

var spaxidb = function () {
    var db = null;

    MongoClient.connect(url, function (err, database) {
        if (err) {
            console.log('Unable to connect to the mongoDB server. Error:', err);
        } else {
            console.log('name ' + database);
            db = database;
        }
    });

    function findOne(userid) {
        return new Promise(resolve => {
            var collection = db.collection('users');
            var o_id = new mongodb.ObjectID(userid);

            collection.find({'_id': o_id}, {'name': true}).toArray(function (err, colresult) {
                if (err) {
                    resolve(err);
                } else if (colresult) {
                    resolve(colresult);
                }
            });
        });


    }

    function updateUser(connected_user_id, sock) {

        var collection = db.collection('users');
        var o_id = new mongodb.ObjectID(connected_user_id);

        collection.update({'_id': o_id}, {$set: {socket_remote_address: sock.remoteAddress, socket_remote_port: sock.remotePort, socket_status: "1", temp_offline_online_status: "1"}}, function (err, numUpdated) {
            if (err) {
                console.log(err);
            } else if (numUpdated) {
                console.log('connection Updated Successfully');
            } else {
                console.log('No document found with defined "find" criteria!');
            }
        });
    }

    function disconnectupdateUser(sock) {

        var collection = db.collection('users');

        collection.update({socket_remote_address: sock.remoteAddress, socket_remote_port: sock.remotePort}, {$set: {socket_remote_address: '', socket_remote_port: '', socket_status: "2"}}, function (err, numUpdated) {
            if (err) {
                console.log(err);
            } else if (numUpdated) {
                console.log('connection Updated Successfully');
            } else {
                console.log('No document found with defined "find" criteria!');
            }
        });
    }



    return {
        updateUser: updateUser,
        findOne: findOne,
        disconnectupdateUser: disconnectupdateUser
    }
}

module.exports = spaxidb();
