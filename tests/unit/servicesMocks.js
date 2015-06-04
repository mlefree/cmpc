'use strict';

function checkMocking(mockName, mockClass, originalName, originalClass, skipMockMethods, skipOriginalMehods) {
    for (var om in originalClass.prototype) {
        if (a4p.isDefined(skipOriginalMehods) && (skipOriginalMehods.indexOf(om) >= 0)) continue;
        if (typeof originalClass.prototype[om] == "function" && !mockClass.prototype.hasOwnProperty(om)) {
            throw 'Error : method "' + om + '" is not implemented in '+mockName+' class. You should create it to mock correctly '+originalName+' class.';
        }
    }
    for (var mm in mockClass.prototype) {
        if (a4p.isDefined(skipMockMethods) && (skipMockMethods.indexOf(mm) >= 0)) continue;
        if (typeof mockClass.prototype[mm] == "function" && !originalClass.prototype.hasOwnProperty(mm)) {
            throw 'Error : method "' + mm + '" is still implemented in '+mockName+' class. You should delete it to mock correctly '+originalName+' class.';
        }
    }
}

// Services mocking

/**
 * Mock of a4p.Analytics.
 * Usage : new MockAnalytics(srvLocalStorage);
 */
var MockAnalytics = (function() {
    var mAnalyticsLS = 'a4p.Analytics';
    var mAnalyticsFunctionnalitiesLS = 'a4p.Analytics.functionalities';
    function Service(localStorage) {
        this.localStorage = null;
        if (a4p.isDefined(localStorage) && localStorage) this.localStorage = localStorage;
        this.mAnalyticsArray = [];
        this.mAnalyticsFunctionnalitiesArray = [];
        if (this.localStorage) {
            this.mAnalyticsArray = this.localStorage.get(mAnalyticsLS, this.mAnalyticsArray);
            this.mAnalyticsFunctionnalitiesArray = this.localStorage.get(mAnalyticsFunctionnalitiesLS, this.mAnalyticsFunctionnalitiesArray);
        }
        this.vid = 'vid_undefined';
        this.uid = 'uid_undefined';
        this.initDone = false;
        this.bEnabled = true;
    }

    Service.prototype.init = function () {
        if (this.initDone) return;
        this.initDone = true;
    };
    Service.prototype.setEnabled = function(enable) {
        this.bEnabled = (enable == true);
    };
    Service.prototype.setVid = function(vid) {
        this.vid = vid;
    };
    Service.prototype.setUid = function(uid) {
        this.uid = uid;
    };
    Service.prototype.add = function (category, action, value) {
        if (!this.bEnabled) return;

        //Store event & view
        var paramEvent = {
            vid : this.vid,
            uid : this.uid,
            type : 'event',
            category: category,
            action : action,
            value : value || 1
        };
        var paramView = {
            vid : this.vid,
            uid : this.uid,
            type : 'view',
            category: category,
            action : action,
            value : value || 1
        };

        // Push arr into message queue to be stored in local storage
        this.mAnalyticsArray.push(paramEvent);
        this.mAnalyticsArray.push(paramView);
        this.mAnalyticsFunctionnalitiesArray.push(action);
        if (this.localStorage) this.localStorage.set(mAnalyticsLS, this.mAnalyticsArray);
        if (this.localStorage) this.localStorage.set(mAnalyticsFunctionnalitiesLS, this.mAnalyticsFunctionnalitiesArray);
    };
    Service.prototype.run = function () {
        if (!this.bEnabled) return;

        this.mAnalyticsArray = [];
        if (this.localStorage) this.localStorage.set(mAnalyticsLS, this.mAnalyticsArray);
    };
    return Service;
})();

checkMocking('MockAnalytics', MockAnalytics, 'a4p.Analytics', a4p.Analytics);

/**
 * Mock of srvConfig
 * Usage : var srvConfig = new MockConfig(srvAnalytics);
 */
