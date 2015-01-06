var retCode = require('../../../const/retCode');
var comm = require('../../../util/comm');
var User = require('../../../domain/user');

module.exports = function(app) {
	return new Remote(app);
};

var Remote = function(app) {
	this.app = app;
};

// auth服务器上缓存一份username和playerid的表，作为快速返回gate分配con的凭证
// 到con的时候还需要再次访问数据库生成正式的user

Remote.prototype.register = function(username, password, cb) {
	// 检查username是否符合规范
	if (!comm.checkUsername(username)) {
		cb('username not match pattern', retCode.AUTH.FA_USERNAME_NOT_PATTERN);
		return;
	}
	// 检查username是否重复，注意是检查数据库而非缓存，如果检查完发现有则覆盖缓存，没有就清这条缓存
	var sql = 'select * from User where username = ?';
	var args = [username];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err !== null) {
			cb(err.message, null);
		} else {
			if (!!res && res.length > 0) {
				cb(null, retCode.AUTH.FA_USERNAME_CONFLICT);
			}
		}
	});
	// 检查password是否符合规范

	// 在数据库里写入这个新user的数据，缓存在auth服务器上
	var sql1 = 'insert into User (username, password) values(?, ?)';
	var args1 = [username, password];
	pomelo.app.get('dbclient').insert(sql1, args1, function(err, res) {
		if (err !== null) {
			cb(err.message, null);
		} else {
			if (!!res && (res.affectedRows == 1)) {
				var user = new User({id: res.insertId, username: username, password: password});
				cb(null, retCode.OK, user);
			} else {
				cb(null, retCode.FAIL);
			}
		}
	});
};

Remote.prototype.auth = function(username, password, cb) {
	var sql = 'select * from User where username = ?';
	var args = [username];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if(err !== null) {
			cb(err.message, null);
		} else {
			if (!!res && res.length == 1) {
				var data = res[0];
				if (data.password == password) {
					var user = new User({ id: res.insertId, username: username, password: password });
					cb(null, retCode.OK, user);
				} else {
					cb(null, retCode.FAIL);
				}
			} else {
				cb(null, retCode.FAIL);
			}
		}
	});
};


