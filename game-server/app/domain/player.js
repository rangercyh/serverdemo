var Player = function(opts) {
	this.id = opts.id;
	this.name = opts.name;
	this.userid = opts.userid;
	this.bag = opts.bag;
};

module.exports = Player;

Player.prototype.getInfo = function() {
	var playerData = this.strip();
  	playerData.bag = this.bag.getData();

  	return playerData;
};

// player数据压缩成json格式
Player.prototype.strip = function() {
	return {
		id: this.id,
		name: this.name,
		userid: this.userid
	};
};