var MockConfig = (function() {

    var betaOptions = [
        "exposeCreateAccount",
        "exposeRequestPassword",
        "exposeUserFeedback",
        "exposeFileStorage",
        "exposeDataSynchro",
        "exposeGoogleMap",
        "exposeTimeline",
        "exposeFacetDialog",
        "exposeDraggableHover",
        "exposeDraggableBorder",
        "exposeAllFacets",
        "phoneFormatIfSmall"
    ];

    function Service(srvAnalytics) {
        this.srvAnalytics = srvAnalytics;
        this.c4pUrlConf = 'models/c4p_conf.json';
        this.c4pUrlBase = '';
        this.c4pUrlForget = this.c4pUrlBase + "/c4p_forget.php";
        this.c4pUrlCreateAccount = this.c4pUrlBase + "/c4p_createAccount.php";
        this.c4pUrlData = this.c4pUrlBase + "/c4p_fill.php";
        this.c4pUrlFullMap = this.c4pUrlBase + "/c4p_fullMap.php";
        this.c4pUrlRefreshMap = this.c4pUrlBase + "/c4p_refreshMap.php";
        this.c4pUrlUpload = this.c4pUrlBase + "/c4p_upload.php";
        this.c4pUrlUploadFile = this.c4pUrlBase + "/c4p_uploadFile.php";
        this.c4pUrlSendEmail = this.c4pUrlBase + "/c4p_sendEmail.php";
        this.c4pUrlSendICal = this.c4pUrlBase + "/c4p_sendICal.php";
        this.c4pUrlShareDoc = this.c4pUrlBase + "/c4p_shareDoc.php";
        this.c4pUrlSfCreate = this.c4pUrlBase + "/c4p_create.php";
        this.c4pUrlSfUpdate = this.c4pUrlBase + "/c4p_update.php";
        this.c4pUrlSfDelete = this.c4pUrlBase + "/c4p_delete.php";
        this.c4pUrlErrorReport = this.c4pUrlBase + "/c4p_errorReport.php";
        this.c4pUrlFeedbackReport = this.c4pUrlBase + "/c4p_feedbackReport.php";
        this.c4pUrlFeedback = this.c4pUrlBase + "/c4p_feedback.php";
        this.c4pUrlDownload = this.c4pUrlBase + "/c4p_download.php";
        this.c4pUrlPing = this.c4pUrlBase + "/c4p_ping.php";
        this.trustAllHosts = false;
        this.c4pBuildDate = '';
        this.c4pLicence = '';
        this.possibleCrms = ["ios", "c4p"];// list of CRM currently possible
        this.activeCrms = ["ios", "c4p"];// list of CRM activated by User if they are possible
        this.c4pConfig = {
            "exposeBetaFunctionalities" : false
        };
        this.nameComposition = {};
        this.sizeCss = '';
        this.themeCss = "c4p-cosmo";

        this.initBetaOptions();
        this.env = 'P';
        srvAnalytics.setEnabled(true);
        this.initDone = false;
    }
    Service.prototype.initBetaOptions = function () {
        for (var i=0, nb=betaOptions.length; i<nb; i++) {
            var key = betaOptions[i];
            if (a4p.isUndefinedOrNull(this.c4pConfig[key])) {
                this.c4pConfig[key] = false;
            }
        }
    };
    Service.prototype.init = function () {
        if (this.initDone) return;
        this.setUrlBase('https://127.0.0.1/c4ph5/www');
        this.setTrustAllHosts(true);
        this.initDone = true;
    };
    Service.prototype.setC4pUrlConf = function (c4pUrlConf) {
        this.c4pUrlConf = c4pUrlConf;
    };
    Service.prototype.startLoading = function (callback) {
        this.setBuildDate("130910");
        this.setUrlBase('http://127.0.0.1/c4p_server/www');
        this.setTrustAllHosts(false);
        this.setPossibleCrms(["ios", "c4p"]);
        this.setActiveCrms(["ios", "c4p"]);
        this.setConfig({
            "exposeBetaFunctionalities": false
        });
        callback();
    };
    Service.prototype.setTrustAllHosts = function (trustAllHosts) {
        this.trustAllHosts = trustAllHosts;
    };
    Service.prototype.setBuildDate = function (date) {
        this.c4pBuildDate = date;
    };
    Service.prototype.setLicence = function (licence) {
        this.c4pLicence = licence;
    };
    Service.prototype.setConfig = function (config) {
        this.c4pConfig = config;
        this.initBetaOptions();
        if (!this.c4pConfig.exposeBetaFunctionalities) this.setBetaMode(false);// Clear all beta parms
    };
    Service.prototype.setBetaMode = function (isBetaMode) {
        this.c4pConfig.exposeBetaFunctionalities = isBetaMode;
        if (!isBetaMode) {
            // Clear all beta parms
            for (var key in this.c4pConfig) {
                if (!this.c4pConfig.hasOwnProperty(key)) continue;
                if (key == 'exposeBetaFunctionalities') continue;
                this.c4pConfig[key] = false;
            }
        }
    };
    Service.prototype.setBetaCfgPrm = function (prmKey, flag) {
        this.c4pConfig[prmKey] = flag;
    };
    Service.prototype.setPossibleCrms = function (possibleCrms) {
        this.possibleCrms = possibleCrms;
        for (var crmIdx=this.activeCrms.length-1; crmIdx>= 0; crmIdx--) {
            var key = this.activeCrms[crmIdx];
            if (!isValueInList(this.possibleCrms, key)) {
                removeValueFromList(this.activeCrms, key);
            }
        }
    };
    Service.prototype.setActiveCrms = function (activeCrms) {
        this.activeCrms = activeCrms.slice(0);
        for (var crmIdx=this.activeCrms.length-1; crmIdx>= 0; crmIdx--) {
            var key = this.activeCrms[crmIdx];
            if (!isValueInList(this.possibleCrms, key)) {
                removeValueFromList(this.activeCrms, key);
            }
        }
    };
    Service.prototype.getActiveCrms = function () {
        return this.activeCrms;
    };
    Service.prototype.hasActiveRemoteCrm = function () {
        if (isValueInList(this.activeCrms, 'ios')) {
            return (this.activeCrms.length > 1);
        } else {
            return (this.activeCrms.length > 0);
        }
    };
    Service.prototype.setUrlBase = function (c4pUrlBase) {
        this.c4pUrlBase = c4pUrlBase;
        this.c4pUrlForget = this.c4pUrlBase + "/c4p_forget.php";
        this.c4pUrlCreateAccount = this.c4pUrlBase + "/c4p_createAccount.php";
        this.c4pUrlData = this.c4pUrlBase + "/c4p_fill.php";
        this.c4pUrlFullMap = this.c4pUrlBase + "/c4p_fullMap.php";
        this.c4pUrlRefreshMap = this.c4pUrlBase + "/c4p_refreshMap.php";
        this.c4pUrlUpload = this.c4pUrlBase + "/c4p_upload.php";
        this.c4pUrlUploadFile = this.c4pUrlBase + "/c4p_uploadFile.php";
        this.c4pUrlSendEmail = this.c4pUrlBase + "/c4p_sendEmail.php";
        this.c4pUrlSendICal = this.c4pUrlBase + "/c4p_sendICal.php";
        this.c4pUrlShareDoc = this.c4pUrlBase + "/c4p_shareDoc.php";
        this.c4pUrlSfCreate = this.c4pUrlBase + "/c4p_create.php";
        this.c4pUrlSfUpdate = this.c4pUrlBase + "/c4p_update.php";
        this.c4pUrlSfDelete = this.c4pUrlBase + "/c4p_delete.php";
        this.c4pUrlErrorReport = this.c4pUrlBase + "/c4p_errorReport.php";
        this.c4pUrlFeedbackReport = this.c4pUrlBase + "/c4p_feedbackReport.php";
        this.c4pUrlFeedback = this.c4pUrlBase + "/c4p_feedback.php";
        this.c4pUrlDownload = this.c4pUrlBase + "/c4p_download.php";
        this.c4pUrlPing = this.c4pUrlBase + "/c4p_ping.php";
        if (this.c4pUrlBase.indexOf('ssl15.ovh.net') > -1) {
            if (this.c4pUrlBase.indexOf('~appsprok') > -1) {
                this.env = 'D';
            } else if (this.c4pUrlBase.indexOf('~appspron') > -1) {
                this.env = 'D';
            } else {
                this.env = 'P';
            }
        } else if ((this.c4pUrlBase.indexOf('apps4pro.net') > -1)) {
            this.env = 'D';
        } else if ((this.c4pUrlBase.indexOf('apps4pro.biz') > -1)) {
            this.env = 'D';
        } else if ((this.c4pUrlBase.indexOf('apps4pro.com') > -1)) {
            this.env = 'P';
        } else if ((this.c4pUrlBase.indexOf('apps4pro.eu') > -1)) {
            this.env = 'P';
        } else if ((this.c4pUrlBase.indexOf('ssl14.ovh.net') > -1)) {
            this.env = 'P';
        } else if ((this.c4pUrlBase.indexOf('http://127.0.0.1') > -1)) {
            this.env = 'L';
        } else if ((this.c4pUrlBase.indexOf('https://127.0.0.1') > -1)) {
            this.env = 'LS';
        } else if ((this.c4pUrlBase.indexOf('http://192.168.') > -1)) {
            this.env = 'L';
        } else if ((this.c4pUrlBase.indexOf('https://192.168.') > -1)) {
            this.env = 'LS';
        } else {
            this.env = 'P';
        }
        this.srvAnalytics.setEnabled((this.env == 'P'));
    };

    Service.prototype.setNameComposition = function (objectType, idx) {
        this.nameComposition[objectType] = idx;
    };
    Service.prototype.getNameComposition = function (objectType) {
        return this.nameComposition[objectType] || 0;
    };

    Service.prototype.getItemName = function (item) {
        var result = '';
        if ((item != null) && a4p.isDefined(c4p.Model.a4p_types[item.a4p_type])) {
            // concat names
            var idx = this.nameComposition[item.a4p_type] || 0;
            var nameList =  c4p.Model.a4p_types[item.a4p_type].displayNameList[idx];
            for (var fieldNameIdx = 0; fieldNameIdx < nameList.length; fieldNameIdx++) {
                var fieldName = nameList[fieldNameIdx];
                result = result + ' ' + item[fieldName];
            }
            result = result.trim();
        }
        return result;
    };

    Service.prototype.setSizeCss = function (value) {
        this.sizeCss = value;
    };
    Service.prototype.getSizeCss = function () {
        return this.sizeCss || '';
    };

    Service.prototype.setThemeCss = function (value) {
        this.themeCss = value;
    };
    Service.prototype.getThemeCss = function () {
        return this.themeCss || 'c4p-cosmo';
    };

    return Service;
})();

