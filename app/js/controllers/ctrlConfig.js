

/**
 * Config page controller
 *
 * @param $scope
 * @param srvConfig
 * @param srvLog
 * @param srvLocale
 * @param srvSecurity
 * @param srvDataTransfer
 * @param $modal
 * @param srvAnalytics
 * @param version
 */
function ctrlConfig($scope, srvConfig, srvLog, srvLocale, srvSecurity, srvDataTransfer, $modal, srvAnalytics, version) {
'use strict';

    // Variables

    $scope.srvConfig = srvConfig;

    $scope.configLogin = {email:srvSecurity.getA4pLogin(), password:''};
    $scope.configEmail = srvSecurity.getA4pLogin();
    $scope.configPassword = '';
    $scope.warningEmail = false;
    $scope.warningPassword = false;
    $scope.secureMode = srvSecurity.isSecured();
    $scope.sizeCss = srvConfig.getSizeCss();
    $scope.themeCss = srvConfig.getThemeCss();
    $scope.themes = [
        {key:"c4p-default", href: 'l4p/css/c4p-theme-bootstrap.css'},
        {key:"c4p-amelia",  href: 'l4p/css/c4p-theme-amelia.css'},
        {key:"c4p-cosmo",   href: 'l4p/css/c4p-theme-cosmo.css'},
        {key:"c4p-apps4pro",   href: 'l4p/css/c4p-theme-apps4pro.css'}
    ];

    /**
     *
     * Methods
     */

    $scope.setEmail = function (email) {
        srvSecurity.setA4pLogin(email);
        $scope.configEmail = srvSecurity.getA4pLogin();
    };

    $scope.setPassword = function (password) {
        srvSecurity.setA4pPassword(password);
        $scope.configPassword = password;
    };

    $scope.verifyEmail = function () {
        $scope.warningEmail = (a4p.isUndefined($scope.configEmail) || ($scope.configEmail === ''));
        return $scope.warningEmail;
    };

    $scope.verifyPassword = function () {
        $scope.warningPassword = (a4p.isUndefined($scope.configPassword) || ($scope.configPassword === ''));
        return $scope.warningPassword;
    };

    $scope.getObjectTypes = function () {
        return c4p.Model.objectTypes;
    };
    $scope.getHtmlFieldTitle = function (objectType, key) {
        return c4p.Model.a4p_types[objectType].editObjectFields[key].title;
    };

    $scope.getDisplayNameList = function (objectType) {
        return c4p.Model.a4p_types[objectType].displayNameList;
    };

    $scope.getCurrentNameComposition = function (objectType) {
        return c4p.Model.a4p_types[objectType].displayNameList[srvConfig.getNameComposition(objectType)];
    };

    $scope.getNameComposition = function (objectType) {
        srvConfig.getNameComposition(objectType);
    };

    $scope.setNameComposition = function (objectType, idx) {
        srvConfig.setNameComposition(objectType, idx);
    };

    $scope.setBetaMode = function (isBetaMode) {
        srvConfig.setBetaMode(isBetaMode);
    };

    $scope.setBetaCfgPrm = function (prmKey, flag) {
        srvConfig.setBetaCfgPrm(prmKey, flag);
    };

    $scope.checkBetaCfgPrm = function (prmKey) {
        srvConfig.setBetaCfgPrm(prmKey, srvConfig.c4pConfig[prmKey]);
    };

    $scope.setSecureMode = function (isSecureMode) {
        a4p.InternalLog.log('ctrlConfig', 'SecureMode : ' + isSecureMode);

        isSecureMode = isSecureMode === true || isSecureMode === "true";
        if (isSecureMode != srvSecurity.isSecured()) {
            if (isSecureMode) {
                $scope.openDialogInitPinCode(function (pinCode) {
                    if (a4p.isDefined(pinCode)) {
                        a4p.safeApply($scope, function() {
                            srvSecurity.register(pinCode);
                            // we're in security mode
                            srvSecurity.setSecured(true);
                            $scope.secureMode = srvSecurity.isSecured();
                        });
                    }
                });
            } else {
                //we're out from security mode
                srvSecurity.setSecured(false);
                $scope.secureMode = srvSecurity.isSecured();
            }
        }
    };

    $scope.modifyPinCode = function () {
        $scope.openDialogModifyPinCode(function (pinCode) {
            a4p.safeApply($scope, function() {
                srvSecurity.register(pinCode);
            });
        });
    };

    $scope.dialogActiveCrm = function () {
        $scope.openDialog(
            {
                backdrop: true,
                windowClass: 'modal c4p-modal-left c4p-modal-search c4p-dialog',
                controller: 'ctrlSelectCrmsDialog',
                templateUrl: 'views/dialog/dialogSelectCrms.html',
                resolve: {
                    srvLocale: function () {
                        return srvLocale;
                    },
                    possibleCrms: function () {
                        return srvConfig.possibleCrms;
                    },
                    activeCrms: function () {
                        return srvConfig.activeCrms;
                    },
                    multiple: function () {
                        return true;
                    }
                }
            },
            function (result) {
                if (a4p.isDefined(result)) {
                    a4p.safeApply($scope, function() {
                        srvConfig.setActiveCrms(result);
                        $scope.downloadClient();
                    });
                }
            }
        );
        //if (!$scope.$$phase) $scope.$apply();// To open the dialog ?
    };

    $scope.c4pConnection = function () {

        if (!$scope.configLogin || !$scope.configLogin.email) return;

        $scope.configEmail = $scope.configLogin.email;
        $scope.configPassword = $scope.configLogin.password;
        if($scope.configEmail.toLowerCase() == "demo@apps4pro.com" && $scope.configPassword.toLowerCase() == "demo") {
            a4p.InternalLog.log('ctrlConfig', 'Entering demo mode');
            $scope.setDemo(true);
            //GA: user really interact with aside, he logs in
            srvAnalytics.add('Once', 'Login - demo');
            return;
        }

        a4p.InternalLog.log('ctrlConfig', 'c4pConnection');

        // Copy email, password and rememberPassword variables of ctrlConfig into ctrlNavigation and srvSecurity
        $scope.setEmail($scope.configEmail);
        $scope.setPassword($scope.configPassword);
        $scope.setRememberPassword($scope.rememberPassword);

        if ($scope.verifyEmail() || $scope.verifyPassword()) {
            return;
        }

        //GA: user really interact with aside, he logs in
        srvAnalytics.add('Once', 'Login');

        $scope.gotoSlide($scope.pageGuider, $scope.slideGuiderValidation);
        $scope.setDemo(false);
    };

    $scope.createAccount = function () {
        // Copy email and password variables of ctrlConfig into ctrlNavigation and srvSecurity

        $scope.configEmail = $scope.configLogin.email;
        $scope.setEmail($scope.configEmail);
        $scope.setPassword('');
        a4p.InternalLog.log('ctrlConfig', 'createAccount '+$scope.configEmail);

        if ($scope.verifyEmail()) return;
        a4p.InternalLog.log('ctrlConfig', 'createAccount.. '+$scope.configEmail);

        var fctOnHttpSuccess = function (response) {
            //response.data, response.status, response.headers
            a4p.safeApply($scope, function() {
                var requestTitle = 'Create account';
                if (a4p.isUndefined(response.data)) {
                    srvLog.logWarning(srvConfig.c4pConfig.exposeCreateAccount, 'Received no data', requestTitle);
                    $scope.setMessageGuider('htmlMsgSynchronizationServerPb');
                    $scope.setA4pSpinnerState('doneWithPb');
                    $scope.setSlideToTransferInGuider($scope.slideGuiderCreateAccount);
                } else {
                    var errorCode = response.data.error;
                    var responseOk = response.data.responseOK;
                    var responseLog = response.data.responseLog;
                    if (a4p.isUndefined(responseLog)) responseLog = response.data.log;

                    if (a4p.isDefined(errorCode) && (errorCode !== '')) {
                        if (a4p.isUndefined(srvLocale.translations[errorCode])) {
                            srvLog.logWarning(srvConfig.c4pConfig.exposeCreateAccount,
                                'Received error code ' + errorCode,
                                requestTitle + ' : ' + (responseLog || a4pDumpData(responseData, 1)));
                        } else {
                            srvLog.logWarning(srvConfig.c4pConfig.exposeCreateAccount,
                                srvLocale.translations[errorCode],
                                requestTitle + ' : ' + responseLog);
                        }
                        $scope.setMessageGuider(errorCode);
                        $scope.setA4pSpinnerState('doneWithPb');
                        $scope.setSlideToTransferInGuider($scope.slideGuiderCreateAccount);
                    } else if (a4p.isUndefined(responseOk) || !responseOk) {
                        srvLog.logWarning(srvConfig.c4pConfig.exposeCreateAccount,
                            'Received no OK',
                            requestTitle + ' : ' + (responseLog || a4pDumpData(response.data, 1)));
                        $scope.setMessageGuider('htmlMsgSynchronizationServerPb');
                        $scope.setA4pSpinnerState('doneWithPb');
                        $scope.setSlideToTransferInGuider($scope.slideGuiderCreateAccount);
                    } else {
                        //create account success
                        srvLog.logSuccess(srvConfig.c4pConfig.exposeCreateAccount,
                            'Account created',
                            requestTitle + ' : ' + responseLog);

                        //GA: user really interact with login, he register
                        srvAnalytics.add('Once', 'Register');


                        $scope.setMessageGuider('htmlFormGuiderTextSuccessCreateAccount');
                        $scope.setA4pSpinnerState('done');
                        $scope.setSlideToTransferInGuider($scope.slideGuiderConnection);
                    }
                }
                $scope.gotoSlide($scope.pageGuider, $scope.slideGuiderValidationReceiveRes);
            });
        };

        var fctOnHttpError = function (response) {
            //response.data, response.status, response.headers
            a4p.safeApply($scope, function() {
                $scope.setMessageGuider('htmlMsgSynchronizationClientPb');
                $scope.setA4pSpinnerState('doneWithPb');
                $scope.setSlideToTransferInGuider($scope.slideGuiderCreateAccount);
                $scope.gotoSlide($scope.pageGuider, $scope.slideGuiderValidationReceiveRes);
            });
        };

        var params = {
            login: $scope.configEmail,
            language: srvLocale.getLanguage()
        };
        srvDataTransfer.sendData(srvConfig.c4pUrlCreateAccount, params, null, 60000)
            .then(fctOnHttpSuccess, fctOnHttpError);
        $scope.setA4pSpinnerState('run');
        $scope.gotoSlide($scope.pageGuider, $scope.slideGuiderValidation);
    };

    $scope.requestPassword = function () {
        // Copy email and password variables of ctrlConfig into ctrlNavigation and srvSecurity
        $scope.configEmail = $scope.configLogin.email;
        $scope.setEmail($scope.configEmail);
        $scope.setPassword('');

        if ($scope.verifyEmail()) return;

        var fctOnHttpSuccess = function (response) {
            //response.data, response.status, response.headers
            a4p.safeApply($scope, function() {
                var requestTitle = 'Forget password';
                if (a4p.isUndefined(response.data)) {
                    srvLog.logWarning(srvConfig.c4pConfig.exposeRequestPassword, 'Received no data', requestTitle);
                    $scope.setMessageGuider('htmlMsgSynchronizationServerPb');
                    $scope.setA4pSpinnerState('doneWithPb');
                    $scope.setSlideToTransferInGuider($scope.slideGuiderRequestPassword);
                } else {
                    var errorCode = response.data.error;
                    var responseOk = response.data.responseOK;
                    var responseLog = response.data.responseLog;
                    if (a4p.isUndefined(responseLog)) responseLog = response.data.log;

                    if (a4p.isDefined(errorCode) && (errorCode !== '')) {
                        if (a4p.isUndefined(srvLocale.translations[errorCode])) {
                            srvLog.logWarning(srvConfig.c4pConfig.exposeRequestPassword,
                                'Received error code ' + errorCode,
                                requestTitle + ' : ' + (responseLog || a4pDumpData(responseData, 1)));
                        } else {
                            srvLog.logWarning(srvConfig.c4pConfig.exposeRequestPassword,
                                srvLocale.translations[errorCode],
                                requestTitle + ' : ' + responseLog);
                        }
                        $scope.setMessageGuider(errorCode);
                        $scope.setA4pSpinnerState('doneWithPb');
                        $scope.setSlideToTransferInGuider($scope.slideGuiderRequestPassword);
                    } else if (a4p.isUndefined(responseOk) || !responseOk) {
                        srvLog.logWarning(srvConfig.c4pConfig.exposeRequestPassword,
                            'Received no OK',
                            requestTitle + ' : ' + (responseLog || a4pDumpData(response.data, 1)));
                        $scope.setMessageGuider('htmlMsgSynchronizationServerPb');
                        $scope.setA4pSpinnerState('doneWithPb');
                        $scope.setSlideToTransferInGuider($scope.slideGuiderRequestPassword);
                    } else {
                        //request password success
                        srvLog.logSuccess(srvConfig.c4pConfig.exposeRequestPassword,
                            'Password has been regenerated',
                            requestTitle + ' : ' + responseLog);
                        $scope.setMessageGuider('htmlFormGuiderTextSuccessRequestPassword');
                        $scope.setA4pSpinnerState('done');
                        $scope.setSlideToTransferInGuider($scope.slideGuiderConnection);
                    }
                }
                $scope.gotoSlide($scope.pageGuider, $scope.slideGuiderValidationReceiveRes);
            });
        };

        var fctOnHttpError = function (response) {
            //response = {data:msg, status:'error'}
            a4p.safeApply($scope, function() {
                srvLog.logWarning(srvConfig.c4pConfig.exposeRequestPassword,
                    'Password regeneration has failed', response.data);
                $scope.setMessageGuider('htmlMsgSynchronizationClientPb');
                $scope.setA4pSpinnerState('doneWithPb');
                $scope.setSlideToTransferInGuider($scope.slideGuiderRequestPassword);
                $scope.gotoSlide($scope.pageGuider, $scope.slideGuiderValidationReceiveRes);
            });
        };

        var params = {
            login: $scope.configEmail,
            language: srvLocale.getLanguage()
        };
        srvDataTransfer.sendData(srvConfig.c4pUrlForget, params, null, 30000)
            .then(fctOnHttpSuccess, fctOnHttpError);
        $scope.setA4pSpinnerState('run');
        $scope.gotoSlide($scope.pageGuider, $scope.slideGuiderValidation);
    };

    $scope.sendErrorReport = function () {
        $scope.openDialog(
            {
                windowClass: 'modal c4p-modal-full c4p-dialog',
                controller: 'ctrlEditDialogErrorReport',
                templateUrl: 'views/dialog/dialogErrorReport.html',
                resolve: {
                    srvLocale: function () {
                        return srvLocale;
                    }
                }
            },
            function (result) {
                if (a4p.isDefined(result)) {
                    var fctOnHttpSuccess = function (response) {
                        //response.data, response.status, response.headers
                        var requestTitle = 'Error report';
                        if (a4p.isUndefined(response.data)) {
                            alert('Your error report has failed : we have received no data from our server.');
                        } else {
                            var errorCode = response.data.error;
                            var responseOk = response.data.responseOK;
                            var responseLog = response.data.responseLog;
                            if (a4p.isUndefined(responseLog)) responseLog = response.data.log;

                            if (a4p.isDefined(errorCode) && (errorCode !== '')) {
                                if (a4p.isUndefined(srvLocale.translations[errorCode])) {
                                    alert('Your error report has failed : ' + (responseLog || a4pDumpData(response.data, 1)));
                                } else {
                                    alert('Your error report has failed : ' + srvLocale.translations[errorCode]);
                                }
                            } else if (a4p.isUndefined(responseOk) || !responseOk) {
                                alert('Your error report has failed  : ' + (responseLog || a4pDumpData(response.data, 1)));
                            } else {
                                //error report success
                                alert('Your error report has been sent');
                            }
                        }
                    };

                    var fctOnHttpError = function (response) {
                        //response = {data:msg, status:'error'}
                        alert('Your error report has failed : ' + response.data);
                    };

                    var params = {
                        feedback: result.feedback.message,
                        logs: srvLog.getInternalLog(),
                        errors: srvLog.getErrorLog(),
                        c4pToken: srvSecurity.getHttpRequestToken()
                    };
                    srvDataTransfer.sendData(srvConfig.c4pUrlErrorReport, params, null, 60000)
                        .then(fctOnHttpSuccess, fctOnHttpError);
                }
            });
    };

    $scope.guiderScrollPage = function (event, ctrl, eventName) {
        a4p.InternalLog.log('ctrlConfig', 'guiderScrollPage ' + event.side + eventName);
        //if (event.side == 'left')
        ctrl.next();
    };

    $scope.initConfigCtrl = function () {

        if ($scope.page != 'guider' && $scope.slide != 'config') return;

        $scope.setNavTitle($scope.srvLocale.translations.htmlTitleConfig);
        $scope.secureMode = srvSecurity.isSecured();

        $scope.warningEmail = false;
        $scope.warningPassword = false;
        $scope.configEmail = srvSecurity.getA4pLogin();
        $scope.configPassword = '';
        $scope.configLogin.email = $scope.configEmail;

/*
        // Guider Inputs
        $scope.slidesInterval = -5000;
        $scope.slides = [
            {
                id: 0,
                image: 'img/samples/c4pGuider5.png',
                icon: 'comments',
                title: srvLocale.translations.htmlFormGuiderSlide1Title,
                text: srvLocale.translations.htmlFormGuiderSlide1Text
            }
//            {
//                id: 1,
//                image: 'img/samples/c4pGuider2.gif',
//                icon: 'book',
//                title: srvLocale.translations.htmlFormGuiderSlide2Title,
//                text: srvLocale.translations.htmlFormGuiderSlide2Text
//            },
//            {
//                id: 2,
//                image: 'img/samples/c4pGuider3.gif',
//                icon: 'comment',
//                title: srvLocale.translations.htmlFormGuiderSlide3Title,
//                text: srvLocale.translations.htmlFormGuiderSlide3Text
//            }
        ];*/

    };

    $scope.setThemeCss = function (themeCss) {
        a4p.InternalLog.log('ctrlConfig', 'setThemeCss : ' + themeCss);
        for (var i= 0, nb=$scope.themes.length; i < nb; i++) {
            if ($scope.themes[i].key == themeCss) {
                srvConfig.setThemeCss(themeCss);
                $('#c4p-css').attr({href: $scope.themes[i].href});
                break;
            }
        }
    };

    $scope.getPossibleSizeCss = function () {
        var values = ['140%', '110%', '100%', '90%', '75%'];
        addValueToList(values, this.sizeCss);
        return values;
    };

    $scope.setSizeCss = function (sizeCss) {
        //$scope.sizeCss = sizeCss;
        srvConfig.setSizeCss(sizeCss);
    };


    $scope.sendFeedback = function () {
        $scope.openDialogSendFeedbackReport('CRM Meeting Pad user feedback');
    };
    $scope.openHelpDialog = function () {
        $scope.openDialogMessage(srvLocale.translations.htmlTextNeedHelpDetail);
    };

    $scope.switchUser = function(){

        var array = [];
        $scope.openDialogConfirm(srvLocale.translations.htmlTextConfirmSwitchUser , array,
            function(confirm) {
                if (confirm) $scope.gotoLogin();
            }
        );

    };

    /**
     * Events broadcasted
     */
    $scope.$on('changeItemCategory', function (event, item) {
        $scope.warningEmail = false;
        $scope.warningPassword = false;
        $scope.configEmail = srvSecurity.getA4pLogin();
        $scope.configPassword = '';
    });

    /**
     * Initialization
     */
    $scope.initConfigCtrl();


}

angular.module('crtl.config', []).controller('ctrlConfig', ctrlConfig);
//ctrlConfig.$inject = [ '$scope', 'srvConfig', 'srvLog', 'srvLocale', 'srvSecurity', 'srvDataTransfer', '$modal', 'srvAnalytics', 'version'];
