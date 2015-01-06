/**
  背包的基类，所有背包都继承这个基类
 */
//var util = require('util');
//var Persistent = require('./persistent');
var logger = require('pomelo-logger').getLogger(__filename);
var BagSettings = require('../const/const').BagSettings;

// 根据参数创建背包，成功返回bag对象，失败bag.id = -1
var Bag = function(opts) {
    if (!opts || typeof(opts.id) != "number") {
        logger.error('create bag failed! ' + 'opts null or opts id wrong ' + JSON.stringify(opts));
        this.id = -1;
        return;
    }
    // 检查背包类型
    if (typeof(opts.type) == "undefined" || !opts.type) {
        logger.error('create bag failed! ' + 'opts type null ' + JSON.stringify(opts));
        this.id = -1;
        return;
    }
    if (typeof(BagSettings[opts.type]) == "undefined") {
        logger.error('create bag failed! ' + 'wrong bag type ' + JSON.stringify(opts));
        this.id = -1;
        return;
    }

    var itemCount = BagSettings[opts.type].setting[0];
    if (typeof(opts.itemCount) == 'number') {
        itemCount = opts.itemCount;
    }
    // 检查参数物品是否能够放入背包
    if (opts.items && (opts.items.length > itemCount)) {
        logger.error('create bag failed! ' + 'items can not fill in ' + opts.items.length + ' ' + itemCount);
        this.id = -1;
        return;
    }

    //Persistent.call(this, opts);  // 这一步可以去掉，目前不用事件驱动持久化
    this.id = opts.id;
    this.type = opts.type;
    this.itemCount = itemCount;
    this.items = opts.items || [];
};

//util.inherits(Bag, Persistent);

module.exports = Bag;





/* 背包提供的接口 */

// 根据背包格子序号获取道具,index从0开始，如果没找到返回undefined，也可能返回null
Bag.prototype.get = function(index) {
    if (typeof(index) == 'number') {
        return this.items[index];  
    } else {
        return null;
    }
};

// 给背包增加道具，成功返回序号>0，失败返回-1
Bag.prototype.addItem = function(item) {
    var index = -1;

    // 判断是否可以放入背包，后期有多种背包时，修改最后的判断函数，每类背包装的东西应该不一样
    //if (!item || !item.id || !item.type || !item.type.match(/item|equipment/)) {
    if (!item || !item.id || !item.type) {
        return index;
    }

    var match = false;
    for(var i = 1; i < BagSettings[this.type].setting.length; i++) {
        if (BagSettings[this.type].setting[i] == item.type) {
            match = true;
        }
    }
    if (!match) {
        return index;
    }

    for (var j = 0; j < this.itemCount; j++) {
        if (!this.items[j]) { // 找空格子，如果没有则增加失败
            this.items[j] = {id: item.id, type: item.type};
            index = j;
            break;
        }
    }

    if (index == -1) {
        logger.error('add item to bag failed!　' + ' ' + JSON.stringify(item) + ' ' + JSON.stringify(this));
    }

    return Number(index);
};

// 根据背包格子号删除道具，成功返回true，失败返回false
Bag.prototype.removeItem = function(index) {
    var status = false;
    if (this.items[index]) {
        delete this.items[index];
        status = true;
    }

    return status;
};

// 检查背包中是否存在某个道具，提供id和type，存在返回格子序号，不存在返回null
Bag.prototype.checkItem = function(id, type) {
    var result = null, i, item;
    for (i in this.items) {
        item = this.items[i];
        if (item.id == id && item.type === type) {
            result = Number(i);
            break;
        }
    }

    return result;
};

// 返回背包内所有的道具
Bag.prototype.all = function() {
    return this.items;
};

// 获取背包信息
Bag.prototype.getData = function() {
    var data = {};

    data.id = this.id;
    data.type = this.type;
    data.itemCount = this.itemCount;

    data.items = [];
    for(var key in this.items) {
        var item = {
            key : Number(key),
            id : this.items[key].id,
            type : this.items[key].type
        };
        data.items.push(item);
    }

    return data;
};

