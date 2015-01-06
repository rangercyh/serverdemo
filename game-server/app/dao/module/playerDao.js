var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var Player = require('../../domain/player');
var retCode = require('../../const/retCode');
var utils = require('../../util/utils');

var playerDao = module.exports;


playerDao.createPlayer = function(userid, playername, cb) {
	if (!userid || !playername) {
		cb({code: retCode.LOC.FA_CREATE_PLAYER_WRONG, msg: 'userid or playername null'}, null);
		return;
	}

	// 过滤playername是否合法

	var sql = 'insert into Player (userId, name) values(?, ?)';
	var args = [userid, playername];
	pomelo.app.get('dbclient').insert(sql, args, function(err, res) {
		if(err !== null){
			cb({code: err.number, msg: err.message}, null);
		} else {
			if (!!res && (res.affectedRows == 1)) {
				var player = new Player({id: res.insertId, name: playername, userid: userid});
				cb(null, player);
			} else {
				cb(null, retCode.FAIL);
			}
		}
	});
};

playerDao.getPlayerByUserID = function(userid, cb) {
	var sql = 'select * from Player where userId = ?';
	var args = [userid];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err !== null) {
			cb(err.message, null);
		} else {
			if (!!res && (res.length > 0)) {
				cb(null, retCode.OK, res[0]);
			} else {
				cb(null, retCode.FAIL);
			}
		}
	});
};

playerDao.getPlayerAllInfo = function(playerid, cb) {
	var sql = 'select * from Player where id = ?';
	var args = [playerid];
	var player;
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err.message, null);
			return;
		} else if (!res || res.length <= 0) {
			utils.invokeCallback(cb, 'have no player', null);
			return;
		} else{
			player = new Player(res[0]);
		}
	});
	async.parallel([
		function(callback) {
			bagDao.getBagByPlayerId(playerid, 'normal', function(err, bags) {
				if (!!err || !bags) {
					logger.error('Get bags for bagDao failed! ' + err.stack);
				}
				callback(err, bags);
			});
		}], 
		function(err) {
			player.bag = bags;
			if (!!err) {
				utils.invokeCallback(cb, err);
			} else {
				utils.invokeCallback(cb, null, player);
			}
		}
	);
};

playerDao.save = function(player, cb) {
	utils.invokeCallback(cb, null, true);
};


















// 考虑是否需要跟着把这个player所有关联数据库内容都一并删除
// 虽然测试mysql5.6发现id自增不会使用重复的，暂时先放下
/*
playerDao.deletePlayerByPlayerID = function(playerid, cb) {
	var sql = 'delete from Player where id = ?';
	var args = [playerid];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if(err !== null){
			cb(err.message, null);
		} else {
			if (!!res && (res.affectedRows == 1)) {
				cb(null, retCode.OK);
			} else {
				cb(null, retCode.FAIL);
			}
		}
	});
};

playerDao.deletePlayerByUserID = function(userid, cb) {
	var sql = 'delete from Player where userId = ?';
	var args = [userid];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if(err !== null){
			cb(err.message, null);
		} else {
			if (!!res && (res.affectedRows > 0)) {
				cb(null, retCode.OK);
			} else {
				cb(null, retCode.FAIL);
			}
		}
	});
};
*/

