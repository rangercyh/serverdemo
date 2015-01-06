var retCode = require('../../../const/retCode');
var cliCode = require('../../../const/cliCode');
var playerDao = require('../../../dao/playerDao');
var bagDao = require('../../../dao/bagDao');
var utils = require('../../../util/utils');
var channelUtil = require('../../../util/channelUtil');
var async = require('async');
var logger = require('pomelo-logger').getLogger(__filename);

module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;

	if(!this.app) {
		logger.error(app);
	}
};

// 进入游戏世界
Handler.prototype.entry = function(msg, session, next) {
	var username = msg.username;
	var password = msg.password;
	var playername = msg.playername;
	if (!username || !password) {
		next('username or password null', {code: retCode.FAIL});
		return;
	}

	var player;
	var type = msg.type;
	if (type == cliCode.REGISTER) {
		async.waterfall([
			function(cb) {	// 注册
				this.app.rpc.auth.authRemote.register(session, username, password, cb);
			},
			function(code, user, cb) {	// 创建player
				if (code !== retCode.OK) {
					next(null, {code: code});
					return;
				}
				if (!user) {
					next(null, {code: retCode.ENTRY.FA_USER_NOT_EXIST});
					return;
				}
				this.app.get('sessionService').kick(user.id, cb);	// 踢掉相同账号登陆的连接
				playerDao.createPlayer(user.id, playername, cb);
			},
			function(newPlayer) {
				if (newPlayer) {
					player = newPlayer;
					async.parallel([
						function(cb) {
							bagDao.createBag(player.id, 'normal', cb);
						}],
						function(err, result) {
							if (err) {
								logger.error('init player error : ' + JSON.stringify(player.strip()) + ' stack: ' + err.stack);
								next(null, {code: consts.LOC.FA_INIT_PLAYER_ERROR, error: err});
								return;
							}
							afterEnter(this.app, session, {id: user.id}, player.strip(), next);
						}
					);
					cb(null);
				} else {
					next(null, {code: retCode.Loc.FA_CREATE_PLAYER_WRONG});
					return;
				}
			},
			function(cb) {
				this.app.rpc.chat.chatRemote.add(session, player.userid, player.name, this.app.getServerId(), channelUtil.getGlobalChannelName(), cb);
			}],
			function(err) {
				if(err) {
					next(err, {code: retCode.FAIL});
					return;
				}
				next(null, {code: retCode.OK, player: player});
			}
		);
	} else {
		async.waterfall([
			function(cb) {
				this.app.rpc.auth.authRemote.auth(session, username, password, cb);
			},
			function(code, user, cb) {
				if (code != retCode.OK) {
					next(null, {code: code});
					return;
				}
				if (!user) {
					next(null, {code: retCode.AUTH.FA_PASSWORD_WRONG});
					return;
				}
				this.app.get('sessionService').kick(user.id, cb);	// 踢掉相同账号登陆的连接
				playerDao.getPlayerByUserID(user.id, cb);
			},
			function(myPlayer) {
				if (myPlayer) {
					player = myPlayer;
					async.parallel([
						function(cb) {
							bagDao.createBag(player.id, 'normal', cb);
						}],
						function(err, result) {
							if (err) {
								logger.error('init player error : ' + JSON.stringify(player.strip()) + ' stack: ' + err.stack);
								next(null, {code: consts.LOC.FA_INIT_PLAYER_ERROR, error: err});
								return;
							}
							afterEnter(this.app, session, {id: user.id}, player.strip(), next);
						}
					);
					cb(null);
				} else {
					next(null, {code: retCode.LOC.FA_GET_PLAYER_WRONG});
					return;
				}
			},
			function(cb) {
				this.app.rpc.chat.chatRemote.add(session, player.userid, player.name, this.app.getServerId(), channelUtil.getGlobalChannelName(), cb);
			}],
			function(err) {
				if (err) {
					next(err, {code: retCode.FAIL});
					return;
				}
				next(null, {code: retCode.OK, player: player});
			}
		);
	}
};

var afterEnter = function(app, session, user, player, next) {
	async.waterfall([
		function(cb) {
			session.bind(user.id, cb);
		},
		function(cb) {
			session.set('playerid', player.id);
			session.on('closed', onUserLeave.bind(null, this.app));
			session.pushAll(cb);
		}],
		function(err) {
			if (err) {
				logger.error('fail to load player, ' + err.stack);
				next(null, {code: retCode.FAIL});
				return;
			}
			next(null, {code: retCode.OK, player: player});
		}
	);
};

// 用户离开时session调用的函数
var onUserLeave = function (app, session, reason) {
	if(!session || !session.uid) {
		return;
	}

	//utils.myPrint('1 ~ OnUserLeave is running ...');

	// 清洗内存该用户数据

	app.rpc.loc.playerRemote.playerLeave(session, {playerid: session.get('playerid')}, function(err) {
		if (!!err) {
			logger.error('player leave error! %j', err);
		}
	});

	//app.rpc.area.playerRemote.playerLeave(session, {playerId: session.get('playerId'), instanceId: session.get('instanceId')}, function(err){
	//	if(!!err){
	//		logger.error('user leave error! %j', err);
	//	}
	//});

	// 离开频道
	app.rpc.chat.chatRemote.kick(session, session.uid, null);
};