checkMocking('MockConfig', MockConfig, 'SrvConfig', SrvConfig);

/**
 * Mock of srvLog
 * Usage : var srvLog = new MockLog();
 */
var MockLog = (function() {
    var nbErrorMax = 1000;
    var nbInternalMax = 1000;
    var nbUserMax = 100;

    function Service() {
        // New log
        this.userLog = new a4p.Log(nbUserMax);
        // Use already existing logs
        this.internalLog = a4p.InternalLog;
        this.internalLog.setNbMax(nbInternalMax);
        this.errorLog = a4p.ErrorLog;
        this.errorLog.setNbMax(nbErrorMax);

        this.message = '';
        this.read = true;
        this.initDone = false;
    }
    Service.prototype.init = function () {
        if (this.initDone) return;
        this.initDone = true;
    };
    Service.prototype.getUserLog = function () {
        return this.userLog.getLog();
    };
    Service.prototype.getInternalLog = function () {
        return this.internalLog.getLog();
    };
    Service.prototype.getErrorLog = function () {
        return this.errorLog.getLog();
    };

    Service.prototype.logSuccess = function (showUser, msg, details) {
        logMessage(this, showUser, 'success', 5000, msg, details);
    };
    Service.prototype.logInfo = function (showUser, msg, details) {
        logMessage(this, showUser, 'information', 7000, msg, details);
    };
    Service.prototype.logWarning = function (showUser, msg, details) {
        logMessage(this, showUser, 'alert', 15000, msg, details);
    };
    Service.prototype.logError = function (showUser, msg, details) {
        logMessage(this, showUser, 'error', 15000, msg, details);
    };

    Service.prototype.userLogPersistentMessage = function (msg) {
        this.message = msg;
        this.read = false;
        logMessage(this, true, 'alert', false, msg);
    };

    Service.prototype.setInfoRead = function () {
        this.read = true;
    };

    function logMessage(self, showUser, type, timeout, msg, details) {
        if (showUser) {
            self.userLog.log(type + ':' + msg, null, 2);
        }
        if (type == 'error') {
            self.errorLog.log(msg, details, 2);
        } else {
            self.internalLog.log(msg, details, 2);
        }
    }
    return Service;
})();

checkMocking('MockLog', MockLog, 'SrvLog', SrvLog);

/**
 * Mock of srvSecurity
 * Usage : var srvSecurity = new MockSecurity();
 */
var MockSecurity = (function() {
    function Service() {
        this.secured = false;
        this.expected = '';
        this.login = '';
        this.password = '';
        this.serverToken = '';
        this.initDone = false;
    }
    Service.prototype.init = function () {
        if (this.initDone) return;
        this.secured = false;
        this.expected = '';
        this.login = '';
        this.password = '';
        this.serverToken = '';
        this.initDone = true;
    };
    Service.prototype.resetPINCode = function () {
    	 this.secured = false;
         this.expected = '';
    };
    Service.prototype.setSecured = function (secured) {
        this.secured = secured;
    };
    Service.prototype.isSecured = function () {
        return this.secured;
    };
    Service.prototype.isVerified = function () {
        return (this.expected.length > 0);
    };
    Service.prototype.register = function (password) {
        // register the password
        this.expected = password;
    };
    Service.prototype.verify = function (password) {
        return (password == this.expected);
    };
    Service.prototype.setDemo = function () {
        this.setA4pLogin('');
        this.setA4pPassword('');
        this.setC4pServerToken('');
    };
    Service.prototype.setA4pLogin = function (login) {
        this.login = login;
        this.setC4pServerToken('');
    };
    Service.prototype.setA4pPassword = function (password) {
        this.password = password;
        this.setC4pServerToken('');
    };
    Service.prototype.setC4pServerToken = function (serverToken) {
        this.serverToken = serverToken;
    };
    Service.prototype.getA4pLogin = function () {
        return this.login;
    };
    Service.prototype.getA4pPassword = function () {
        return this.password;
    };
    Service.prototype.getHttpRequestToken = function () {
        var time = Math.floor(new Date().getTime()/1000);// seconds since 1/1/1970
        var md5 = calcMD5(time.toString() + '|' + this.login + '|' + this.password);
        return time + '|' + md5 + '|' + this.serverToken;
    };
    return Service;
})();

checkMocking('MockSecurity', MockSecurity, 'SrvSecurity', SrvSecurity);

/**
 * Mock of srvLocale
 * Usage : var srvLocale = new MockLocale();
 */
