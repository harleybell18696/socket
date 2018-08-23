var server = require('http').createServer(handler);
var io = require('socket.io')(server);

var Conf = require('./config');
var spaxidb = require('./database');

var clients = [];
var drivers = [];
var users = [];

var config = new Conf();

var socket_client = 'http';

server.listen(config.web.webport, function () {
    console.log('Server listening at port %d', config.web.webport);
});

function handler(req, res) {
    console.log('Server listening Error: ', res);
}




io.on('connection', function (sock) {
    sock.name = sock.handshake.address + ':' + sock.handshake.issued;
    console.log("Client connected = " + sock.handshake.address + ":" + sock.handshake.issued);
    sock.emit('connection', {data: {success: 'true', message: 'Successfully connected with socket server'}});


    /*Static code of sock.on*/
    sock.on('data', async function (data) {

        try {
            var result = JSON.parse(data);
            drivers[result.user_organization_key] = sock;
            drivers[result.driverID] = sock;

            if (result.type == 'driver_listen_socket') {
                if (drivers[result.driverID] != undefined) {
                    drivers[result.driverID].emit('Socket_listening', {data: {success: 'true', message: 'Driver Socket Listening Successfully. '}});
                }
            } else if (result.type == 'listen_socket') {
                drivers[result.user_organization_key].emit('Socket_listening', {data: {success: 'true', message: 'Socket Listening Successfully. '}});
            } else if (result.type == 'bookingrequest') {
                var userid = result.userid;
                var mongoResult = await spaxidb.findOne(userid);
                //console.log("***********");console.log(req);console.log(data);console.log("***********");
                // console.log("=======> " + JSON.stringify(data));
                drivers['orgkey_' + result.user_organization_key].emit('bookingrequest', {data: {'request_id': result.userid, 'user_name': mongoResult[0].name, 'pickup_address': result.pickup_address}});


            } else if (result.type == 'acceptrequest' || result.pushtype == 'is_from_admin') {
                drivers['orgkey_' + result.user_organization_key].emit('acceptrequest', {data: {'request_id': result.user_id, 'user_name': result.username, 'pickup_address': result.pickup_address, 'request_date': result.request_date}});
            } else if (result.type == 'driver') {
                var obj = {"lat": result.lat, "long": result.long, "angle": result.angle};
                var json = JSON.stringify(obj);
                console.log(' Type Driver: ' + json);

                if (drivers[result.iDriverId] != undefined) {
                    console.log(' Trip Route : ' + result.iDriverId);
                    drivers[result.iDriverId].emit('driverroute', {data: {'driver_id': result.iDriverId, 'latitude': result.lat, 'longitude': result.long, "angle": result.angle}});
                }
            } else if (result.type == 'starttrip') {
                drivers['orgkey_' + result.user_organization_key].emit('starttrip', {data: {'request_id': result.user_id, 'user_name': result.username, 'pickup_address': result.pickup_address, 'request_date': result.request_date}});
            } else if (result.type == 'endtrip') {
                drivers['orgkey_' + result.user_organization_key].emit('endtrip', {data: {'request_id': result.payload.request_id, 'user_name': result.username, 'pickup_address': result.pickup_address, 'request_date': result.request_date}});
            } else if (result.type == 'driver_cancel_trip' || result.type == 'user_cancel') {
                drivers['orgkey_' + result.user_organization_key].emit(result.type.replace('_', ''), {data: {'request_id': result.user_id, 'user_name': result.username, 'pickup_address': result.pickup_address, 'request_date': result.request_date}});
            } else if (result.type == 'silentpush') {
                drivers['orgkey_' + result.user_organization_key].emit('silentpush', {data: {'request_id': result.user_id, 'driverlongitude': result.driverlongitude, 'driverlatitude': result.driverlatitude, 'onoffline_status': result.onoffline_status, 'drivername': result.drivername, 'driverphone': result.driverphone}});
            }

            console.log(result.type + ' : ' + JSON.stringify(result));
        } catch (err) {
            console.log('ERROR ' + err.message);
        }
    });

    sock.on('disconnect', function () {
        drivers.forEach(function (driver, index) {
            if (driver == sock) {
                delete drivers[index]
            }
        });
        console.log("disconnect from http");
    });
});

process.on('uncaughtException', function (err) {
    console.log('whoops! there was an error');
    // console.log((new Date()).toUTCString() + " uncaughtException: " + err.message);
    console.log(err.stack);
});