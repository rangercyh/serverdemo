var EventEmitter = require('events').EventEmitter;
var util = require('util');

// Persistent的意思是提供一个持久化到数据库的接口，所有需要持久化的数据都需要继承persistent
// 原本是想做成端游那样每隔一段时间做持久化的，但是一个基于UI的游戏，貌似不需要这么复杂
// 留着等以后做MMO的时候用
var Persistent = function(opts) {
	this.id = opts.id;
	this.type = opts.type;
	EventEmitter.call(this);
};

util.inherits(Persistent, EventEmitter);

module.exports = Persistent;

// 通过save事件发起持久化
Persistent.prototype.save = function() {
	this.emit('save');
};

