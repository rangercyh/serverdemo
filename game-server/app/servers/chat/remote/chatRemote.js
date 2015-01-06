module.exports = function(app) {
	return new ChatRemote(app, app.get('chatService'));
};

var ChatRemote = function(app, chatService) {
	this.app = app;
	this.chatService = chatService;
}

ChatRemote.prototype.add = function(uid, playname, serverid, channelName, cb) {
	var code = this.chatService.add(uid, playname, serverid, channelName);
	cb(null, code);
};

ChatRemote.prototype.leave = function(uid, channelName, cb) {
	this.chatService.leave(uid, channelName);
	cb();
};

ChatRemote.prototype.kick = function(uid, cb) {
	this.chatService.kick(uid);
	cb();
};
