var instancePool = require('../../../domain/instancePool');
var utils = require('../../../util/utils');
var playerDao = require('../../../dao/module/playerDao');
var bagDao = require('../../../dao/module/bagDao');


module.exports.playerLeave = function(args, cb) {
	var playerid = args.playerid;
	var player = instancePool.getPlayer(playerid);

	//utils.myPrint('playerleave ~ args = ', JSON.stringify(args));
	if (!player) {
	    logger.warn('player not in the loc ! %j', args);
	    utils.invokeCallback(cb);
	  	return;
	}

	// 玩家数据落地
  	playerDao.save(player);
  	bagDao.save(player.bag);


  	instancePool.removePlayer(playerid);
	utils.invokeCallback(cb);
};