var MockLocale = (function() {
    function Service() {
        this.localeDir = '';
        this.translations = c4p.Locale.en;
        this.currency = "\xe2\x82\xac";// Set by Salesforce : utf8Symbol or isoCode
        this.language = 'en';// Set by Salesforce
        this.langs = [
            {code:'en', title:'English'},
            {code:'fr', title:"French"}
        ];
        this.lang = this.langs[0];// english by default
        this.numberPatterns = [
            {
                currencySymbol:'\x24',
                decimalSeparator:'.',
                groupSeparator:',',
                decimalPattern:{
                    minInt:1,
                    minFrac:0,
                    maxFrac:3,
                    posPre:'',
                    posSuf:'',
                    negPre:'-',
                    negSuf:'',
                    gSize:3,
                    lgSize:3
                },
                currencyPattern:{
                    minInt:1,
                    minFrac:2,
                    maxFrac:2,
                    posPre:'\u00A4',
                    posSuf:'',
                    negPre:'(\u00A4',
                    negSuf:')',
                    gSize:3,
                    lgSize:3
                }
            },
            {
                currencySymbol:"\xe2\x82\xac",
                decimalSeparator:',',
                groupSeparator:' ',
                decimalPattern:{
                    minInt:1,
                    minFrac:0,
                    maxFrac:3,
                    posPre:'',
                    posSuf:'',
                    negPre:'-',
                    negSuf:'',
                    gSize:3,
                    lgSize:3
                },
                currencyPattern:{
                    minInt:1,
                    minFrac:2,
                    maxFrac:2,
                    posPre:'',
                    posSuf:' \u00A4',
                    negPre:'(',
                    negSuf:' \u00A4)',
                    gSize:3,
                    lgSize:3
                }
            }
        ];
        this.numberPattern = this.numberPatterns[0];// english by default
        this.datetimePatterns = [
            {
                month:'January,February,March,April,May,June,July,August,September,October,November,December'.split(','),
                shortMonth:'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec'.split(','),
                day:'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday'.split(','),
                shortDay:'Sun,Mon,Tue,Wed,Thu,Fri,Sat'.split(','),
                ampms:['AM', 'PM'],
                medium:'MMM d, y h:mm:ss a',
                short: 'M/d/yy h:mm a',
                fullDate: 'EEEE, MMMM d, y',
                longDate: 'MMMM d, y',
                mediumDate: 'MMM d, y',
                shortDate: 'M/d/yy',
                mediumTime: 'h:mm:ss a',
                shortTime: 'h:mm a'
            },
            {
                month:'Janvier,F\u00E9vrier,Mars,Avril,Mai,Juin,Juillet,Aout,Septembre,Octobre,Novembre,D\u00E9cembre'.split(','),
                shortMonth:'Jan,Fev,Mar,Avr,Mai,Jun,Jul,Aou,Sep,Oct,Nov,Dec'.split(','),
                day:'Dimanche,Lundi,Mardi,Mercredi,Jeudi,Vendredi,Samedi'.split(','),
                shortDay:'Dim,Lun,Mar,Mer,Jeu,Ven,Sam'.split(','),
                ampms:['AM', 'PM'],
                medium:'d MMM y HH:mm:ss',
                short: 'd/M/yy HH:mm a',
                fullDate: 'EEEE, d MMMM y',
                longDate: 'd MMMM y',
                mediumDate: 'd MMM y',
                shortDate: 'd/M/yy',
                mediumTime: 'HH:mm:ss',
                shortTime: 'HH:mm'
            }
        ];
        this.datetimePattern = this.datetimePatterns[0];// english by default
        this.initDone = false;
    }
    Service.prototype.resetLocale = function () {
        if (this.initDone) return;
        this.translations = c4p.Locale.en;
        this.lang = this.langs[0];
        this.numberPattern = this.numberPatterns[0];
    };
    Service.prototype.init = function () {
        if (this.initDone) return;
        this.translations = c4p.Locale.en;
        this.lang = this.langs[0];
        this.numberPattern = this.numberPatterns[0];
        this.initDone = true;
    };
    Service.prototype.setLocaleDir = function (localeDir) {
        this.localeDir = localeDir;
    };
    Service.prototype.startLoading = function (callback) {
        callback();
    };
    Service.prototype.setTranslations = function (translations) {
        this.translations = translations;
    };
    Service.prototype.setLanguage = function (language) {
        language = language.toLowerCase();
        if (this.language != language) {
            var langs = getLangParts(language);
            for (var i = this.langs.length - 1; i >= 0; i--) {
                if ((this.langs[i].code == langs[2])
                    || (this.langs[i].code == langs[1])
                    || (this.langs[i].code == langs[0])) {
                    this.language = language;
                    this.setLang(this.langs[i]);
                    return;
                }
            }
            // No lang found => no change
        }
    };

    Service.prototype.getLanguage = function () {
        return this.language;
    };
    Service.prototype.setLang = function (lang) {
        this.lang = lang;
        var langs = getLangParts(this.lang.code);
        this.lang1 = langs[0];
        this.lang2 = langs[1];
        this.lang3 = langs[2];
        this.numberPattern = this.numberPatterns[0];
        this.datetimePattern = this.datetimePatterns[0];// english by default
        for (var i = this.langs.length - 1; i >= 0; i--) {
            if ((this.langs[i].code == this.lang3)
                || (this.langs[i].code == this.lang2)
                || (this.langs[i].code == this.lang1)) {
                this.numberPattern = this.numberPatterns[i];
                this.datetimePattern = this.datetimePatterns[i];
                break;
            }
        }
        this.startLoading(function () {});
    };
    Service.prototype.setCurrency = function (currency) {
    	this.currency = currency;
    };
    Service.prototype.formatCurrency = function (amount, currencySymbol) {
        if (typeof currencySymbol == 'undefined') {
            currencySymbol = this.numberPattern.currencySymbol;
        }
        return formatDecimal(amount, this.numberPattern.currencyPattern,
            this.numberPattern.groupSeparator, this.numberPattern.decimalSeparator, 2).
            replace(/\u00A4/g, a4p.Utf8.decode(currencySymbol));
    };
    Service.prototype.formatNumber = function (number, fractionSize) {
        return formatDecimal(number, this.numberPattern.decimalPattern,
            this.numberPattern.groupSeparator, this.numberPattern.decimalSeparator, fractionSize);
    };
    Service.prototype.formatDate = function (date, format) {
        return formatDate(date, format, this.datetimePattern);
    };
    function clear() {
        this.translations = c4p.Locale.en;
        this.currency = "\xe2\x82\xac";// Set by Salesforce : utf8Symbol or isoCode ('\x24' for Dollar)
        this.langs = [
            {code:'en', title:'English'},
            {code:'fr', title:"Francais"}
        ];
        this.lang = this.langs[0];// english by default
        this.language = 'en';// Set by Salesforce
        var langs = getLangParts(self.lang.code);
        self.lang1 = langs[0];
        self.lang2 = langs[1];
        self.lang3 = langs[2];
        self.numberPatterns = [
            {
                decimalSeparator:'.',
                groupSeparator:',',
                decimalPattern:{
                    minInt:1,
                    minFrac:0,
                    maxFrac:3,
                    posPre:'',
                    posSuf:'',
                    negPre:'-',
                    negSuf:'',
                    gSize:3,
                    lgSize:3
                },
                currencyPattern:{
                    minInt:1,
                    minFrac:2,
                    maxFrac:2,
                    posPre:'\u00A4',
                    posSuf:'',
                    negPre:'(\u00A4',
                    negSuf:')',
                    gSize:3,
                    lgSize:3
                }
            },
            {
                decimalSeparator:',',
                groupSeparator:' ',
                decimalPattern:{
                    minInt:1,
                    minFrac:0,
                    maxFrac:3,
                    posPre:'',
                    posSuf:'',
                    negPre:'-',
                    negSuf:'',
                    gSize:3,
                    lgSize:3
                },
                currencyPattern:{
                    minInt:1,
                    minFrac:2,
                    maxFrac:2,
                    posPre:'',
                    posSuf:' \u00A4',
                    negPre:'(',
                    negSuf:' \u00A4)',
                    gSize:3,
                    lgSize:3
                }
            }
        ];
        self.numberPattern = self.numberPatterns[0];// english by default
        self.datetimePatterns = [
            {
                month:'January,February,March,April,May,June,July,August,September,October,November,December'.split(','),
                shortMonth:'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec'.split(','),
                day:'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday'.split(','),
                shortDay:'Sun,Mon,Tue,Wed,Thu,Fri,Sat'.split(','),
                ampms:['AM', 'PM'],
                medium:'MMM d, y h:mm:ss a',
                short: 'M/d/yy h:mm a',
                fullDate: 'EEEE, MMMM d, y',
                longDate: 'MMMM d, y',
                mediumDate: 'MMM d, y',
                shortDate: 'M/d/yy',
                mediumTime: 'h:mm:ss a',
                shortTime: 'h:mm a'
            },
            {
                month:'Janvier,F\u00E9vrier,Mars,Avril,Mai,Juin,Juillet,Aout,Septembre,Octobre,Novembre,D\u00E9cembre'.split(','),
                shortMonth:'Jan,Fev,Mar,Avr,Mai,Jun,Jul,Aou,Sep,Oct,Nov,Dec'.split(','),
                day:'Dimanche,Lundi,Mardi,Mercredi,Jeudi,Vendredi,Samedi'.split(','),
                shortDay:'Dim,Lun,Mar,Mer,Jeu,Ven,Sam'.split(','),
                ampms:['AM', 'PM'],
                medium:'d MMM y HH:mm:ss',
                short: 'd/M/yy HH:mm a',
                fullDate: 'EEEE, d MMMM y',
                longDate: 'd MMMM y',
                mediumDate: 'd MMM y',
                shortDate: 'd/M/yy',
                mediumTime: 'HH:mm:ss',
                shortTime: 'HH:mm'
            }
        ];
        self.datetimePattern = self.datetimePatterns[0];// english by default
    }
    function getLangParts(code) {
        var s = code.toLowerCase();
        s = s.replace(/-/g, '_');
        var names = s.split('_');
        var max = names.length;
        var lang1 = "";
        var lang2 = "";
        var lang3 = "";
        if (0 < max) {
            lang1 = names[0];
            lang2 = names[0];
            lang3 = names[0];
            if (1 < max) {
                lang2 = lang2 + "_" + names[1];
                lang3 = lang3 + "_" + names[1];
                if (2 < max) {
                    lang3 = lang3 + "_" + names[2];
                }
            }
        }
        return [lang1, lang2, lang3];
    }
    function formatDecimal(number, pattern, groupSep, decimalSep, fractionSize) {
        if (isNaN(number) || !isFinite(number)) return '';

        var isNegative = number < 0;
        number = Math.abs(number);
        var numStr = number + '',
            formatedText = '',
            parts = [];

        if (numStr.indexOf('e') !== -1) {
            formatedText = numStr;
        } else {
            var fractionLen = (numStr.split('.')[1] || '').length;// use standard float decimal separator

            // determine fractionSize if it is not specified
            if (typeof fractionSize == 'undefined') {
                fractionSize = Math.min(Math.max(pattern.minFrac, fractionLen), pattern.maxFrac);
            }

            var pow = Math.pow(10, fractionSize);
            number = Math.round(number * pow) / pow;
            var fraction = ('' + number).split('.');// use standard float decimal separator
            var whole = fraction[0];
            fraction = fraction[1] || '';

            var pos = 0,
                lgroup = pattern.lgSize,
                group = pattern.gSize;

            if (whole.length >= (lgroup + group)) {
                pos = whole.length - lgroup;
                for (var i = 0; i < pos; i++) {
                    if ((pos - i) % group === 0 && i !== 0) {
                        formatedText += groupSep;
                    }
                    formatedText += whole.charAt(i);
                }
            }

            for (i = pos; i < whole.length; i++) {
                if ((whole.length - i) % lgroup === 0 && i !== 0) {
                    formatedText += groupSep;
                }
                formatedText += whole.charAt(i);
            }

            // format fraction part.
            while (fraction.length < fractionSize) {
                fraction += '0';
            }

            if (fractionSize) formatedText += decimalSep + fraction.substr(0, fractionSize);
        }

        parts.push(isNegative ? pattern.negPre : pattern.posPre);
        parts.push(formatedText);
        parts.push(isNegative ? pattern.negSuf : pattern.posSuf);
        return parts.join('');
    }
    function dateGetter(name, size, offset, trim) {
        return function (date, datetimePattern) {
            var value = date['get' + name]();
            if (offset > 0 || value > -offset)
                value += offset;
            if (value === 0 && offset == -12) value = 12;
            return a4pPadNumber(value, size, trim);
        };
    }
    function dateStrGetter(name, translateKey) {
        return function (date, datetimePattern) {
            var value = date['get' + name]();
            return datetimePattern[translateKey][value];
        };
    }
    function timeZoneGetter(date, datetimePattern) {
        var offset = date.getTimezoneOffset();
        return a4pPadNumber(offset / 60, 2) + a4pPadNumber(Math.abs(offset % 60), 2);
    }
    function ampmGetter(date, datetimePattern) {
        return date.getHours() < 12 ? datetimePattern.ampms[0] : datetimePattern.ampms[1];
    }
    var DATE_FORMATS = {
      yyyy: dateGetter('FullYear', 4, 0, false),
        yy: dateGetter('FullYear', 2, 0, true),
         y: dateGetter('FullYear', 1, 0, false),
      MMMM: dateStrGetter('Month', 'month'),
       MMM: dateStrGetter('Month', 'shortMonth'),
        MM: dateGetter('Month', 2, 1, false),
         M: dateGetter('Month', 1, 1, false),
        dd: dateGetter('Date', 2, 0, false),
         d: dateGetter('Date', 1, 0, false),
        HH: dateGetter('Hours', 2, 0, false),
         H: dateGetter('Hours', 1, 0, false),
        hh: dateGetter('Hours', 2, -12, false),
         h: dateGetter('Hours', 1, -12, false),
        mm: dateGetter('Minutes', 2, 0, false),
         m: dateGetter('Minutes', 1, 0, false),
        ss: dateGetter('Seconds', 2, 0, false),
         s: dateGetter('Seconds', 1, 0, false),
      EEEE: dateStrGetter('Day', 'day'),
       EEE: dateStrGetter('Day', 'shortDay'),
         a: ampmGetter,
         Z: timeZoneGetter
    };
    var DATE_FORMATS_SPLIT = /((?:[^yMdHhmsaZE']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|d+|H+|h+|m+|s+|a|Z))(.*)/;
    var NUMBER_STRING = /^\d+$/;
    var R_ISO8601_STR = /^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d{3}))?)?)?(Z|([+-])(\d\d):?(\d\d)))?$/;
    function jsonStringToDate(string) {
        var match;
        if (match = string.match(R_ISO8601_STR)) {
            var date = new Date(0),
                tzHour = 0,
                tzMin = 0;
            if (match[9]) {
                tzHour = int(match[9] + match[10]);
                tzMin = int(match[9] + match[11]);
            }
            date.setUTCFullYear(int(match[1]), int(match[2]) - 1, int(match[3]));
            date.setUTCHours(int(match[4] || 0) - tzHour, int(match[5] || 0) - tzMin, int(match[6] || 0), int(match[7] || 0));
            return date;
        }
        return string;
    }
    function formatDate(date, format, datetimePattern) {
        var text = '',
            fn, match;

        format = format || 'mediumDate';
        format = datetimePattern[format] || format;
        if (typeof date == 'string') {
            if (NUMBER_STRING.test(date)) {
                date = int(date);
            } else {
                date = jsonStringToDate(date);
            }
        }

        if (typeof date == 'number') {// isNumber(date)
            date = new Date(date);
        }

        if (toString.apply(date) != '[object Date]') {// !isDate(date)
            return date;
        }

        while (format) {
            match = DATE_FORMATS_SPLIT.exec(format);
            if (match) {
                var value = match[1];
                fn = DATE_FORMATS[value];
                text += fn ? fn(date, datetimePattern) : value.replace(/(^'|'$)/g, '').replace(/''/g, "'");
                format = match.pop();
            } else {
                fn = DATE_FORMATS[format];
                text += fn ? fn(date, datetimePattern) : format.replace(/(^'|'$)/g, '').replace(/''/g, "'");
                format = null;
            }
        }

        return text;
    }
    Service.prototype.getMonths = function() {
        return [
            {idx: 0, name: this.translations.htmlTextJanuary, shortName: this.translations.htmlTextShortJanuary},
            {idx: 1, name: this.translations.htmlTextFebruary, shortName: this.translations.htmlTextShortFebruary},
            {idx: 2, name: this.translations.htmlTextMarch, shortName: this.translations.htmlTextShortMarch},
            {idx: 3, name: this.translations.htmlTextApril, shortName: this.translations.htmlTextShortApril},
            {idx: 4, name: this.translations.htmlTextMay, shortName: this.translations.htmlTextShortMay},
            {idx: 5, name: this.translations.htmlTextJune, shortName: this.translations.htmlTextShortJune},
            {idx: 6, name: this.translations.htmlTextJuly, shortName: this.translations.htmlTextShortJuly},
            {idx: 7, name: this.translations.htmlTextAugust, shortName: this.translations.htmlTextShortAugust},
            {idx: 8, name: this.translations.htmlTextSeptember, shortName: this.translations.htmlTextShortSeptember},
            {idx: 9, name: this.translations.htmlTextOctober, shortName: this.translations.htmlTextShortOctober},
            {idx: 10, name: this.translations.htmlTextNovember, shortName: this.translations.htmlTextShortNovember},
            {idx: 11, name: this.translations.htmlTextDecember, shortName: this.translations.htmlTextShortDecember}
        ];
    };
    Service.prototype.getHoursDay = function() {
    	var hours = [];
        for (var i = 0; i <= 24; i++) {
        	var h = "" + i;
        	if (h.length < 2) {h = "0" + h;} // add 0 before if length == 1
        	var text = h;//+":00";
        	var cssClass = '';
        	if (i < 9 || (12 <= i && i < 14) || i >= 19 ) cssClass = 'c4p-hour-disabled'; //TODO inactive hours
        	var hour = {hour:i, text:text, cssClass:cssClass};
        	hours.push(hour);
        }
        return hours;
    };
    return Service;
})();

