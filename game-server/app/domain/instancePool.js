var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);

var players;

module.exports.init = function(opts) {
	players = {};
	//setInterval(log_player, 2000);
};

module.exports.addPlayer = function(player) {
	if (!player || !player.id) {
    	return false;	}
	if (!!players[player.id]) {
		logger.error('add player twice! player : %j', player);
    	return false;
	}
	players[player.id] = player;
	return true;
};

module.exports.getPlayer = function(playerid) {
	if (!!players[playerid]) {
		return players[playerid];
	} else {
		return null;
	}
};

module.exports.removePlayer = function(playerid) {
	if (!!players[playerid]) {

		// 通知各个模块，玩家已经离开

		delete players[playerid];
	}
};

function log_player() {
	logger.info('players on gs: %j', players);
}



