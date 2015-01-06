var retCode = require('../../../const/retCode');
var dispatcher = require('../../../util/dispatcher');

/**
 * Gate handler that dispatch user to connectors.
 */
//module.exports = function(app) {
//	return new Handler(app);
//};

module.exports = Handler;

var Handler = function(app) {
	this.app = app;
	this.count = 0;	// 因为这个连接数，使得gate变成有状态的了，不过依然是轻状态的
};

// 这个入口是客户端第一个调用服务端的连接函数，之后可能需要考虑客户端认证、客户端版本的处理等
// 现在暂时都不做考虑
// 要求客户端连接把用户名和密码发送过来
// msg应该是加密过的，否则账号、密码就泄漏了
Handler.prototype.queryEntry = function(msg, session, next) {
	var username = msg.username;
	var password = msg.password;
	if(!username || !password) {
		next(null, {code: retCode.FAIL});
		return;
	}

	var connectors = this.app.getServersByType('connector');
	if(!connectors || connectors.length === 0) {
		next(null, {code: retCode.GATE.FA_NO_SERVER_AVAILABLE});
		return;
	}

	// 暂时做一个简单的负载均衡，根据当前连接数，需要测试一下这个count在并发时候是否是线程安全的
	var res = dispatcher.dispatch(this.count, connectors);
	this.count++;
	if (this.count > 99999) {
		this.count = 0;
	}
	next(null, {code: retCode.OK, host: res.host, port: res.clientPort});
};
