var playerDao = require('../../../dao/playerDao');
var utils = require('../../../util/utils');
var retCode = require('../../../const/retCode');
var async = require('async');
var logger = require('pomelo-logger').getLogger(__filename);
var instancePool = require('../../../domain/instancePool');

var handler = module.exports;


handler.enterScene = function(msg, session, next) {
	var playerid = session.get('playerid');
	//utils.myPrint("1 ~ EnterScene: playerid = ", playerid);
	playerDao.getPlayerAllInfo(playerid, function(err, player) {
		if (err || !player) {
			logger.error('Get player for enterScene failed! ' + err.stack);
			next(new Error('fail to enter scene'), {
				route: msg.route,
				code: retCode.LOC.FA_CANNOT_ENTER_SCENE
			});
			return;
		}

		var data = {
			curPlayer: player.getInfo()
		};
		next(null, data);

		if (!instancePool.addPlayer(player)) {
			logger.error("Add player to scene faild! : " + player.id);
      		next(new Error('fail to add player into area'), {
       			route: msg.route,
       			code: retCode.LOC.FA_CANNOT_ENTER_SCENE
      		});
      		return;
		}
	});
};

handler.dropItem = function(msg, session, next) {
	var playerid = session.area.getPlayer(session.get('playerId'));
	var player = instancePool.getPlayer(playerid);
	if (player) {
		var bag;
		for(var i = 0; i < player.bag.length; ++i) {
			if (msg.bagid == player.bag[i].id) {
				bag = player.bag[i];
				break;
			}
		}
		if (bag) {
			player.bag.removeItem(msg.index);
		} else {
			logger.error('no such bag: %j ' + JSON.parse(player) + ' ' + JSON.parse(msg));
		}
		next(null, {status: true});
	} else {
		next(new Error('no player ' + playerid), {
			route: msg.route,
			code: retCode.LOC.FA_GET_PLAYER_WRONG
		});
	}
};

handler.addItem = function(msg, session, next) {
	var playerid = session.area.getPlayer(session.get('playerId'));
	var player = instancePool.getPlayer(playerid);
	if (player) {
		var bag;
		for(var i = 0; i < player.bag.length; ++i) {
			if (msg.bagid == player.bag[i].id) {
				bag = player.bag[i];
				break;
			}
		}
		var bagIndex = -1;
		if (bag) {
			bagIndex = player.bag.addItem(msg.item);
		} else {
			logger.error('no such bag: %j ' + JSON.parse(player) + ' ' + JSON.parse(msg));
		}
		next(null, {bagIndex: bagIndex});
	} else {
		next(new Error('no player ' + playerid), {
			route: msg.route,
			code: retCode.LOC.FA_GET_PLAYER_WRONG
		});
	}
};