checkMocking('MockLocale', MockLocale, 'SrvLocale', SrvLocale);

/**
 * Mock of srvFileStorage
 * Usage : var srvFileStorage = new MockFileStorage();
 */
/*
var MockFileStorage = (function() {
    function Service() {
        this.version = "0.1";
        this.grantedBytes = 0;
        this.fs = null;
    }
    Service.prototype.init = function (storageType, grantBytes, onSuccess, onFailure) {
        this.grantBytes = grantBytes || 10 * 1024 * 1024;// 10 Mb
        onSuccess();
    };
    Service.prototype.createDir = function (dirPath, onSuccess, onFailure) {
        var dirEntry = {};
        onSuccess(dirEntry);
    };
    Service.prototype.getDir = function (dirPath, onSuccess, onFailure) {
        var dirEntry = {};
        onSuccess(dirEntry);
    };
    Service.prototype.readDirectory = function (dirPath, onSuccess, onFailure) {
        var dirEntries = [];
        var fileEntries = [];
        onSuccess(dirEntries, fileEntries);
    };
    Service.prototype.readFullDirectory = function (dirPath, onSuccess, onFailure) {
        var fileEntries = [];
        onSuccess(fileEntries);
    };
    Service.prototype.deleteDir = function (dirPath, onSuccess, onFailure) {
        onSuccess();
    };
    Service.prototype.deleteFullDir = function (dirPath, onSuccess, onFailure) {
        onSuccess();
    };
    Service.prototype.getFileFromUrl = function (fileUrl, onSuccess, onFailure) {
        var fileEntry = {};
        onSuccess(fileEntry);
    };
    Service.prototype.getFileFromUri = function (fileUri, onSuccess, onFailure) {
        var fileEntry = {};
        onSuccess(fileEntry);
    };
    Service.prototype.getUrlFromFile = function (filePath, onSuccess, onFailure) {
        var url = '';
        onSuccess(url);
    };
    Service.prototype.getUriFromFile = function (filePath, onSuccess, onFailure) {
        var uri = '';
        onSuccess(uri);
    };
    Service.prototype.getModificationTimeFromFile = function (filePath, onSuccess, onFailure) {
        var time = new Date().getTime();
        onSuccess(new Date(time));
    };
    Service.prototype.getFile = function (filePath, onSuccess, onFailure) {
        var fileEntry = {};
        onSuccess(fileEntry);
    };
    Service.prototype.newFile = function (filePath, onSuccess, onFailure) {
        var fileEntry = {};
        onSuccess(fileEntry);
    };
    Service.prototype.getOrNewFile = function (filePath, onSuccess, onFailure) {
        var fileEntry = {};
        onSuccess(fileEntry);
    };
    Service.prototype.readFileAsDataURL = function (filePath, onSuccess, onFailure) {
        var dataUrl = '';
        onSuccess(dataUrl);
    };
    Service.prototype.readFileAsText = function (filePath, onSuccess, onFailure, onProgress, from, length) {
        var text = '';
        onSuccess(text);
    };
    Service.prototype.readFileAsArrayBuffer = function (filePath, onSuccess, onFailure, onProgress, from, length) {
        var text = '';
        onSuccess(text);
    };
    Service.prototype.readFileAsBinaryString = function (filePath, onSuccess, onFailure, onProgress, from, length) {
        var text = '';
        onSuccess(text);
    };
    Service.prototype.writeFile = function (fromBlob, toFilePath, onSuccess, onFailure) {
        var fileEntry = {};
        onSuccess(fileEntry);
    };
    Service.prototype.appendFile = function (fromBlob, toFilePath, onSuccess, onFailure) {
        var fileEntry = {};
        onSuccess(fileEntry);
    };
    Service.prototype.deleteFile = function (filePath, onSuccess, onFailure) {
        onSuccess();
    };
    Service.prototype.copyFile = function (fromFilePath, toFilePath, onSuccess, onFailure) {
        var toFileEntry = {};
        onSuccess(toFileEntry);
    };
    Service.prototype.moveFile = function (fromFilePath, toFilePath, onSuccess, onFailure) {
        var toFileEntry = {};
        onSuccess(toFileEntry);
    };
    Service.prototype.moveFileEntry = function (fromFileEntry, toFilePath, onSuccess, onFailure) {
        var toFileEntry = {};
        onSuccess(toFileEntry);
    };
    return Service;
})();
*/

