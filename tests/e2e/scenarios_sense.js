'use strict';

describe('Angular sense tests', function () {

    it('should load a page', function () {
        browser().navigateTo('../../tests/sandbox/e2eSenseTriggerTest.html');
        sleep(2);
        var button = 1;// left button => which=1
        //var button = 2;// right button => which=3
        //var button = 4;// middle button => which=2
        var x = 10;
        var y = 30;
        /*
        element('#scrollBox').sensewheel(button, x, y, 0, 150);
        sleep(1);
        pause();
        */
        /*
        expect(element('#img1').position()).toEqual({top:20, left:0});
        expect(element('#img21').position()).toEqual({top:673, left:9});
        expect(element('#img1').offset()).toEqual({top:28, left:8});
        expect(element('#img21').offset()).toEqual({top:673, left:9});
        expect(element('#img1').height()).toBe(151);
        expect(element('#img1').width()).toBe(1166);
        expect(element('#img21').height()).toBe(151);
        expect(element('#img21').width()).toBe(1164);
        pause();
         */
        element('#img1').sensedown(button, x, y);
        element('#img1').sensemove(button, x, y+700);
        element('#img1').senseup(button, x, y+700);
        //element('#scrollBox').sensewheel(button, x, y, 0, 120);
        //pause();
        expect(element('pre[ng-repeat="msg in msgs"]').count()).toBe(22);
        expect(element('pre[ng-repeat="msg in msgs"]:eq(0)').text()).toMatch(new RegExp('^\\s*ImgCtrl img1 init : {\\s*id : img1'));
        expect(element('pre[ng-repeat="msg in msgs"]:eq(1)').text()).toMatch(new RegExp('^\\s*ImgCtrl img2 init : {\\s*id : img2'));
        expect(element('pre[ng-repeat="msg in msgs"]:eq(2)').text()).toMatch(new RegExp('^\\s*ImgCtrl img3 init : {\\s*id : img3'));
        expect(element('pre[ng-repeat="msg in msgs"]:eq(3)').text()).toMatch(new RegExp('^\\s*ImgCtrl img4 init : {\\s*id : img4'));
        expect(element('pre[ng-repeat="msg in msgs"]:eq(4)').text()).toMatch(new RegExp('^\\s*ImgCtrl img5 init : {\\s*id : img5'));
        expect(element('pre[ng-repeat="msg in msgs"]:eq(5)').text()).toMatch(new RegExp('^\\s*ImgCtrl img12 init : {\\s*id : img12'));
        expect(element('pre[ng-repeat="msg in msgs"]:eq(6)').text()).toMatch(new RegExp('^\\s*ImgCtrl img13 init : {\\s*id : img13'));
        expect(element('pre[ng-repeat="msg in msgs"]:eq(7)').text()).toMatch(new RegExp('^\\s*ImgCtrl img21 init : {\\s*id : img21'));
        expect(element('pre[ng-repeat="msg in msgs"]:eq(8)').text()).toMatch(new RegExp('^\\s*BasicEvtCtrl onMouseStart : {.*clientY : 30\\s*clientX : 10\\s.*pageY : 30\\s*pageX : 10'));
        expect(element('pre[ng-repeat="msg in msgs"]:eq(9)').text()).toMatch(new RegExp('^\\s*ImgCtrl img1 dragStart : {.*clientX : 10\\s*clientY : 30\\s.*pageX : 10\\s*pageY : 30'));
        expect(element('pre[ng-repeat="msg in msgs"]:eq(10)').text()).toMatch(new RegExp('^\\s*DropBoxCtrl dndStart : {.*clientX : 10\\s*clientY : 30\\s.*pageX : 10\\s*pageY : 30'));
        expect(element('pre[ng-repeat="msg in msgs"]:eq(11)').text()).toMatch(new RegExp('^\\s*ImgCtrl img1 dragMove : {.*clientX : 10\\s*clientY : 730\\s.*pageX : 10\\s*pageY : 730'));
        expect(element('pre[ng-repeat="msg in msgs"]:eq(12)').text()).toMatch(new RegExp('^\\s*ImgCtrl img1 dragOverEnter : {.*clientX : 10\\s*clientY : 730\\s.*pageX : 10\\s*pageY : 730'));
        expect(element('pre[ng-repeat="msg in msgs"]:eq(13)').text()).toMatch(new RegExp('^\\s*DropBoxCtrl dropOverEnter : {.*clientX : 10\\s*clientY : 730\\s.*pageX : 10\\s*pageY : 730'));
        expect(element('pre[ng-repeat="msg in msgs"]:eq(14)').text()).toMatch(new RegExp('^\\s*DropBoxCtrl dropMove : {.*clientX : 10\\s*clientY : 730\\s.*pageX : 10\\s*pageY : 730'));
        expect(element('pre[ng-repeat="msg in msgs"]:eq(15)').text()).toMatch(new RegExp('^\\s*DropBoxCtrl dropStart : {.*clientX : 10\\s*clientY : 730\\s.*pageX : 10\\s*pageY : 730'));
        expect(element('pre[ng-repeat="msg in msgs"]:eq(16)').text()).toMatch(new RegExp('^\\s*ImgCtrl img1 dragOverLeave : {.*clientX : 10\\s*clientY : 730\\s.*pageX : 10\\s*pageY : 730'));
        expect(element('pre[ng-repeat="msg in msgs"]:eq(17)').text()).toMatch(new RegExp('^\\s*DropBoxCtrl dropOverLeave : {.*clientX : 10\\s*clientY : 730\\s.*pageX : 10\\s*pageY : 730'));
        expect(element('pre[ng-repeat="msg in msgs"]:eq(18)').text()).toMatch(new RegExp('^\\s*ImgCtrl img1 dragEnd : {.*clientX : 10\\s*clientY : 730\\s.*pageX : 10\\s*pageY : 730'));
        expect(element('pre[ng-repeat="msg in msgs"]:eq(19)').text()).toMatch(new RegExp('^\\s*DropBoxCtrl dropEnd : {.*clientX : 10\\s*clientY : 730\\s.*pageX : 10\\s*pageY : 730'));
        expect(element('pre[ng-repeat="msg in msgs"]:eq(20)').text()).toMatch(new RegExp('^\\s*ImgCtrl img1 init : {\\s*id : img1'));
        expect(element('pre[ng-repeat="msg in msgs"]:eq(21)').text()).toMatch(new RegExp('^\\s*DropBoxCtrl dndEnd : {.*clientX : 10\\s*clientY : 30\\s.*pageX : 10\\s*pageY : 30'));
    });

});
