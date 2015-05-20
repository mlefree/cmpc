'use strict';

// Namespace a4p
var a4p;
if (!a4p) a4p = {};

a4p.LogSpecView = (function () {

    // Constructor
    function LogSpecView(spec, dom, views) {
        this.spec = spec;
        this.dom = dom;
        this.views = views;

        this.summary = {
            name : this.spec.getFullName(),
            description : this.spec.description,
            status : ""
        };
        this.detail = {
            name : this.spec.getFullName(),
            status : "",
            messages : []
        };
    }

    ;

    // Public API

    LogSpecView.prototype.status = function () {
        var results = this.spec.results();
        var status = results.passed() ? 'passed' : 'failed';
        if (results.skipped) {
            status = 'skipped';
        }
        return status;
    };

    LogSpecView.prototype.refresh = function () {
        switch (this.status()) {
            case 'skipped':
                break;

            case 'passed':
                this.appendSummaryToSuiteDiv();
                break;

            case 'failed':
                this.appendSummaryToSuiteDiv();
                this.appendFailureDetail();
                break;
        }
    };

    LogSpecView.prototype.appendSummaryToSuiteDiv = function () {
        this.summary.status = this.status();

        var parentDiv = this.dom.summary;
        var parentSuite = (typeof this.spec.parentSuite == 'undefined') ? 'suite' : 'parentSuite';
        var parent = this.spec[parentSuite];
        if (parent) {
            if (typeof this.views.suites[parent.id] == 'undefined') {
                this.views.suites[parent.id] = new a4p.LogSuiteView(parent, this.dom, this.views);
            }
            parentDiv = this.views.suites[parent.id].element;
        }
        parentDiv.specs.push(this.summary);
    };

    LogSpecView.prototype.appendFailureDetail = function () {
        this.detail.status = this.status();

        var resultItems = this.spec.results().getItems();
        for (var i = 0; i < resultItems.length; i++) {
            var result = resultItems[i];
            if (result.type == 'log') {
                this.detail.messages.push({type:'log', message:result.toString()});
            } else if (result.type == 'expect' && result.passed && !result.passed()) {
                if (result.trace.stack) {
                    //this.log('>> detail : ' + this.summary.name + ' ' + this.summary.status + "\n" + result.message + "\n" + result.trace.stack);
                    this.detail.messages.push({type:'failure', message:result.message, stack:result.trace.stack});
                } else {
                    //this.log('>> detail : ' + this.summary.name + ' ' + this.summary.status + "\n" + result.message);
                    this.detail.messages.push({type:'failure', message:result.message});
                }
            }
        }

        if (this.detail.messages.length > 0) {
            this.dom.details.specs.push(this.detail);
        }
    };

    LogSpecView.prototype.log = function () {
        var console = jasmine.getGlobal().console;
        if (console && console.log) {
            if (console.log.apply) {
                console.log.apply(console, arguments);
            } else {
                console.log(arguments); // ie fix: console.log.apply doesn't exist on ie
            }
        }
    };

    // The public API for this module is the constructor function.
    // We need to export that function from this private namespace so that
    // it can be used on the outside.
    return LogSpecView;

})(); // Invoke the function immediately to create this class.

