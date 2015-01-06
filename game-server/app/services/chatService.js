
var retCode = require('../const/retCode');
var utils = require('../util/utils');
var Event = require('../const/const').Event;



var ChatService = function(app) {
	this.app = app;
	this.uidMap = {};	// 由uid可以方便查询用户的serverid
	this.nameMap = {};	// 由name可以方便查询用户的uid，方便对于用户名进行push
	this.channelMap = {};	// 用uid做key，保存某个玩家所在的所有频道信息，便于在用户离开时一并离开所有频道
};

module.exports = ChatService;


// 检查是否在频道内
var checkDuplicate = function(app, uid, channelName) {
	return !!app.channelMap[uid] && !!app.channelMap[uid][channelName];
};

// 添加纪录
var addRecord = function(self, uid, name, serverid, channelName) {
	var record = {uid: uid, name: name, serverid: serverid};
	self.uidMap[uid] = record;
	self.nameMap[name] = record;
	if (self.channelMap[uid]) {
		self.channelMap[uid] = {};
	}
	self.channelMap[uid][channelName] = true;
};

// 删除记录
var removeRecord = function(self, uid, channelName) {
	delete self.channelMap[uid][channelName];
	// 如果玩家不在任何频道了，就删除玩家的全部记录
	if (utils.getSize(self.channelMap[uid])) {
		return;
	}

	clearRecords(self, uid);
};

// 清空玩家记录
var clearRecords = function(self, uid) {
	delete self.channelMap[uid];
	var record = self.uidMap[uid];
	if (!record) {
		return;
	}
	delete self.uidMap[uid];
	delete self.nameMap[record.name];
};

// 添加
ChatService.prototype.add = function(uid, serverid, name, channelName) {
	// 检查是否已经在频道内了
	if (checkDuplicate(this.app, uid, channelName)) {
		return retCode.OK;
	}

	var channel = this.app.get('channelService').getChannel(channelName, true);	// 如果没有就创建
	if (!channel) {
		return retCode.CHAT.FA_CHAT_CREATE;
	}

	channel.add(uid, serverid);
	addRecord(this, uid, name, serverid, channelName);

	return retCode.OK;
};

// 玩家离开频道
ChatService.prototype.leave = function(uid, channelName) {
	var record = this.uidMap[uid];
	var channel = this.app.get('channelService').getChannel(channelName);
	if (record && channel) {
		channel.leave(uid, record.serverid);
	}

	removeRecord(this, uid, channelName);
};

// 踢玩家出所有频道，如果只是踢出某个频道就调leave
ChatService.prototype.kick = function(uid) {
	var channelNames = this.channelMap[uid];
	var record = this.uidMap[uid];

	if (channelNames && record) {
		var channel;
		for (var name in channelNames) {
			channel = this.app.get('channelService').getChannel(name);
			if (channel) {
				channel.leave(uid, record.serverid);
			}
		}
	}

	clearRecords(this, uid);
};

// 向某个频道发消息
ChatService.prototype.pushByChannel = function(channelName, msg, cb) {
	var channel = this.app.get('channelService').getChannel(channelName);
	if (!channel) {
		cb(new Error('channel ' + channelName + ' does not exist'));
		return;
	}

	channel.pushMessage(Event.chat, msg, cb);
};

// 根据玩家名向某个玩家发送消息
ChatService.prototype.pushByPlayername = function(playname, msg, cb) {
	var record = this.nameMap[playname];
	if (!record) {
		cb(null, retCode.CHAT.FA_CHAT_NOT_IN_CHANNEL);
		return;
	}
	this.app.get('channelService').pushMessageByUids(Event.chat, msg, [{uid: record.uid, serverid: record.serverid}], cb);
};


