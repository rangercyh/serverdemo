var should = require('should');
var Bag = require('../app/domain/bag');


describe('Bag domain test', function() {

    it('create bag', function() {
        var bag1 = new Bag();
        var bag2 = new Bag(123);
        var bag3 = new Bag('asdf');
        bag1.id.should.equal(-1);
        bag2.id.should.equal(-1);
        bag3.id.should.equal(-1);

        var bag4 = new Bag({  });
        var bag5 = new Bag({ id:1 });
        var bag6 = new Bag({ id:9999999 });
        bag4.id.should.equal(-1);
        bag5.id.should.equal(-1);
        bag6.id.should.equal(-1);

        var bag7 = new Bag({ id:1, type:'asdf' });
        var bag8 = new Bag({ id:2, type:'' });
        var bag9 = new Bag({ id:3, type:'123' });
        bag7.id.should.equal(-1);
        bag8.id.should.equal(-1);
        bag9.id.should.equal(-1);

        var bag10 = new Bag({ id:1, type:'normal' });
        var bag11 = new Bag({ id:2, type:'normal', itemCount:0 });
        var bag12 = new Bag({ id:3, type:'normal', itemCount:999999 });
        var bag13 = new Bag({ id:4, type:'normal', itemCount:20, items:[] });
        var bag14 = new Bag({ id:5, type:'normal', itemCount:20, items:[{id:1, type:'useitem'}, {id:2, type:'diamond'}, {id:3, type:'equip'}] });
       
        bag10.id.should.equal(1);
        bag10.type.should.equal('normal');
        bag10.itemCount.should.equal(20);
        bag10.items.should.eql([]);

        bag11.id.should.equal(2);
        bag11.type.should.equal('normal');
        bag11.itemCount.should.equal(0);
        bag11.items.should.eql([]);

        bag12.id.should.equal(3);
        bag12.type.should.equal('normal');
        bag12.itemCount.should.equal(999999);
        bag12.items.should.eql([]);

        bag13.id.should.equal(4);
        bag13.type.should.equal('normal');
        bag13.itemCount.should.equal(20);
        bag13.items.should.eql([]);

        bag14.id.should.equal(5);
        bag14.type.should.equal('normal');
        bag14.itemCount.should.equal(20);
        bag14.items.should.eql([{id:1, type:'useitem'}, {id:2, type:'diamond'}, {id:3, type:'equip'}]);

        var bag15 = new Bag({ id:1, type:'normal', itemCount:1, items:[{id:1, type:'useitem'}, {id:2, type:'diamond'}] });
        bag15.id.should.equal(-1);
    });

    it('add item', function() {
        var bag16 = new Bag({ id:1, type:'normal' });
        var add1 = bag16.addItem();
        var add2 = bag16.addItem(1);
        var add3 = bag16.addItem({});
        var add4 = bag16.addItem({id:1});
        var add5 = bag16.addItem({id:1, type:'haha'});

        add1.should.equal(-1);
        add2.should.equal(-1);
        add3.should.equal(-1);
        add4.should.equal(-1);
        add5.should.equal(-1);

        var add6 = bag16.addItem({id:1, type:'useitem'});
        add6.should.be.above(-1);
        add6.should.be.below(20);
        bag16.items[add6].should.eql({id:1, type:'useitem'});

        var bag17 = new Bag({ id:2, type:'normal', itemCount:0 });
        var add7 = bag17.addItem({id:1, type:'useitem'});
        add7.should.equal(-1);
    });

    it('remove item', function() {
        var bag18 = new Bag({ id:1, type:'normal' });
        var remove1 = bag18.removeItem();
        var remove2 = bag18.removeItem('asdf');
        var remove3 = bag18.removeItem(100000);
        var remove4 = bag18.removeItem(0);

        remove1.should.be.false;
        remove2.should.be.false;
        remove3.should.be.false;
        remove4.should.be.false;

        bag18.addItem({id:1, type:'useitem'});
        var remove5 = bag18.removeItem(2);
        remove5.should.be.false;
        bag18.items.should.eql([{id:1, type:'useitem'}]);

        var remove6 = bag18.removeItem(0);
        remove6.should.be.true;
        bag18.items.should.eql([]);
    });

    it('get item', function() {
        var bag19 = new Bag({id:1, type:'normal'});
        var item1 = bag19.get();
        var item2 = bag19.get(0);
        (item1 === null).should.be.true;
        (item2 === undefined).should.be.true;

        bag19.addItem({id:1, type:'useitem'});
        var item3 = bag19.get(0);
        item3.should.eql({id:1, type:'useitem'});
    });

    it('check item', function() {
        var bag20 = new Bag({id:1, type:'normal'});
        var check1 = bag20.checkItem();
        var check2 = bag20.checkItem(1);
        var check3 = bag20.checkItem(1, 'useitem');

        (check1 === null).should.be.true;
        (check2 === null).should.be.true;
        (check3 === null).should.be.true;

        bag20.addItem({id:1, type:'useitem'});
        var check4 = bag20.checkItem(1);
        var check5 = bag20.checkItem(1, 'diamond');
        var check6 = bag20.checkItem(2, 'useitem');
        var check7 = bag20.checkItem(1, 'useitem');

        (check4 === null).should.be.true;
        (check5 === null).should.be.true;
        (check6 === null).should.be.true;
        check7.should.equal(0);
    });

    it('get bag data', function() {
        var bag21 = new Bag({id:1, type:'normal'});
        var bagdata1 = bag21.getData();
        bagdata1.should.be.type('object');
        bagdata1.id.should.equal(1);
        bagdata1.type.should.equal('normal');
        bagdata1.itemCount.should.equal(20);
        bagdata1.items.should.eql([]);

        bag21.addItem({id:1, type:'useitem'});
        bag21.addItem({id:2, type:'equip'});
        var bagdata2 = bag21.getData();
        bagdata2.items.should.eql([{key:0, id:1, type:'useitem'}, {key:1, id:2, type:'equip'}]);
    });
});