a4p.LogSuiteView = (function () {

    // Constructor
    function LogSuiteView(suite, dom, views) {
        this.suite = suite;
        this.dom = dom;
        this.views = views;

        this.element = {
            name : this.suite.getFullName(),
            description : this.suite.description,
            status : "",
            specs:[]
        };

        var parentDiv = this.dom.summary;
        var parentSuite = (typeof suite.parentSuite == 'undefined') ? 'suite' : 'parentSuite';
        var parent = suite[parentSuite];
        if (parent) {
            if (typeof this.views.suites[parent.id] == 'undefined') {
                this.views.suites[parent.id] = new a4p.LogSuiteView(parent, this.dom, this.views);
            }
            parentDiv = this.views.suites[parent.id].element;
        }
        parentDiv.specs.push(this.element);
    }

    // Public API

    LogSuiteView.prototype.status = function () {
        var results = this.suite.results();
        var status = results.passed() ? 'passed' : 'failed';
        if (results.skipped) {
            status = 'skipped';
        }
        return status;
    };

    LogSuiteView.prototype.refresh = function () {
        this.element.status = this.status();
    };

    LogSuiteView.prototype.log = function () {
        var console = jasmine.getGlobal().console;
        if (console && console.log) {
            if (console.log.apply) {
                console.log.apply(console, arguments);
            } else {
                console.log(arguments); // ie fix: console.log.apply doesn't exist on ie
            }
        }
    };

    // The public API for this module is the constructor function.
    // We need to export that function from this private namespace so that
    // it can be used on the outside.
    return LogSuiteView;

})(); // Invoke the function immediately to create this class.

a4p.LogReporterView = (function () {

    // Constructor
    function LogReporterView(dom) {
        this.dom = dom;

        this.startedAt = new Date();
        this.runningSpecCount = 0;
        this.completeSpecCount = 0;
        this.passedCount = 0;
        this.failedCount = 0;
        this.skippedCount = 0;
    }

    // Public API

    LogReporterView.prototype.addSpecs = function (specs) {
        this.totalSpecCount = specs.length;

        this.views = {
            specs:{},
            suites:{}
        };

        for (var i = 0; i < specs.length; i++) {
            var spec = specs[i];
            this.views.specs[spec.id] = new a4p.LogSpecView(spec, this.dom, this.views);
            this.runningSpecCount++;
        }
    };

    LogReporterView.prototype.specComplete = function (spec) {
        this.completeSpecCount++;

        if (isUndefined(this.views.specs[spec.id])) {
            this.views.specs[spec.id] = new a4p.LogSpecView(spec, this.dom);
        }

        var specView = this.views.specs[spec.id];

        switch (specView.status()) {
            case 'passed':
                this.passedCount++;
                break;

            case 'failed':
                this.failedCount++;
                break;

            case 'skipped':
                this.skippedCount++;
                break;
        }

        specView.refresh();
        this.refresh();
        this.log('>> Jasmine Spec ' + spec.getFullName() + ' complete : ' + specView.status());
    };

    LogReporterView.prototype.suiteComplete = function (suite) {
        var suiteView = this.views.suites[suite.id];
        if (isUndefined(suiteView)) {
            return;
        }
        suiteView.refresh();
        this.log('>> Jasmine Suite ' + suite.getFullName() + ' complete : ' + suiteView.status());
    };

    LogReporterView.prototype.refresh = function () {
        this.dom.alert.runningAlert = "Running " + this.completeSpecCount + " of " + specPluralizedFor(this.totalSpecCount);
        this.dom.alert.skippedAlert = "Skipping " + this.skippedCount + " of " + specPluralizedFor(this.totalSpecCount) + " - run all";
        this.dom.alert.passedAlert = "Passed " + specPluralizedFor(this.passedCount);
        this.dom.alert.failedAlert = "Failed " + specPluralizedFor(this.failedCount);

        this.dom.alert.resultsMenu.summaryMenuItem = "" + specPluralizedFor(this.runningSpecCount);
        this.dom.alert.resultsMenu.detailsMenuItem = "" + this.failedCount + " failing";
    };

    LogReporterView.prototype.complete = function () {
        this.dom.alert.runningAlert = "";
        this.dom.alert.skippedAlert = "Ran " + this.runningSpecCount + " of " + specPluralizedFor(this.totalSpecCount) + " - run all";
        this.dom.alert.passedAlert = "Passed " + specPluralizedFor(this.passedCount);
        this.dom.alert.failedAlert = "Failed " + specPluralizedFor(this.failedCount);
        this.dom.banner.duration = "finished in " + ((new Date().getTime() - this.startedAt.getTime()) / 1000) + "s";
        this.log('>> Jasmine Runner complete : ' + this.dom.alert.skippedAlert + ". " + this.dom.alert.passedAlert + ". " + this.dom.alert.failedAlert + ".");

        var nb = this.dom.details.specs.length;
        for (var i=0; i < nb; i++) {
            var detail = this.dom.details.specs[i];
            var nbMsg = detail.messages.length;
            this.log('>> Failure ' + (i+1) + '/' + nb + ') Jasmine Spec ' + detail.name);
            for (var m=0; m < nbMsg; m++) {
                var msg = detail.messages[m];
                if (msg.type == 'log') {
                    this.log('>>   log : ' + msg.message);
                } else if (msg.type == 'failure') {
                    this.log('>>   failure : ' + msg.message + "\n" + msg.stack);
                } else {
                    this.log('>>   ??? : ' + msg);
                }
            }
        }
        alert('Jasmine Runner complete : ' + this.dom.alert.skippedAlert + ". " + this.dom.alert.passedAlert + ". " + this.dom.alert.failedAlert + ".");
    };

    LogReporterView.prototype.log = function () {
        var console = jasmine.getGlobal().console;
        if (console && console.log) {
            if (console.log.apply) {
                console.log.apply(console, arguments);
            } else {
                console.log(arguments); // ie fix: console.log.apply doesn't exist on ie
            }
        }
    };

    // Private API
    // helper functions and variables hidden within this function scope

    function isUndefined(obj) {
        return typeof obj === 'undefined';
    }

    function specPluralizedFor(count) {
        var str = count + " spec";
        if (count > 1) {
            str += "s"
        }
        return str;
    }

    // The public API for this module is the constructor function.
    // We need to export that function from this private namespace so that
    // it can be used on the outside.
    return LogReporterView;

})(); // Invoke the function immediately to create this class.


