'use strict';

describe('a4p', function () {

    describe('Resize', function () {

        describe('Regexp', function () {

            var expr = null;
            //var result = null;
            var nameExpr = "[a-zA-Z_][a-zA-Z0-9_-]*";
            var nodeExpr = "(parentNode|previousElementSibling|nextElementSibling|firstElementChild|lastElementChild)";
            var attrExpr = "(clientTop|clientLeft|clientWidth|clientHeight|offsetTop|offsetLeft|offsetWidth|offsetHeight)";
            var subPathExpr = "(\\."+nodeExpr+")*";
            var atNameExpr=new RegExp("("+nameExpr+")", "g");
            var atNodeExpr=new RegExp(nodeExpr, "g");
            var atAttrExpr=new RegExp(attrExpr, "g");
            var atPathExpr=new RegExp("@(("+nodeExpr+subPathExpr+")\\.)?"+attrExpr, "g");
            var atResizerExpr=new RegExp("@("+nameExpr+")("+subPathExpr+")\\."+attrExpr, "g");
            var atPathExpr2=new RegExp("@(("+nodeExpr+subPathExpr+")\\.)?"+attrExpr);
            var atResizerExpr2=new RegExp("@("+nameExpr+")("+subPathExpr+")\\."+attrExpr);

            var simple=new RegExp("at");
            var result = simple.test('Dogs and cats are not dogs');
            expect(result).toEqual(true);
            result = simple.exec('Dogs and cats are not dogs');
            expect(result.length).toEqual(1);
            expect(result[0]).toEqual('at');
            expect(result.index).toEqual(10);
            expr = 'Dogs and cats are not dogs';
            result = expr.replace(simple, "b");
            expect(expr).toEqual("Dogs and cats are not dogs");
            expect(result).toEqual("Dogs and cbs are not dogs");

            simple=new RegExp("(a)t");
            result = simple.test('Dogs and cats are not dogs');
            expect(result).toEqual(true);
            result = simple.exec('Dogs and cats are not dogs');
            expect(result.length).toEqual(2);
            expect(result[0]).toEqual('at');
            expect(result[1]).toEqual('a');
            expect(result.index).toEqual(10);
            expr = 'Dogs and cats are not dogs';
            result = expr.replace(simple, "b");
            expect(expr).toEqual("Dogs and cats are not dogs");
            expect(result).toEqual("Dogs and cbs are not dogs");

            simple=new RegExp("(a.).");
            result = simple.test('Dogs and cats are not dogs');
            expect(result).toEqual(true);
            result = simple.exec('Dogs and cats are not dogs');
            expect(result.length).toEqual(2);
            expect(result[0]).toEqual('and');
            expect(result[1]).toEqual('an');
            expect(result.index).toEqual(5);
            expr = 'Dogs and cats are not dogs';
            result = expr.replace(simple, "b");
            expect(expr).toEqual("Dogs and cats are not dogs");
            expect(result).toEqual("Dogs b cats are not dogs");

            simple=new RegExp("(a.).", "g");
            result = simple.test('Dogs and cats are not dogs');
            expect(result).toEqual(true);
            result = simple.exec('Dogs and cats are not dogs');
            expect(result.length).toEqual(2);
            expect(result[0]).toEqual('ats');// Second occurence ? why not the first ?
            expect(result[1]).toEqual('at');
            expect(result.index).toEqual(10);
            expr = 'Dogs and cats are not dogs';
            result = expr.replace(simple, "b");
            expect(expr).toEqual("Dogs and cats are not dogs");
            expect(result).toEqual("Dogs b cb b not dogs");// All 3 occurences are replaced

            var atCstExpr=new RegExp("(dog)", "i");
            result = atCstExpr.test('Dogs and cats are not dogs');
            expect(result).toEqual(true);
            result = atCstExpr.exec('Dogs and cats are not dogs');
            expect(result.length).toEqual(2);
            expect(result[0]).toEqual('Dog');
            expect(result[1]).toEqual('Dog');
            expect(result.index).toEqual(0);
            expr = 'Dogs and cats are not dogs';
            result = expr.replace(atCstExpr, "cat");
            expect(expr).toEqual("Dogs and cats are not dogs");
            expect(result).toEqual("cats and cats are not dogs");

            atCstExpr=new RegExp("(dog)", "g");
            result = atCstExpr.test('Dogs and cats are not dogs');
            expect(result).toEqual(true);
            // BEWARE : l'option 'global' du RegExp fonctionne TRES MAL avec exec()
            /*
            result = atCstExpr.exec('Dogs and cats are not dogs');
            expect(result.length).toEqual(2);
            expect(result[0]).toEqual('dog');
            expect(result[1]).toEqual('dog');
            expect(result.index).toEqual(25);
            */
            expr = 'Dogs and cats are not dogs';
            result = expr.replace(atCstExpr, "cat");
            expect(expr).toEqual("Dogs and cats are not dogs");
            expect(result).toEqual("Dogs and cats are not cats");

            atCstExpr=new RegExp("(dog)", "ig");
            result = atCstExpr.test('Dogs and cats are not dogs');
            expect(result).toEqual(true);
            // BEWARE : l'option 'global' du RegExp fonctionne TRES MAL avec exec()
            /*
            result = atCstExpr.exec('Dogs and cats are not dogs');
            expect(result.length).toEqual(2);
            expect(result[0]).toEqual('Dog');
            expect(result[1]).toEqual('Dog');
            expect(result.index).toEqual(25);
            */
            expr = 'Dogs and cats are not dogs';
            result = expr.replace(atCstExpr, "cat");
            expect(expr).toEqual("Dogs and cats are not dogs");
            expect(result).toEqual("cats and cats are not cats");

            expect(atNameExpr.test('a')).toEqual(true);
            expect(atNameExpr.test('_a')).toEqual(true);
            expect(atNameExpr.test('_ab')).toEqual(true);
            expect(atNameExpr.test('@abd.ef')).toEqual(true);

            /*
            expect(atNameExpr.exec('a')[0]).toEqual('a');
            expect(atNameExpr.exec('_a')[0]).toEqual('_a');
            expect(atNameExpr.exec('_ab')[0]).toEqual('_ab');
            expect(atNameExpr.exec('@abd.ef')[0]).toEqual('abd');
            */

            expr = '@ag_h-rt.b -@c.d -@e.f';
            result = expr.replace(atNameExpr, "fct('$1')");
            expect(result).toEqual("@fct('ag_h-rt').fct('b') -@fct('c').fct('d') -@fct('e').fct('f')");

            expr = '@parentNode.previousElementSibling.b -@nextElementSibling.firstElementChild.d -@lastElementChild.f';
            result = expr.replace(atNodeExpr, "fct('$1')");
            expect(result).toEqual("@fct('parentNode').fct('previousElementSibling').b -@fct('nextElementSibling').fct('firstElementChild').d -@fct('lastElementChild').f");

            expr = '@a.offsetTop -@c.offsetLeft -@e.offsetWidth -@g.offsetHeight';
            result = expr.replace(atAttrExpr, "fct('$1')");
            expect(result).toEqual("@a.fct('offsetTop') -@c.fct('offsetLeft') -@e.fct('offsetWidth') -@g.fct('offsetHeight')");

            result = atPathExpr2.exec('@parentNode.lastElementChild.previousElementSibling.offsetHeight -@nextElementSibling.offsetLeft +@firstElementChild.offsetWidth');
            expect(result.length).toEqual(7);
            expect(result[0]).toEqual('@parentNode.lastElementChild.previousElementSibling.offsetHeight');
            expect(result[1]).toEqual('parentNode.lastElementChild.previousElementSibling.');
            expect(result[2]).toEqual('parentNode.lastElementChild.previousElementSibling');
            expect(result[3]).toEqual('parentNode');
            expect(result[4]).toEqual('.previousElementSibling');
            expect(result[5]).toEqual('previousElementSibling');
            expect(result[6]).toEqual('offsetHeight');
            expect(result.index).toEqual(0);

            result = atResizerExpr2.exec('@a.previousElementSibling.offsetWidth +@c.offsetTop -@e.offsetWidth');
            expect(result.length).toEqual(6);
            expect(result[0]).toEqual('@a.previousElementSibling.offsetWidth');
            expect(result[1]).toEqual('a');
            expect(result[2]).toEqual('.previousElementSibling');
            expect(result[3]).toEqual('.previousElementSibling');
            expect(result[4]).toEqual('previousElementSibling');
            expect(result[5]).toEqual('offsetWidth');
            expect(result.index).toEqual(0);

            expr = '@parentNode.lastElementChild.previousElementSibling.offsetTop -@nextElementSibling.offsetLeft +@firstElementChild.offsetWidth';
            result = expr.replace(atPathExpr, "getPathValue('$2','$6')");
            expect(result).toEqual("getPathValue('parentNode.lastElementChild.previousElementSibling','offsetTop') -getPathValue('nextElementSibling','offsetLeft') +getPathValue('firstElementChild','offsetWidth')");

            expr = '@a.lastElementChild.nextElementSibling.offsetHeight +@c.offsetTop -@e.firstElementChild.offsetWidth';
            result = expr.replace(atResizerExpr, "getResizerValue('$1','$2','$5')");
            expect(result).toEqual("getResizerValue('a','.lastElementChild.nextElementSibling','offsetHeight') +getResizerValue('c','','offsetTop') -getResizerValue('e','.firstElementChild','offsetWidth')");

        });

    });

    describe('CardinalPoints', function () {

        var step = Math.PI/8;

        function f1(angle) {// angle in ]-PI, +PI]
            var idx = Math.round(angle / (2*step));
            if (idx < 0) idx = idx + 8;
            var tab = ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE'];
            return tab[idx];
        }

        function f2(angle) {// angle in ]-PI, +PI]
            if (angle > (Math.PI - step)) {
                return 'W';
            } else if (angle > (Math.PI - 3*step)) {
                return 'SW';
            } else if (angle > (Math.PI - 5*step)) {
                return 'S';
            } else if (angle > (Math.PI - 7*step)) {
                return 'SE';
            } else if (angle > (Math.PI - 9*step)) {
                return 'E';
            } else if (angle > (Math.PI - 11*step)) {
                return 'NE';
            } else if (angle > (Math.PI - 13*step)) {
                return 'N';
            } else if (angle > (Math.PI - 15*step)) {
                return 'NW';
            } else {
                return 'W';
            }
        }

        it('should give 8 cardinal points', function () {

            expect(f1(0)).toEqual('E');
            expect(f1(2*step)).toEqual('SE');
            expect(f1(4*step)).toEqual('S');
            expect(f1(6*step)).toEqual('SW');
            expect(f1(8*step)).toEqual('W');
            expect(f1(-6*step)).toEqual('NW');
            expect(f1(-4*step)).toEqual('N');
            expect(f1(-2*step)).toEqual('NE');

            expect(f2(0)).toEqual('E');
            expect(f2(2*step)).toEqual('SE');
            expect(f2(4*step)).toEqual('S');
            expect(f2(6*step)).toEqual('SW');
            expect(f2(8*step)).toEqual('W');
            expect(f2(-6*step)).toEqual('NW');
            expect(f2(-4*step)).toEqual('N');
            expect(f2(-2*step)).toEqual('NE');

        });

        it('f2 should be faster than f1', function () {

            var beg1 = (new Date()).getTime();
            for (var i = 0; i < 10000; i++) {
                expect(f1(0)).toEqual('E');
                expect(f1(2*step)).toEqual('SE');
                expect(f1(4*step)).toEqual('S');
                expect(f1(6*step)).toEqual('SW');
                expect(f1(8*step)).toEqual('W');
                expect(f1(-6*step)).toEqual('NW');
                expect(f1(-4*step)).toEqual('N');
                expect(f1(-2*step)).toEqual('NE');
            }
            var end1 = (new Date()).getTime();

            var beg2 = (new Date()).getTime();
            for (var j = 0; j < 10000; j++) {
                expect(f2(0)).toEqual('E');
                expect(f2(2*step)).toEqual('SE');
                expect(f2(4*step)).toEqual('S');
                expect(f2(6*step)).toEqual('SW');
                expect(f2(8*step)).toEqual('W');
                expect(f2(-6*step)).toEqual('NW');
                expect(f2(-4*step)).toEqual('N');
                expect(f2(-2*step)).toEqual('NE');
            }
            var end2 = (new Date()).getTime();

            // Accept 20% error : f2 can also be 80% speed of f1
            expect(end1 - beg1).toBeGreaterThan((end2 - beg2)*0.8);
        });

    });

    describe('PointSampler', function () {

        function TestDrawer() {
            this.begin = function() {

            };
            this.add = function(p0, q0, q1, p1) {

            };
            this.end = function() {

            };
        }

        it('should give 2 points at most', function () {

            var drawer = new TestDrawer();
            var interpolator = new a4p.BezierInterpolator(0.33);
            interpolator.addListener(drawer);
            var sampler1 = new a4p.PointSampler(10, 10);
            sampler1.addListener(interpolator);

            sampler1.beginSample();
            expect(sampler1.points.length).toEqual(0);

            sampler1.addSample(0, 0);
            expect(sampler1.points.length).toEqual(1);// force first point
            expect(sampler1.points[0].x).toEqual(0);
            expect(sampler1.points[0].y).toEqual(0);

            sampler1.addSample(15, 0);
            expect(sampler1.points.length).toEqual(2);
            expect(sampler1.points[0].x).toEqual(0);
            expect(sampler1.points[0].y).toEqual(0);
            expect(sampler1.points[1].x).toEqual(15);
            expect(sampler1.points[1].y).toEqual(0);

            sampler1.endSample();
            expect(sampler1.points.length).toEqual(2);
            expect(sampler1.points[0].x).toEqual(0);
            expect(sampler1.points[0].y).toEqual(0);
            expect(sampler1.points[1].x).toEqual(15);
            expect(sampler1.points[1].y).toEqual(0);

        });

        it('should give 2 points at least', function () {

            var drawer = new TestDrawer();
            var interpolator = new a4p.BezierInterpolator(0.33);
            interpolator.addListener(drawer);
            var sampler1 = new a4p.PointSampler(10, 10);
            sampler1.addListener(interpolator);

            sampler1.beginSample();
            expect(sampler1.points.length).toEqual(0);

            sampler1.addSample(0, 0);
            expect(sampler1.points.length).toEqual(1);// force first point
            expect(sampler1.points[0].x).toEqual(0);
            expect(sampler1.points[0].y).toEqual(0);

            sampler1.addSample(10, 0);
            expect(sampler1.points.length).toEqual(1);// too near
            expect(sampler1.points[0].x).toEqual(0);
            expect(sampler1.points[0].y).toEqual(0);

            sampler1.endSample();
            expect(sampler1.points.length).toEqual(2);// force last point
            expect(sampler1.points[0].x).toEqual(0);
            expect(sampler1.points[0].y).toEqual(0);
            expect(sampler1.points[1].x).toEqual(10);
            expect(sampler1.points[1].y).toEqual(0);

        });

        it('should give 3 points at most', function () {

            var drawer = new TestDrawer();
            var interpolator = new a4p.BezierInterpolator(0.33);
            interpolator.addListener(drawer);
            var sampler1 = new a4p.PointSampler(10, 10);
            sampler1.addListener(interpolator);

            sampler1.beginSample();
            expect(sampler1.points.length).toEqual(0);

            sampler1.addSample(0, 0);
            expect(sampler1.points.length).toEqual(1);// force first point
            expect(sampler1.points[0].x).toEqual(0);
            expect(sampler1.points[0].y).toEqual(0);

            sampler1.addSample(15, 0);
            expect(sampler1.points.length).toEqual(2);
            expect(sampler1.points[0].x).toEqual(0);
            expect(sampler1.points[0].y).toEqual(0);
            expect(sampler1.points[1].x).toEqual(15);
            expect(sampler1.points[1].y).toEqual(0);

            sampler1.addSample(40, 0);
            expect(sampler1.points.length).toEqual(2);// no turn && no timeout
            expect(sampler1.points[0].x).toEqual(0);
            expect(sampler1.points[0].y).toEqual(0);
            expect(sampler1.points[1].x).toEqual(15);
            expect(sampler1.points[1].y).toEqual(0);

            sampler1.endSample();
            expect(sampler1.points.length).toEqual(3);// force last point
            expect(sampler1.points[0].x).toEqual(0);
            expect(sampler1.points[0].y).toEqual(0);
            expect(sampler1.points[1].x).toEqual(15);
            expect(sampler1.points[1].y).toEqual(0);
            expect(sampler1.points[2].x).toEqual(40);
            expect(sampler1.points[2].y).toEqual(0);

        });

        it('should give 2 points if too near', function () {

            var drawer = new TestDrawer();
            var interpolator = new a4p.BezierInterpolator(0.33);
            interpolator.addListener(drawer);
            var sampler1 = new a4p.PointSampler(10, 10);
            sampler1.addListener(interpolator);

            sampler1.beginSample();
            expect(sampler1.points.length).toEqual(0);

            sampler1.addSample(0, 0);
            expect(sampler1.points.length).toEqual(1);// force first point
            expect(sampler1.points[0].x).toEqual(0);
            expect(sampler1.points[0].y).toEqual(0);

            sampler1.addSample(10, 0);
            expect(sampler1.points.length).toEqual(1);// too near
            expect(sampler1.points[0].x).toEqual(0);
            expect(sampler1.points[0].y).toEqual(0);

            sampler1.addSample(40, 0);
            expect(sampler1.points.length).toEqual(2);// no turn && no timeout but global min distance
            expect(sampler1.points[0].x).toEqual(0);
            expect(sampler1.points[0].y).toEqual(0);
            expect(sampler1.points[1].x).toEqual(40);
            expect(sampler1.points[1].y).toEqual(0);

            sampler1.endSample();
            expect(sampler1.points.length).toEqual(2);// force last point
            expect(sampler1.points[0].x).toEqual(0);
            expect(sampler1.points[0].y).toEqual(0);
            expect(sampler1.points[1].x).toEqual(40);
            expect(sampler1.points[1].y).toEqual(0);

        });

        it('should give 3 points if too long delay', function () {

            var drawer = new TestDrawer();
            var interpolator = new a4p.BezierInterpolator(0.33);
            interpolator.addListener(drawer);
            var sampler1 = new a4p.PointSampler(10, 10);
            sampler1.addListener(interpolator);

            sampler1.beginSample();
            expect(sampler1.points.length).toEqual(0);

            sampler1.addSample(0, 0);
            expect(sampler1.points.length).toEqual(1);// force first point
            expect(sampler1.points[0].x).toEqual(0);
            expect(sampler1.points[0].y).toEqual(0);

            sampler1.addSample(10, 0);
            expect(sampler1.points.length).toEqual(1);// too near
            expect(sampler1.points[0].x).toEqual(0);
            expect(sampler1.points[0].y).toEqual(0);

            waits(15);

            runs(function () {
                expect(sampler1.points.length).toEqual(2);// timeout
                expect(sampler1.points[0].x).toEqual(0);
                expect(sampler1.points[0].y).toEqual(0);
                expect(sampler1.points[1].x).toEqual(10);
                expect(sampler1.points[1].y).toEqual(0);

                sampler1.addSample(20, 0);
                expect(sampler1.points.length).toEqual(2);// no turn && no timeout
                expect(sampler1.points[0].x).toEqual(0);
                expect(sampler1.points[0].y).toEqual(0);
                expect(sampler1.points[1].x).toEqual(10);
                expect(sampler1.points[1].y).toEqual(0);

                sampler1.endSample();
                expect(sampler1.points.length).toEqual(3);
                expect(sampler1.points[0].x).toEqual(0);
                expect(sampler1.points[0].y).toEqual(0);
                expect(sampler1.points[1].x).toEqual(10);
                expect(sampler1.points[1].y).toEqual(0);
                expect(sampler1.points[2].x).toEqual(20);
                expect(sampler1.points[2].y).toEqual(0);
            });

        });

        it('should give 4 points', function () {

            var drawer = new TestDrawer();
            var interpolator = new a4p.BezierInterpolator(0.33);
            interpolator.addListener(drawer);
            var sampler1 = new a4p.PointSampler(10, 10);
            sampler1.addListener(interpolator);

            sampler1.beginSample();
            expect(sampler1.points.length).toEqual(0);

            sampler1.addSample(0, 0);
            expect(sampler1.points.length).toEqual(1);// force first point
            expect(sampler1.points[0].x).toEqual(0);
            expect(sampler1.points[0].y).toEqual(0);

            sampler1.addSample(10, 0);
            expect(sampler1.points.length).toEqual(1);// too near
            expect(sampler1.points[0].x).toEqual(0);
            expect(sampler1.points[0].y).toEqual(0);

            sampler1.addSample(40, 0);
            expect(sampler1.points.length).toEqual(2);// no turn && no timeout but global min distance
            expect(sampler1.points[0].x).toEqual(0);
            expect(sampler1.points[0].y).toEqual(0);
            expect(sampler1.points[1].x).toEqual(40);
            expect(sampler1.points[1].y).toEqual(0);

            sampler1.addSample(80, 0);
            expect(sampler1.points.length).toEqual(2);
            expect(sampler1.points[0].x).toEqual(0);
            expect(sampler1.points[0].y).toEqual(0);
            expect(sampler1.points[1].x).toEqual(40);
            expect(sampler1.points[1].y).toEqual(0);

            sampler1.endSample();
            expect(sampler1.points.length).toEqual(3);
            expect(sampler1.points[0].x).toEqual(0);
            expect(sampler1.points[0].y).toEqual(0);
            expect(sampler1.points[1].x).toEqual(40);
            expect(sampler1.points[1].y).toEqual(0);
            expect(sampler1.points[2].x).toEqual(80);
            expect(sampler1.points[2].y).toEqual(0);

        });

    });

});
