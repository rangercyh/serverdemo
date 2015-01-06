module.exports = {
    BagSettings: {
        // 背包类型：【背包基础格子数，允许存放的类型】,不要超过20个字符
        normal: {
            setting: [20,'useitem','taskitem','equip','diamond']
        }
    },

    BagType: {
        NORMAL: 'normal'
    },

    ItemType: {
        USEITEM: 'useitem',
        TASKITEM: 'taskitem',
        EQUIP: 'equip',
        DIAMOND: 'diamond'
    },

    Event: {
        chat: 'onChat'
    }
};