a4p.LogReporter = (function () {

    // Constructor
    function LogReporter() {
        this.reporterView;
        this.dom = {};
    }

    // Public API

    LogReporter.prototype.reportRunnerStarting = function (runner) {
        this.log('>> Jasmine Runner starting ...');

        var specs = runner.specs() || [];

        if (specs.length == 0) {
            return;
        }

        this.dom.banner = {
            title:"Jasmine ",
            version:runner.env.versionString(),
            duration:""
        };
        this.dom.alert = {
            runningAlert:"",
            skippedAlert:"",
            passedAlert:"",
            failedAlert:"",
            resultsMenu:{
                summaryMenuItem:"",
                detailsMenuItem:""
            }
        };
        this.dom.summary = {
            specs:[]
        };
        this.dom.details = {
            specs:[]
        };
        this.dom.results = {
            summary:this.dom.summary,
            details:this.dom.details
        };
        this.dom.reporter = {
            banner:this.dom.banner,
            alert:this.dom.alert,
            results:this.dom.results
        };

        this.reporterView = new a4p.LogReporterView(this.dom);
        this.reporterView.addSpecs(specs);
    };

    LogReporter.prototype.reportRunnerResults = function (runner) {
        this.reporterView && this.reporterView.complete();
    };

    LogReporter.prototype.reportSuiteResults = function (suite) {
        this.reporterView.suiteComplete(suite);
    };

    LogReporter.prototype.reportSpecStarting = function (spec) {
    };

    LogReporter.prototype.reportSpecResults = function (spec) {
        this.reporterView.specComplete(spec);
    };

    LogReporter.prototype.log = function () {
        var console = jasmine.getGlobal().console;
        if (console && console.log) {
            if (console.log.apply) {
                console.log.apply(console, arguments);
            } else {
                console.log(arguments); // ie fix: console.log.apply doesn't exist on ie
            }
        }
    };

    // The public API for this module is the constructor function.
    // We need to export that function from this private namespace so that
    // it can be used on the outside.
    return LogReporter;

})(); // Invoke the function immediately to create this class.