/**
 * Mock of srvDataTransfer
 * Usage : var srvDataTransfer = new MockDataTransfer();
 */
var MockDataTransfer = (function() {
    function Service(deferService, $rootScope) {
        this.defer = deferService;
        this.rootScope = $rootScope;
        // Test specifics
        this.pendingSends = [];
        this.pendingRecvs = [];
    }
    Service.prototype.sendData = function (url, params, headers, timeout) {
        var self = this,
            deferred = this.defer.defer(),
            promise = deferred.promise;
        this.pendingSends.push({url:url, params:params, headers:headers, timeout:timeout, deferred:deferred});
        return promise;
    };
    Service.prototype.recvData = function (url, timeout) {
        var self = this,
            deferred = this.defer.defer(),
            promise = deferred.promise;
        this.pendingRecvs.push({url:url, timeout:timeout, deferred:deferred});
        return promise;
    };
    // Test specifics
    Service.prototype.ackSend = function (data, status, headers) {
        var send = this.pendingSends.splice(0, 1)[0];
        if (a4p.isUndefined(headers)) {
            headers = {'Content-Type':'application/json; charset=utf-8'};
        }
        if (a4p.isUndefined(status)) {
            status = 200;
        }
        if (a4p.isUndefined(data)) {
            if (send.url.substr(send.url.length-19, 19) == "/c4p_uploadFile.php") {
                if (send.params.idx >= send.params.nb) {
                    if (send.params.uploadFileInCrm) {
                        var log = send.params.shareFileInCrm ? 'UploadFile shared in CRM done.' : 'UploadFile in CRM done.';
                        var created = [];
                        for (var i = 0, n = send.params.created.length; i < n; i++) {
                            created.push({
                                crm: send.params.created[i].crm,
                                tmpId: send.params.created[i].id,
                                id: send.params.created[i].crm+'_ID_'+send.params.id
                            });
                        }
                        data = {
                            responseOK: true,
                            log: log,
                            type: send.params.type,
                            id: send.params.id,
                            askedCreated: angular.copy(send.params.created),
                            created: created,
                            errors: [],
                            md5: 'dummy_md5',
                            size: 'dummy_size',
                            error: 0,
                            errorName: 'UPLOAD_ERR_OK'
                        };
                    } else {
                        data = {
                            responseOK: true,
                            log: 'UploadFile in C4P done.',
                            //type: send.params.type,
                            //id: send.params.id,
                            //askedCreated: angular.copy(send.params.created),
                            //created: created,
                            md5: 'dummy_md5',
                            size: 'dummy_size',
                            error: 0,
                            errorName: 'UPLOAD_ERR_OK'
                        };
                    }
                } else {
                    data = {
                        responseOK: true,
                        log: 'UploadFile part ' + send.params.idx + '/' + send.params.nb + ' in C4P done.',
                        md5: 'dummy_md5',
                        size: 'dummy_size',
                        error: 0,
                        errorName: 'UPLOAD_ERR_OK'
                    };
                }
            } else if (send.url.substr(send.url.length-18, 18) == "/c4p_sendEmail.php") {
                data = {
                    responseOK: true,
                    log: 'SendEmail done.',
                    id: {sf_id: 'sf_ID_'+send.params.object_id.dbid},
                    responseStatus: 'Create email success.'
                };
            } // TODO: send ICal
            else if (send.url.substr(send.url.length-17, 17) == "/c4p_shareDoc.php") {
                if (a4p.isDefined(send.params.file.id) && a4p.isDefined(send.params.file.id.sf_id)) {
                    data = {
                        responseOK: true,
                        log: 'Document shared.',
                        type:  'FeedItem',
                        id: {sf_id: 'sf_ID_'+send.params.file.id.sf_id}
                    };
                } else {
                    data = {
                        responseOK: true,
                        log: 'Document shared.',
                        type:  'FeedItem',
                        id: {sf_id: 'sf_ID_'+send.params.file.uid}
                    };
                }
            } else if (send.url.substr(send.url.length-15, 15) == "/c4p_create.php") {
                var created = [];
                for (var i = 0, n = send.params.created.length; i < n; i++) {
                    created.push({
                        crm: send.params.created[i].crm,
                        tmpId: send.params.created[i].id,
                        id: send.params.created[i].crm+'_ID_'+send.params.id
                    });
                }
                data = {
                    responseOK: true,
                    type: send.params.type,
                    id: send.params.id,
                    askedCreated: angular.copy(send.params.created),
                    created: created,
                    errors: []
                };
            } else if (send.url.substr(send.url.length-15, 15) == "/c4p_update.php") {
                data = {
                    responseOK: true,
                    type: send.params.type,
                    id: send.params.id,
                    askedUpdated: angular.copy(send.params.updated),
                    updated: angular.copy(send.params.updated),
                    errors: []
                };
            } else if (send.url.substr(send.url.length-15, 15) == "/c4p_delete.php") {
                data = {
                    responseOK: true,
                    type: send.params.type,
                    id: send.params.id,
                    askedDeleted: angular.copy(send.params.deleted),
                    deleted: angular.copy(send.params.deleted),
                    errors: []
                };
            } else {
                data = {
                    log:'ok',
                    id:{
                        dbid:'A4P_DOC_001',
                        sf_id:'SF_DOC_001'
                    }
                };
            }
        }
        a4p.safeApply(this.rootScope, function() {
            send.deferred.resolve({data:data, status:status, headers:function(key) {return headers[key];}});
        });
    };
    Service.prototype.errSend = function (data, status) {
        var send = this.pendingSends.splice(0, 1)[0];
        if (a4p.isUndefined(status)) {
            status = 500;
        }
        if (a4p.isUndefined(data)) {
            data = 'Server error.';
        }
        var msg = 'Data upload failure : '
            + 'response=' + data + " (status=" + status + ")";
        a4p.safeApply(this.rootScope, function() {
            send.deferred.reject({data:msg, status:'error'});
        });
    };
    Service.prototype.ackRecv = function (data, status, headers) {
        var recv = this.pendingRecvs.splice(0, 1)[0];
        if (a4p.isUndefined(headers)) {
            headers = {'Content-Type':'application/json; charset=utf-8'};
        }
        if (a4p.isUndefined(status)) {
            status = 200;
        }
        if (a4p.isUndefined(data)) {
            data = {
                log:'ok',
                id:{
                    dbid:'A4P_DOC_001',
                    sf_id:'SF_DOC_001'
                }
            };
        }
        a4p.safeApply(this.rootScope, function() {
            recv.deferred.resolve({data:data, status:status, headers:function(key) {return headers[key];}});
        });
    };
    Service.prototype.errRecv = function (data, status) {
        var recv = this.pendingRecvs.splice(0, 1)[0];
        if (a4p.isUndefined(status)) {
            status = 500;
        }
        if (a4p.isUndefined(data)) {
            data = 'Server error.';
        }
        var msg = 'Data download failure : '
            + 'response=' + data + " (status=" + status + ")";
        a4p.safeApply(this.rootScope, function() {
            recv.deferred.reject({data:msg, status:'error'});
        });
    };
    return Service;
})();

