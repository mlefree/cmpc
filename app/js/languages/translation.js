angular.module('gettext').run(['gettextCatalog', function (gettextCatalog) {
/* jshint -W100 */
    gettextCatalog.setStrings('de', {"Hello, we want to introduce you to a fair chores share":"Danke chooqsqsd qsdqsd"});
    gettextCatalog.setStrings('fr', {"Hello, we want to introduce you to a fair chores share":"Bonzzzour, et welcome !"});

    gettextCatalog.setStrings('de', {"test":"test DE"});
    gettextCatalog.setStrings('fr', {"test":"test FR"});
/* jshint +W100 */
}]);
