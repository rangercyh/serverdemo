var pomelo = require('pomelo');
var instancePool = require('./app/domain/instancePool');
var ChatService = require(./app/services/chatService);
//var sync = require('pomelo-sync-plugin');	// 持久化插件


var app = pomelo.createApp();
app.set('name', 'server-demo');

// 全局错误处理的地方
app.set('errorHandler', function(err, msg, resp, session, cb) {

});


// 全局配置
app.configure('production|development', function() {
	//app.enable('systemMonitor');	--在老的linux系统上，要么没有sysstat或者版本过低，坑爹的功能，居然依赖系统
	app.loadConfig('mysql', app.getBase() + '/config/mysql.json');
});

// auth配置
app.configure('production|development', 'auth', function() {

});


// chat配置
app.configure('production|development', 'chat', function() {
	app.set('chatService', new ChatService(app));
});

 // connector配置
app.configure('production|development', 'connector', function() {
	app.set('connectorConfig',
	{
		connector : pomelo.connectors.hybridconnector,
		heartbeat : 3,
		useProtobuf : true,
		handshake : function(msg, cb){
			cb(null, {});
		}
	});
});

 // gate配置
app.configure('production|development', 'gate', function() {
	app.set('connectorConfig',
	{
		connector : pomelo.connectors.hybridconnector,
		heartbeat: 3,
		useProtobuf : true
	});
});

 // loc配置
app.configure('production|development', 'loc', function() {
	instancePool.init();
});

 // mail配置
app.configure('production|development', 'mail', function() {

});

// 给服务器进程配置数据库信息
app.configure('production|development', 'auth|connector|loc|chat|mail', function() {
	// 初始化数据库池子和sync的方法，这样配置之后，采用
	// app.get('sync').exec('bagSync.updateBag', player.bag.id, player.bag);
	// 上行代码就给sync添加了一个持久化方法，由sync自己去每隔一段时间持久化
	var dbclient = require('./app/dao/mysql/mysql').init(app);
	app.set('dbclient', dbclient);
  	//app.use(sync, {sync: {path:__dirname + '/app/dao/mapping', dbclient: dbclient}});	//暂时不适用sync工具
});

// start
app.start();

// Uncaught exception handler
process.on('uncaughtException', function(err) {
	console.error(' Caught exception: ' + err.stack);
	// 改为log
});
