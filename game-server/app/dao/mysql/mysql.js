// 导出名字
var sqlclient = module.exports;

var _pool;

var SQL_P = {};

/*
 * 初始化mysql的池子
 */
SQL_P.init = function(app){
	_pool = require('./dao-pool').createMysqlPool(app);
};

/**
 * 执行sql语句
 */
SQL_P.query = function(sql, args, cb){
	_pool.acquire(function(err, client) {
		if (!!err) {
			console.error('[sqlqueryErr] '+err.stack);
			//改为log
			return;
		}
		client.query(sql, args, function(err, res) {
			_pool.release(client);	// 执行完了回调记得释放池子连接
			cb(err, res);
		});
	});
};

/**
 * 关掉池子
 */
SQL_P.shutdown = function(){
	_pool.destroyAllNow();
};

/**
 * 导出初始化接口
 */
sqlclient.init = function(app) {
	if (!!_pool){
		return sqlclient;
	} else {
		SQL_P.init(app);
		sqlclient.insert = SQL_P.query;
		sqlclient.update = SQL_P.query;
		sqlclient.delete = SQL_P.query;
		sqlclient.query = SQL_P.query;
		return sqlclient;
	}
};

/**
 * 导出关闭接口
 */
sqlclient.shutdown = function(app) {
	SQL_P.shutdown(app);
};






