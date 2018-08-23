var config                = {};

config.mongodb            = {};
config.redis              = {};
config.web                = {};

config.mongodb.ip         = 'localhost';
config.mongodb.port       = 27017;
config.mongodb.db         = 'spaxi';
//config.mongodb.replicaSet = 's-1';

config.web.port           = 6869;
config.web.webport        = 6969;

config.web.timeoutms      = 60000;
config.web.latlongtimeout = 3000;

// config.web.redisport      = 6379;
// config.web.redishost      = 'localhost';

config.web.host           = 'localhost';
config.web.urlApi         = '/spaxiyii2/v1.0/api/bookingrequestforsocket';

config.web.mongodburl     = 'mongodb://localhost:27017/spaxi';

module.exports            = function(){
    switch(process.env.NODE_ENV){
        case 'development':
            return config;

        case 'production':
			config.mongodb.ip         = 'localhost';
			config.mongodb.port       = 27017;
			config.mongodb.db         = 'spaxi';
			//config.mongodb.replicaSet = 's-1';

			config.web.urlApi         = '/v1.0/api/bookingrequestforsocket';

            config.web.redisport      = 6379;
            config.web.redishost      = 'driverlocations-001.nmhqy7.0001.usw1.cache.amazonaws.com';

            config.web.mongodburl     = 'mongodb://spaxi:sHTmu4AfgcbBZuxK@54.183.144.120:27017/spaxi';
			
            return config;

        default:
            return config;

    }
};
