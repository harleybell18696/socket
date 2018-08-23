var net              = require('net');
// var redis            = require("redis");
var querystring      = require('querystring');
var http             = require('http');
var EventEmitter     = require('events').EventEmitter;

var Conf             = require('./config');
var spaxidb          = require('./database');

var eEmitter         = new EventEmitter();



var clients          = [];
var drivers          = [];
var users            = [];
var connectedclients = [];
var config           = new Conf();

var http_server      = 'http://'+config.web.host+':'+config.web.webport;
var http_socket      = require('socket.io-client')(http_server);

// var redisclient      = redis.createClient(config.web.redisport,config.web.redishost);

/*development http_socket.emit('data',JSON.stringify({"pick_lon":"72.52519400","is_preferred":"0","country_id":"IN","payment_type":"1","driver_userid":"","user_organization_key":"8RJA81","VERSION":"1.0","car_id":"58525f574b3a7bcb109c0fa5","pick_lat":"23.03206800","device_type":"iPhone","trip_city":"Ahmedabad","userid":"5b4dc7a81b9e6237134044f4","pick_placeid":"ChIJz3R9N8qEXjkRUpu1zh_u0aw","area_specific":"1","area_price_percent":"10","pickup_address":"Mansi Cross Road, Judges Bunglow Rd, Satellite, Ahmedabad, Gujarat 380015, India"}));

return false;*/
net.createServer(function(sock) {
	sock.name                   = sock.remoteAddress +':'+ sock.remotePort;
	connectedclients[sock.name] = sock;
	var connected               = '{"type":"You are connected"}';
	sock.write(connected);

	sock.setTimeout(config.web.timeoutms);

	sock.on('timeout', function () {
	    	console.log('timeout-destroy'); 
	        // Call destroy again
	        sock.destroy(); 
	});

	sock.on('close', function (data) {
	    	console.log("close");
	    	console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
	        //sock.close(); 
	});

	sock.on('data', function(data) {
		console.log('Data-Data'+data);
		// Write the data back to the socket, the client will receive it as data from the server
		try 
		{
			var result = JSON.parse(data);
			
			////
			http_socket.emit('data',JSON.stringify(result));

			if(result.type == 'econn') 
			{
				var connected_user_id_string   = result.user_id;
				var connected_user_id_array    = connected_user_id_string.split("_");
				var connected_user_id          = connected_user_id_array[1];
				
				// Get the documents collection
				spaxidb.updateUser(connected_user_id, sock);
				
				clients[result.user_id] = sock;
			}
			else if(result.ECHO == 'ECHO')
			{
				var handshake = '{"pushtype":"heartbeat"}';
				sock.write(handshake);
			} 
			else if(result.type == 'YII_send_request_driver')
			{	
				var payload = JSON.stringify(result.payload);
				clients['d_'+result.driver_id].write(payload);
			}
			else if(result.type == 'YII_send_request_rider')
			{	
				var payload = JSON.stringify(result.payload);				
				clients['u_'+result.userid].write(payload);
			}
			else if(result.type == 'driver') 
			{
				drivers[result.iRideId] = sock;
				
				var obj = {"lat":result.lat,"long":result.long,"angle":result.angle};
				var json = JSON.stringify(obj);
				if(users[result.iRideId] != undefined) {
					
					setTimeout(function() 
					{	
						if(result.lat != "" && result.long != "" && result.lat != null && result.long != null)
						{
							var latlong = [result.lat,result.long];

							// redisclient.rpush(result.iRideId+'_trip_path',JSON.stringify(latlong));
						}
						users[result.iRideId].write(json);
					}, config.web.latlongtimeout);
				}
			} 
			else if(result.type == 'rider') 
			{
				users[result.iRideId] = sock;
			}
			else if(result.type == 'bookingrequest') 
			{
				var data = querystring.stringify({
						user_organization_key: result.user_organization_key,
						userid:result.userid,
						car_id:result.car_id,
						pickup_address:result.pickup_address,
						destination_address: result.destination_address,
						country_id: result.country_id,
						pick_lat: result.pick_lat,
						pick_lon: result.pick_lon,
						payment_type: result.payment_type,
						area_specific: result.area_specific,
						area_price_percent: result.area_price_percent,
						stripe_cust_id: result.stripe_cust_id,
						stripe_card_id: result.stripe_card_id,
						card_id: result.card_id,
						card_brand: result.card_brand,
						last_digit: result.last_digit,
						is_preferred: result.is_preferred,
						device_type: result.device_type,
						dest_lat: result.dest_lat,
						dest_lon: result.dest_lon,
						type: result.type,
						pick_placeid: result.pick_placeid,
						dest_placeid: result.dest_placeid,
						driver_userid: result.driver_userid,
						adyen_encrypt_card: result.adyen_encrypt_card,
						trip_city: result.trip_city,
						goods_type_id: result.goods_type_id,
						goods_type_text: result.goods_type_text,
						card_cvv: result.card_cvv,
						estimate_fare: result.estimate_fare,
						use_credit: result.use_credit,
						multiple_destination: result.multiple_destination,
						is_carry_box: result.is_carry_box,
						trip_params_1: result.trip_params_1,
						trip_params_2: result.trip_params_2,
						trip_params_3: result.trip_params_3,
						trip_params_4: result.trip_params_4,
						trip_params_5: result.trip_params_5,
						trip_params_6: result.trip_params_6,
						trip_params_7: result.trip_params_7,
						trip_params_8: result.trip_params_8,
						trip_params_9: result.trip_params_9,
						trip_params_10: result.trip_params_10,
						is_trip_type: result.is_trip_type,
						package_id: result.package_id,
						is_pending_amount_clearance_accepted: result.is_pending_amount_clearance_accepted,
						is_service_type: result.is_service_type,
						rate: result.rate,
						trip_way: result.trip_way,
						rule_price_id: result.rule_price_id,
						trip_day_package: result.trip_day_package,
						trip_start_date_gmt: result.trip_start_date_gmt,
						trip_end_date_gmt: result.trip_end_date_gmt,
						is_business_trip: result.is_business_trip,
						expense_code: result.expense_code,
						employee_id: result.employee_id,
						business_card_selected: result.business_card_selected,
						request_id: result.request_id,
						is_bid: result.is_bid,
						is_bid_rate: result.is_bid_rate,
				    });

				var options = {
					host  : config.web.host,
					path  : config.web.urlApi,
					method: 'POST',
					//This is the only line that is new. `headers` is an object with the headers to request
					headers: {
				  		'VERSION': result.VERSION,
				  		'ENV':"live",
				        'Content-Type': 'application/x-www-form-urlencoded',
				        'Content-Length': Buffer.byteLength(data)
					}
				};

				callback = function(response) {
					  response.setEncoding('utf8');
					  var str = ''
					  response.on('data', function (chunk) {
					    str += chunk;
					  });

					  response.on('end', function () {
					    console.log(str);
					    sock.write(str);
					    console.log('rider_response_done');

						var driver  = JSON.parse(str);
						var payload = JSON.stringify(driver.payload);
					    
					    if(driver.socket_status == '1')
					    {
					    	clients['d_'+driver.driver_id].write(payload);
					    	console.log('driver_get_request'+payload);
					    }
					    else
					    {
					    	console.log('Request sent by push');
					    }
					    
					  });
				}

				var req = http.request(options, callback);
				req.write(data);
				req.end();
			} 
			else if(result.type == 'acceptrequest') 
			{
				var payload = JSON.stringify(result.payload);
				clients['u_'+result.user_id].write(payload);
			}
			else if(result.type == 'preferred_request') 
			{
				var payload = JSON.stringify(result.payload);
				clients['d_'+result.driver_id].write(payload);
			}
			else if(result.type == 'preferred_schedule_status') 
			{
				var payload = JSON.stringify(result.payload);
				clients['u_'+result.user_id].write(payload);
			}
			else if(result.type == 'rider_cancelled_schedule_request') 
			{
				var payload = JSON.stringify(result.payload);
				clients['d_'+result.driver_id].write(payload);
			}
			else if(result.type == 'referring_compensation') 
			{
				var payload = JSON.stringify(result.payload);
				if(result.user_type == "1"){
					clients['u_'+result.user_id].write(payload);
				}else if(result.user_type == "2"){
					clients['d_'+result.driver_id].write(payload);
				}
			}
			else if(result.type == 'schedule_notification') 
			{
				var payload = JSON.stringify(result.payload);
				clients['u_'+result.user_id].write(payload);
			}
			else if(result.type == 'areanotify') 
			{
				var payload = JSON.stringify(result.payload);
				clients['u_'+result.user_id].write(payload);
			}
			else if(result.pushtype == 'is_from_admin') 
			{
				var payload = JSON.stringify(result);
				clients['d_'+result.driver_id].write(payload);
			}
			else if(result.type == 'driverArrivedRequest') 
			{
				var payload = JSON.stringify(result.payload);
				clients['u_'+result.user_id].write(payload);
			}
			else if(result.type == 'arrived') 
			{
				var payload = JSON.stringify(result.payload);
				clients['u_'+result.user_id].write(payload);
			}
			else if(result.type == 'starttrip') 
			{
				var payload = JSON.stringify(result.payload);
				clients['u_'+result.user_id].write(payload);
			}	
			else if(result.type == 'endtrip') 
			{
				var payload = JSON.stringify(result.payload);
				clients['u_'+result.user_id].write(payload);
			}
			else if(result.type == 'endtrip_admin') 
			{
				var payload = JSON.stringify(result.payload);
				clients['d_'+result.driver_id].write(payload);
			}
			else if(result.type == 'taxi_not_available') 
			{
				var payload = JSON.stringify(result.payload);
				clients['u_'+result.user_id].write(payload);
			}
			else if(result.type == 'driver_cancel_trip') 
			{
				var payload = JSON.stringify(result.payload);
				clients['u_'+result.user_id].write(payload);
			}
			else if(result.type == 'user_cancel') 
			{
				var payload = JSON.stringify(result.payload);
				clients['d_'+result.driver_id].write(payload);
			}
			else if(result.type == 'admin_cancel_send_driver') 
			{
				var payload = JSON.stringify(result.payload);
				clients['d_'+result.driver_id].write(payload);
			}
			else if(result.type == 'admin_cancel_send_rider') 
			{
				var payload = JSON.stringify(result.payload);
				clients['u_'+result.user_id].write(payload);
			}
			else if(result.type == 'change_destination') 
			{
				var payload = JSON.stringify(result.payload);
				if (result.user_type == "2") 
				{
					clients['d_'+result.driver_id].write(payload);
				} 
				else 
				{
					clients['u_'+result.user_id].write(payload);
				}
			}
			else if(result.type == 'logout') 
			{
				var payload = JSON.stringify(result);
				clients[result.userid].write(payload);
			}
			else if(result.type == 'silentpush') 
			{
				var payload = JSON.stringify(result.payload);
				clients['u_'+result.user_id].write(payload);
			}
			else if(result.type == 'hold_trip_start_notify') 
			{
				var payload = JSON.stringify(result.payload);
				clients['u_'+result.user_id].write(payload);
			}
			else if(result.type == 'ridepooling') 
			{
				var payload = JSON.stringify(result.payload);
				clients['d_'+result.driver_id].write(payload);
			}			
		} 
		catch(err) 
		{
    		console.log('ERROR ' +  err.message);
		}
	});
	
	sock.on('disconnect', function() {
      console.log('Got disconnect!');
   	});

   	sock.on('end', function() {
      console.log('Got disconnect!');
      console.log('disconnect:'+sock.remoteAddress+':'+sock.remotePort);

      		try {
				
				    /*var collection = db.collection('users');

				    collection.update({socket_remote_address:sock.remoteAddress,socket_remote_port:sock.remotePort}, {$set: {socket_remote_address:'',socket_remote_port:'',socket_status:"2"}},function (err, numUpdated) {
					  if (err) {
					    console.log(err);
					  } else if (numUpdated) {
					    console.log('Closed Updated Successfully');
					  } else {
					    console.log('No document found with defined "find" criteria!');
					  }
					});*/

					spaxidb.disconnectupdateUser(sock);
				 
					console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
			} catch(err) {
					console.log('ERROR ' +  err.message);
			}
    });

}).listen(config.web.port);

console.log('Server listening on ' + config.web.port);

// Emitter listener
process.on('uncaughtException', function(err) {
  console.log('whoops! there was an error');
  //console.log((new Date()).toUTCString() + " uncaughtException: " + err.message);
  console.log(err.stack);
});

// Uncomment to test the emitter
// eEmitter.emit('error', new Error('whoops!'));