checkMocking('MockDataTransfer', MockDataTransfer, 'SrvDataTransfer', SrvDataTransfer,
    ['ackSend', 'errSend', 'ackRecv', 'errRecv'], []);

/**
 * Mock of srvFileTransfer
 * Usage : var srvFileTransfer = new MockSrvFileTransfer();
 */
var MockSrvFileTransfer = (function() {
    function Service(deferService, $rootScope) {
        this.defer = deferService;
        this.rootScope = $rootScope;
        // Test specifics
        this.pendingSends = [];
        this.pendingRecvs = [];
    }
    Service.prototype.sendFile = function (filePath, options, url, params, headers, timeout) {
        var self = this,
            deferred = this.defer.defer(),
            promise = deferred.promise;
        params.idx = 1;
        params.nb = 1;
        this.pendingSends.push({filePath:filePath, options:options, url:url, params:params, headers:headers, timeout:timeout, deferred:deferred});
        return promise;
    };
    Service.prototype.recvFile = function (filePath, url, timeout) {
        var self = this,
            deferred = this.defer.defer(),
            promise = deferred.promise;
        this.pendingRecvs.push({filePath:filePath, url:url, timeout:timeout, deferred:deferred});
        return promise;
    };
    // Test specifics
    Service.prototype.ackSend = function (data, status, headers) {
        var send = this.pendingSends.splice(0, 1)[0];
        if (a4p.isUndefined(headers)) {
            headers = {'Content-Type':'application/json; charset=utf-8'};
        }
        if (a4p.isUndefined(status)) {
            status = 200;
        }
        if (a4p.isUndefined(data)) {
            if (send.url.substr(send.url.length-19, 19) == "/c4p_uploadFile.php") {
                if (send.params.idx >= send.params.nb) {
                    if (send.params.uploadFileInCrm) {
                        var log = send.params.shareFileInCrm ? 'UploadFile shared in CRM done.' : 'UploadFile in CRM done.';
                        var created = [];
                        for (var i = 0, n = send.params.created.length; i < n; i++) {
                            created.push({
                                crm: send.params.created[i].crm,
                                tmpId: send.params.created[i].id,
                                id: send.params.created[i].crm+'_ID_'+send.params.id
                            });
                        }
                        data = {
                            responseOK: true,
                            log: log,
                            type: send.params.type,
                            id: send.params.id,
                            askedCreated: angular.copy(send.params.created),
                            created: created,
                            errors: [],
                            md5: 'dummy_md5',
                            size: 'dummy_size',
                            error: 0,
                            errorName: 'UPLOAD_ERR_OK'
                        };
                    } else {
                        data = {
                            responseOK: true,
                            log: 'UploadFile in C4P done.',
                            //type: send.params.type,
                            //id: send.params.id,
                            //askedCreated: angular.copy(send.params.created),
                            //created: created,
                            md5: 'dummy_md5',
                            size: 'dummy_size',
                            error: 0,
                            errorName: 'UPLOAD_ERR_OK'
                        };
                    }
                } else {
                    data = {
                        responseOK: true,
                        log: 'UploadFile part ' + send.params.idx + '/' + send.params.nb + ' in C4P done.',
                        md5: 'dummy_md5',
                        size: 'dummy_size',
                        error: 0,
                        errorName: 'UPLOAD_ERR_OK'
                    };
                }
            } else if (send.url.substr(send.url.length-18, 18) == "/c4p_sendEmail.php") {
                data = {
                    responseOK: true,
                    log: 'SendEmail done.',
                    id: {sf_id: 'sf_ID_'+send.params.object_id.dbid},
                    responseStatus: 'Create email success.'
                };
            } // TODO: send ICal
            else if (send.url.substr(send.url.length-17, 17) == "/c4p_shareDoc.php") {
                if (a4p.isDefined(send.params.file.id) && a4p.isDefined(send.params.file.id.sf_id)) {
                    data = {
                        responseOK: true,
                        log: 'Document shared.',
                        type:  'FeedItem',
                        id: {sf_id: 'sf_ID_'+send.params.file.id.sf_id}
                    };
                } else {
                    data = {
                        responseOK: true,
                        log: 'Document shared.',
                        type:  'FeedItem',
                        id: {sf_id: 'sf_ID_'+send.params.file.uid}
                    };
                }
            } else if (send.url.substr(send.url.length-15, 15) == "/c4p_create.php") {
                var created = [];
                for (var i = 0, n = send.params.created.length; i < n; i++) {
                    created.push({
                        crm: send.params.created[i].crm,
                        tmpId: send.params.created[i].id,
                        id: send.params.created[i].crm+'_ID_'+send.params.id
                    });
                }
                data = {
                    responseOK: true,
                    type: send.params.type,
                    id: send.params.id,
                    askedCreated: angular.copy(send.params.created),
                    created: created,
                    errors: []
                };
            } else if (send.url.substr(send.url.length-15, 15) == "/c4p_update.php") {
                data = {
                    responseOK: true,
                    type: send.params.type,
                    id: send.params.id,
                    askedUpdated: angular.copy(send.params.updated),
                    updated: angular.copy(send.params.updated),
                    errors: []
                };
            } else if (send.url.substr(send.url.length-15, 15) == "/c4p_delete.php") {
                data = {
                    responseOK: true,
                    type: send.params.type,
                    id: send.params.id,
                    askedDeleted: angular.copy(send.params.deleted),
                    deleted: angular.copy(send.params.deleted),
                    errors: []
                };
            } else {
                data = {
                    log:'ok',
                    id:{
                        dbid:'A4P_DOC_001',
                        sf_id:'SF_DOC_001'
                    }
                };
            }
        }
        a4p.safeApply(this.rootScope, function() {
            send.deferred.resolve({data:data, status:status, headers:function(key) {return headers[key];}});
        });
    };
    Service.prototype.errSend = function (data, status) {
        var send = this.pendingSends.splice(0, 1)[0];
        if (a4p.isUndefined(status)) {
            status = 500;
        }
        if (a4p.isUndefined(data)) {
            data = 'Server error.';
        }
        var msg = 'File upload failure for ' + send.filePath + ' : '
            + 'response=' + data + " (status=" + status + ")";
        a4p.safeApply(this.rootScope, function() {
            send.deferred.reject({data:msg, status:'error'});
        });
    };
    Service.prototype.ackRecv = function (data, status) {
        var recv = this.pendingRecvs.splice(0, 1)[0];
        if (a4p.isUndefined(status)) {
            status = 'filesystem:https://127.0.0.1/persistent/' + recv.filePath;
        }
        if (a4p.isUndefined(data)) {
            data = '';
        }
        a4p.safeApply(this.rootScope, function() {
            recv.deferred.resolve({data:data, status:status});
        });
    };
    Service.prototype.errRecv = function (data, status) {
        var recv = this.pendingRecvs.splice(0, 1)[0];
        if (a4p.isUndefined(status)) {
            status = 500;
        }
        if (a4p.isUndefined(data)) {
            data = 'Server error.';
        }
        var msg = 'File download failure for ' + recv.filePath + ' : '
            + 'response=' + data + " (status=" + status + ")";
        a4p.safeApply(this.rootScope, function() {
            recv.deferred.reject({data:msg, status:'error'});
        });
    };
    return Service;
})();

checkMocking('MockSrvFileTransfer', MockSrvFileTransfer, 'SrvFileTransfer', SrvFileTransfer,
    ['ackSend', 'errSend', 'ackRecv', 'errRecv'], []);
