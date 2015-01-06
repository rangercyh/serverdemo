var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var Bag = require('../../domain/bag');
var utils = require('../../util/utils');
var BagSettings = require('../../const/const').BagSettings;

var bagDao = module.exports;




// 背包持久化接口，之后改为用sync同步方式做持久化，目前直接持久化


// 创建背包
bagDao.createBag = function(playerId, type, cb) {
	if (!type || !BagSettings[type] || !BagSettings[type].setting) {
		logger.error('createBag for bagDao failed! ' + 'type wrong ' + playerId + ' ' + type);
		utils.invokeCallback(cb, 'bag type wrong!', null);
	} else {
		var sql = 'insert into Bag (type, playerId, items, itemCount) values (?, ?, ?, ?)';
		var args = [type, playerId, '{}', BagSettings[type].setting[0]];
		
		pomelo.app.get('dbclient').insert(sql, args, function(err, res) {
			if (err) {
				logger.error('createBag for bagDao failed! ' + 'mysql error  ' + err.stack);
				utils.invokeCallback(cb, err, null);
			} else {
				var bag = new Bag({ id: res.insertId, type: type});
				if (bag.id != -1) {
					utils.invokeCallback(cb, null, bag);
				} else {
					logger.error('createBag for bagDao failed! ' + 'bag data wrong ' + playerId + ' ' + type + ' ' + res.insertId);
					utils.invokeCallback(cb, 'create bag failed!', null);
				}
			}
		});	
	}
};

// 从数据库读取玩家背包，只在内存背包信息不在时才调用，否则岂不是十分消耗,如果type不传则把所有的背包取出来
bagDao.getBagByPlayerId = function(playerId, type, cb) {
	if (type) {
		if (!BagSettings[type] || !BagSettings[type].setting) {
			logger.error('getBagByPlayerId for bagDao failed! ' + 'type wrong ' + playerId + ' ' + type);
			utils.invokeCallback(cb, new Error('bag type wrong!'), null);
		}
	} else {
		var sql;
		var args;
		if (type) {
			sql = 'select * from Bag where playerId = ? and type = ?';
			args = [playerId, type];
		} else {
			sql = 'select * from Bag where playerId = ?';
			args = [playerId];
		}

		pomelo.app.get('dbclient').query(sql, args, function(err, res) {
			if (err) {
				logger.error('getBagByPlayerId for bagDao failed! ' + 'mysql error  ' + err.stack);
				utils.invokeCallback(cb, err, null);
			} else {
				if (res && res.length > 0) {
					var bags = [];
					for (var i = 0; i < res.length; i++) {
						var result = res[i];
						var bag = new Bag({ id: result.id, type: type, itemCount: result.itemCount, items: JSON.parse(result.items) });
						if (bag.id != -1) {
							bags.push(bag);
						} else {
							logger.error('getBagByPlayerId for bagDao failed! ' + 'create bag error  ' + playerId + ' ' + result.id + ' ' + type + ' ' + result.itemCount + ' ' + JSON.parse(result.items));
						}
					}
					utils.invokeCallback(cb, null, bags);
				} else {
					logger.error('bags not exist');
					utils.invokeCallback(cb, new Error(' bags not exist '), null);
				}
			}
		});
	}
};

// 更新背包
bagDao.save = function(bag, cb) {
	if ((typeof(bag) == 'object') && (bag.length > 0)) {
		var sql1 = 'update Bag set items = case id ';
		var sql2, sql3;
		for (var i = 0; i < bag.length; i++) {
			var items = bag[i].items;
			if (typeof(items) !== 'string') {
				items = JSON.stringify(items);
			}
			
			sql2 = sql2 + ' when ' + bag.id + ' then ' + items;
			sql3 = sql3 + bag.id + ',';
		}
		sql2 = sql2 + ' end where id in(' + sql3.substring(0, sql3.length - 1) + ')';
		sql1 = sql1 + sql2;
		pomelo.app.get('dbclient').query(sql1, null, function(err, res) {
			if (err) {
				logger.error('write mysql failed!　' + sql1 + ' ' + JSON.stringify(bag));
			}
			
			utils.invokeCallback(cb, !!err);
		});	
	}
};

// 删除所有背包
bagDao.destroy = function(playerId, cb) {
	var sql = 'delete from Bag where playerId = ?';
	var args = [playerId];

	pomelo.app.dbclinet.query(sql, args, function(err, res) {
		utils.invokeCallback(cb, err, res);
	});
};

