'use strict';

var w4pUrlBase = 'http://192.168.127.127/w/www';
var c4pHtmlUrlBase = 'http://192.168.127.127/c/www';

/*
 Possible selectors : cf. http://jquery.developpeur-web2.com/documentation/selecteurs.php
 */

/*
 Possible matchers : toEqual, toBe, toBeDefined, toBeTruthy, toBeFalsy, toMatch, toBeNull, toContain, toBeLessThan, toBeGreaterThan
 */

/*
 To debug a failed "expect()",
 1) look at browser console and resolve any error message
 2) put "pause();" command before the failed "expect()", rerun the test and examine the HTML page in browser when it pauses !
 */

/**
 * Parse a date string to create a Date object
 * @param {string} date string at format "yyyy-MM-dd HH:mm:ss"
 * @returns {Date} Date object or false if invalid date
 */
function a4pDateParse(date) {
    // Date (choose 0 in date to force an error if parseInt fails)
    var yearS = parseInt(date.substr(0, 4), 10) || 0;
    var monthS = parseInt(date.substr(5, 2), 10) || 0;
    var dayS = parseInt(date.substr(8, 2), 10) || 0;
    var hourS = parseInt(date.substr(11, 2), 10) || 0;
    var minuteS = parseInt(date.substr(14, 2), 10) || 0;
    var secS = parseInt(date.substr(17, 2), 10) || 0;
    /*
     BEWARE : here are the ONLY formats supported by all browsers in creating a Date object
     var d = new Date(2011, 01, 07); // yyyy, mm-1, dd
     var d = new Date(2011, 01, 07, 11, 05, 00); // yyyy, mm-1, dd, hh, mm, ss
     var d = new Date("02/07/2011"); // "mm/dd/yyyy"
     var d = new Date("02/07/2011 11:05:00"); // "mm/dd/yyyy hh:mm:ss"
     var d = new Date(1297076700000); // milliseconds
     var d = new Date("Mon Feb 07 2011 11:05:00 GMT"); // ""Day Mon dd yyyy hh:mm:ss GMT/UTC
     */

    var newDate = new Date(yearS, monthS - 1, dayS, hourS, minuteS, secS, 0);
    if ((newDate.getFullYear() !== yearS) || (newDate.getMonth() !== (monthS - 1)) || (newDate.getDate() !== dayS)) {
        // Invalid date
        return false;
    }
    return newDate;
}

/**
 * Return a string format "yyyy-MM-dd HH:mm:ss" from a Date object.
 * @param {Date} date to format
 * @returns {string} result
 */
function a4pDateFormat(date) {
    return a4pPadNumber(date.getFullYear(), 4) + '-' +
        a4pPadNumber(date.getMonth() + 1, 2) + '-' +
        a4pPadNumber(date.getDate(), 2) + ' ' +
        a4pPadNumber(date.getHours(), 2) + ':' +
        a4pPadNumber(date.getMinutes(), 2) + ':' +
        a4pPadNumber(date.getSeconds(), 2);
}

function a4pPadNumber(num, digits, trim) {
    var neg = '';
    if (num < 0) {
        neg = '-';
        num = -num;
    }
    num = '' + num;
    while (num.length < digits) {
        num = '0' + num;
    }
    if (trim && (num.length > digits)) {
        num = num.substr(num.length - digits);
    }
    return neg + num;
}

function a4pGetDateString() {

  var date = new Date();
  var today = ''+date.getFullYear()+''+date.getMonth()+''+date.getDate()+''+date.getHours();
  // date.getHours() date.getMinutes() date.getSeconds()

  return today;
}

var escapeRegExp;

(function () {
  // Referring to the table here:
  // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/regexp
  // these characters should be escaped
  // \ ^ $ * + ? . ( ) | { } [ ]
  // These characters only have special meaning inside of brackets
  // without any adverse effects (to the best of my knowledge and casual testing)
  // : ! , =
  // my test "~!@#$%^&*(){}[]`/=?+\|-_;:'\",<.>".match(/[\#]/g)

  var specials = [
        // order matters for these
          "-"
        , "["
        , "]"
        // order doesn't matter for any of these
        , "/"
        , "{"
        , "}"
        , "("
        , ")"
        , "*"
        , "+"
        , "?"
        , "."
        , "\\"
        , "^"
        , "$"
        , "|"
      ]

      // I choose to escape every character with '\'
      // even though only some strictly require it when inside of []
    , regex = RegExp('[' + specials.join('\\') + ']', 'g')
    ;

  escapeRegExp = function (str) {
    return str.replace(regex, "\\$&");
  };

  // test escapeRegExp("/path/to/res?search=this.that")
}());

var c4p;
if (!c4p) c4p = {};

c4p.E2e = (function () {

    // Private API

    // Constructor
    function E2e() {
        this.version = "0.1";
    }

    // All event dates in demo data are shifted by (now - '2013-04-25 00:00:00'). See adjustDate() in data service.
    var today_app4pro = a4pDateParse('2013-04-25 00:00:00');
    E2e.now = new Date();
    var timestampDif = E2e.now.getTime() - today_app4pro.getTime() - (((E2e.now.getHours() * 60 + E2e.now.getMinutes()) * 60) + E2e.now.getSeconds()) * 1000;

    // Public API

    /**
     * Date of first event of the day loaded in demo mode.
     * In demo mode there is 1 event on today at 16h00, the next event is in 2 days at 15h00 (if you run the test after 16h00)
     * @type {Date}
     */
    E2e.firstEventDate = new Date(a4pDateParse("2013-04-25 16:00:00").getTime() + timestampDif);

    E2e.firstEventName = 'presentation';
    E2e.firstEventNameRegExp = 'presentation';
    if (E2e.now.getHours() >= 16) {
        E2e.firstEventDateAfterNow = new Date(a4pDateParse("2013-04-27 15:00:00").getTime() + timestampDif);
        E2e.firstEventNameAfterNow = "appel d'offre";
        E2e.firstEventNameRegExpAfterNow = 'appel d.offre';
    } else {
        E2e.firstEventDateAfterNow = E2e.firstEventDate;
        E2e.firstEventNameAfterNow = E2e.firstEventName;
        E2e.firstEventNameRegExpAfterNow = E2e.firstEventNameRegExp;
    }

    // Par convention, tout element repetable est associe a une variable suffixee par 'List' (exemple : np1PageItemList)
    // Ainsi dans le code de test e2e on utilisera cette variable pour compter ou selectionner le Nieme element
    // exemple 1 : expect(element(c4p.E2e.np1PageItemList).count()).toBe(3);
    // exemple 2 : expect(element(c4p.E2e.np1PageItemList + ':eq(1)').text()).toBe('dummy');

    // Par convention, tout element apres un element repetable est associe a une variable prefixee par 'in'
    // suivi du nom de la variable associee a l'element repetable SANS son suffixe 'List' (exemple : inNp1PageItemHeader)
    // qui sera ensuite utilisee DERRIERE l'element repetable.
    // exemple 1 : expect(element(c4p.E2e.np1PageItemList + ':eq(0)' + c4p.E2e.inNp1PageItemHeader).text()).toBe('titre');

    //Home page
    E2e.home = [];
    E2e.home.pageTitle = 'h3.login-header';
    E2e.home.linkPasswordForgotten = 'a[ng-click="gotoSlide(pageGuider, slideGuiderRequestPassword)"]';
    E2e.home.labelRememberPassword = 'label.checkbox.ng-binding';//'input[ng-model="rememberPassword"]';
    E2e.home.linkDemoMode = 'a[ng-click="setDemo(true)"]';
    E2e.home.linkRegister = 'a[ng-click="gotoRegister()"]';
    E2e.home.linkLogin = 'a[ng-click="gotoLogin()"]';
    E2e.home.registerButton = 'form a[ng-click="createAccount()"]';
    E2e.home.footer = 'div[resize-opts="{name:\'guider_footer\'}"]';
    E2e.home.informationMessage = 'div.form-group label.control-label';

    //Guider page
    E2e.guider = [];
    E2e.guider.pageTitle = '#a4pPage h2.ng-binding:eq(0)';

    //Common lang menu
    E2e.common = [];
    E2e.common.langViewMenu = 'div#language-menu a[data-toggle="dropdown"]';
    E2e.common.langViewMenuActionList = 'div#language-menu ul.dropdown-menu li[ng-repeat="link in srvLocale.langs"]';
    E2e.common.inLangViewMenuAction = ' a[ng-click="srvLocale.setLang(link)"]';
	E2e.common.langViewMenuActionEnglish = E2e.common.langViewMenuActionList + ':eq(0)'+E2e.common.inLangViewMenuAction;
	E2e.common.langViewMenuActionFrench = E2e.common.langViewMenuActionList + ':eq(1)'+E2e.common.inLangViewMenuAction;
//	E2e.common.langViewMenuTitle = E2e.calendarViewMenu + ' > div[ng-repeat="link in srvLocale.langs"][style!="display: none;"] > span'

	//Common left menu
	E2e.common.leftMenuActionList = 'ul.list-group.c4p-list-aside ';
	E2e.common.leftMenuActionCalendar = E2e.common.leftMenuActionList + 'li[ng-click="srvFacet.clearOrRemoveFacet($first, $index);setCalendar()"] span.ng-binding';
	E2e.common.leftMenuActionEvent = E2e.common.leftMenuActionList + 'li[ng-click="setSearchMenu(\'Event\')"] span.ng-binding';
	E2e.common.leftMenuActionTasks = E2e.common.leftMenuActionList + 'li[ng-click="setSearchMenu(\'Task\')"] span.ng-binding';
	E2e.common.leftMenuActionLeads = E2e.common.leftMenuActionList + 'li[ng-click="setSearchMenu(\'Lead\')"] span.ng-binding';
	E2e.common.leftMenuActionContacts = E2e.common.leftMenuActionList + 'li[ng-click="setSearchMenu(\'Contact\')"] span.ng-binding';
	E2e.common.leftMenuActionAccounts = E2e.common.leftMenuActionList + 'li[ng-click="setSearchMenu(\'Account\')"] span.ng-binding';
	E2e.common.leftMenuActionOpportunities = E2e.common.leftMenuActionList + 'li[ng-click="setSearchMenu(\'Opportunity\')"] span.ng-binding';
	E2e.common.leftMenuActionFavorites = E2e.common.leftMenuActionList + 'li[ng-click="setFavoriteSearchMenu()"] span.ng-binding';
	E2e.common.leftMenuActionDocuments = E2e.common.leftMenuActionList + 'li[ng-click="setSearchMenu(\'Document\')"] span.ng-binding';
	E2e.common.leftMenuActionNotes = E2e.common.leftMenuActionList + 'li[ng-click="setSearchMenu(\'Note\')"] span.ng-binding';
	E2e.common.leftMenuActionReports = E2e.common.leftMenuActionList + 'li[ng-click="setSearchMenu(\'Report\')"] span.ng-binding';

	// Common right menu
	E2e.common.rightMenuActionList = 'div.c4p-color-a-gradient2 div[ng-repeat="group in srvNav.itemRelatedGroupList"]';
	E2e.common.rightMenuLinksNumber = 'div.c4p-related-square-text span.ng-binding';

	// Actions for drop down menu
	E2e.common.a4pPageMenu = 'div#a4pPage div.dropdown';
	E2e.common.a4pPageMenuDropDown = E2e.common.a4pPageMenu + ' span[role="button"]';
	E2e.common.a4pPageMenuCalendarButtonList = E2e.common.a4pPageMenu + ' ul.dropdown-menu li[ng-repeat="view in calendarViews"]';
	E2e.common.a4pPageMenuDayViewButton = E2e.common.a4pPageMenuCalendarButtonList + ':eq(0)';
	E2e.common.a4pPageMenuListViewButton = E2e.common.a4pPageMenuCalendarButtonList + ':eq(2)';
	E2e.common.a4pPageMenuMonthViewButton = E2e.common.a4pPageMenuCalendarButtonList + ':eq(1)';
	E2e.common.a4pPageMenuButtonList = E2e.common.a4pPageMenu + ' ul.dropdown-menu li[ng-repeat="action in actionList"]';
	E2e.common.a4pPageMenuEditButtonForEvent = E2e.common.a4pPageMenuButtonList + ':eq(11) span:eq(0)';
	E2e.common.a4pPageMenuEditButtonForContact = E2e.common.a4pPageMenuButtonList + ':eq(6) span:eq(0)';
	E2e.common.a4pPageMenuDocumentButton = E2e.common.a4pPageMenuButtonList + ':eq(4) span:eq(0)';
	E2e.common.a4pPageMenuAttendeeButton = E2e.common.a4pPageMenuButtonList + ':eq(5) span:eq(0)';
	E2e.common.a4pPageMenuEmailButton = E2e.common.a4pPageMenuButtonList + ':eq(6) span:eq(0)';

	//Footer
	E2e.footer = [];
	E2e.footer.buttonConnect = 'footer[ng-include="\'partials/guider/footer.html\'"] a[ng-click="gotoLogin()"]';
	E2e.footer.buttonRegister = 'footer[ng-include="\'partials/guider/footer.html\'"] a[ng-click="gotoRegister()"]';
	E2e.footer.buttonForSalesforce = 'footer[ng-include="\'partials/guider/footer.html\'"] a small:eq(0)';
	E2e.footer.buttonNeedHelp = 'footer[ng-include="\'partials/guider/footer.html\'"] a[ng-click="openDialogSendFeedbackReport(srvLocale.translations.htmlTextNeedHelpDetail)"]';

	// Calendar page
	E2e.calendar = [];
	E2e.calendar.pageTitle = 'div[ng-controller="ctrlCalendar"] div[ng-include="\'partials/navigation/calendar_header.html\'"] span.ng-binding:eq(0)';
	E2e.calendar.timeRangeMenu = 'div[ng-controller="ctrlCalendar"] div[ng-include="\'partials/navigation/calendar_header.html\'"] a.dropdown-toggle span.ng-binding:eq(0)';
	E2e.calendar.pageDayEventList = 'li[ng-repeat="item in calendarSelectedDay.events"] ';
	E2e.calendar.pageDayEventAction = E2e.calendar.pageDayEventList + 'div[sense-tap="selectItem()"] ';
	E2e.calendar.pageDayFirstEventTitle = E2e.calendar.pageDayEventAction + ' div.row:eq(0) div[ng-repeat="group in groups"]:eq(0) span[ng-show="group.name"] b.ng-binding';
	E2e.calendar.labelDefaultEventTitle = E2e.calendar.pageDayEventAction + 'span.item-name b.ng-binding:eq(0)';
	E2e.calendarPageDay = 'div[ng-include="\'partials/navigation/calendar_day.html\'"] div[sense-opts="{axeY:\'scroll\', watchRefresh:\'calendarSelectedDay\'}"]:eq(0)';
    E2e.calendarPageDayEventList = E2e.calendarPageDay + ' div[ng-repeat="event in calendarSelectedDay.events"]';

	//Event page
	E2e.event = [];
	E2e.event.pageTitle = 'div[ng-controller="ctrlDetail"] div[ng-include="\'partials/navigation/cards/detailed_item.html\'"] span.ng-binding:eq(0)';
	E2e.event.eventList = 'span[ng-repeat="group in card.groups"]';
	E2e.event.labelTitle = E2e.event.eventList + ' span[ng-show="group.name"]:eq(0)';
	E2e.event.labelLocation = E2e.event.eventList + ' span[ng-repeat="field in group.fields"]:eq(2) span[ng-switch="field.type"] span.ng-binding';
	E2e.event.labelDate = E2e.event.eventList + ' span[ng-switch-when="datetime"] span.ng-binding';

	E2e.event.eventEditList = 'marker[ng-repeat="group in objectGroups"] fieldset[ng-repeat="field in group.groupFields"]';
	E2e.event.labelTitleEdit = E2e.event.eventEditList + ' label[ng-hide="field.warn"]:eq(0)';
	E2e.event.fieldTitleEdit = E2e.event.eventEditList + ' input[ng-model="object[field.key]"]:eq(0)';
	E2e.event.labelDateEdit = E2e.event.eventEditList + ' label[ng-hide="field.warn"]:eq(2)';
	E2e.event.fieldDateEdit = E2e.event.eventEditList + ' input[ng-model="stringDate"]:eq(0)';
	E2e.event.fieldTimeEdit = E2e.event.eventEditList + ' input[ng-model="stringTime"]:eq(0)';
	E2e.event.buttonSaveEvent = 'div[ng-click="submit()"]';

	// Contact search
	E2e.contact = [];
	E2e.contact.pageTitle = 'li.c4p-search-header-aside	span.c4p-search-header-txt-aside';
	E2e.contact.contactsCount = 'li.c4p-search-header-aside	span.ng-binding:eq(2)';
	E2e.contact.contactList = 'div[ng-include="\'partials/navigation/aside_search.html\'"] ul.c4p-list-aside li[ng-repeat="facetItem in srvFacet.items.others"]';
	E2e.contact.firstContact = E2e.contact.contactList + ':eq(0) span.ng-binding';
	E2e.contact.buttonAddContact = 'li.c4p-search-header-aside	span[ng-click="addItemDialog(filterFacet.value)"]';
	E2e.contact.searchArea = 'li[ng-hide="activeSearch"]';
	E2e.contact.inputSearch = 'li[c4p-show="activeSearch"]';

	// Contact creation/update page
	E2e.contactManagement = [];
	E2e.contactManagement.inputCivility = 'fieldset[ng-repeat="field in group.groupFields"]:eq(0)';
	E2e.contactManagement.inputFirstName = 'fieldset[ng-repeat="field in group.groupFields"]:eq(1)';
	E2e.contactManagement.inputLastName = 'fieldset[ng-repeat="field in group.groupFields"]:eq(2)';
	E2e.contactManagement.inputEmail = 'fieldset[ng-repeat="field in group.groupFields"]:eq(10)';
	E2e.contactManagement.buttonSaveContact = 'div[ng-click="submit()"]';

	// Contact details view
	E2e.contactDetails = [];
	E2e.contactDetails.contactList = 'span[ng-repeat="group in card.groups"]';
	E2e.contactDetails.labelTitle = E2e.contactDetails.contactList + ' span[ng-show="group.name"]:eq(0)';
	E2e.contactDetails.labelEmail = 'span[ng-switch="field.type"] span[ng-switch-default] span.ng-binding:eq(0)';

	// Modals (contact, document... multiple selection)
	E2e.modal = [];
	E2e.modal.container = 'div.c4p-modal-search';
	E2e.modal.elemList = E2e.modal.container + ' li[ng-repeat="element in (visibleElements = ( elements | listFilter:showFilter:false:\'selected\' | orderBy:\'showName\':false ))"]';
	E2e.modal.elem = E2e.modal.elemList + ' div[ng-click="toggleItem(element.id)"]';
	E2e.modal.buttonValidate = 'div[ng-click="validateDialog()"]';

	// Email
	E2e.modal.email = [];
	E2e.modal.email.container = 'div.c4p-modal-mail';
	E2e.modal.email.inputSubject = 'email.subject';
	E2e.modal.email.inputEmail = 'emailInput';
	E2e.modal.email.buttonAddContact = 'div[ng-click="openDialogContacts()"]';
	E2e.modal.email.inputContent = 'email.body';
	E2e.modal.email.buttonSend = 'div[ng-click="createEmail()"]';















      E2e.inputLogin = 'input[ng-model="email"]';
    E2e.inputPassword = 'input[ng-model="password"]';
    E2e.buttonConnect = 'button[ng-click="c4pConnection()"]';
    E2e.buttonStartFeatureTour = 'div[ng-click="gotoSlide(pageGuider, slideGuiderGuider)"]';
    E2e.linkDemoMode = 'a[ng-click="setDemo(true)"]';


    E2e.linkLogin = '#a4pPage a[ng-click="gotoLogin()"]';
    E2e.footerLoginLink = 'footer[ng-include="\'partials/guider/footer.html\'"] a[ng-click="gotoLogin()"]';
    E2e.linkRegister = '#a4pPage a[ng-click="gotoRegister()"]';

    E2e.footerRegisterLink = 'footer[ng-include="\'partials/guider/footer.html\'"] a[ng-click="gotoRegister()"]';
    E2e.linkPasswordForgotten = 'a[ng-click="gotoSlide(pageGuider, slideGuiderRequestPassword)"]';

    E2e.buttonLogin = 'button[ng-click="gotoLogin()"][style!="display: none;"]';

    E2e.calendarViewMenu = 'div[ng-show="footerLinks.length"] > a.dropdown-toggle';
    E2e.calendarViewMenuTitle = E2e.calendarViewMenu + ' > span[ng-repeat="link in footerLinks"][style!="display: none;"] > span'
    E2e.calendarViewMenuActionList = 'div[ng-show="footerLinks.length"] ul li[ng-repeat="link in footerLinks"]';
    E2e.calendarViewMenu = 'div[ng-show="calendarViews.length"] > a.dropdown-toggle';
    E2e.calendarViewMenuTitle = E2e.calendarViewMenu + ' > span[ng-repeat="view in calendarViews"][style!="display: none;"] > span'
    E2e.calendarViewMenuActionList = 'div[ng-show="calendarViews.length"] ul li[ng-repeat="view in calendarViews"]';
    E2e.inCalendarViewMenuAction = ' a[ng-click="link.onClick(link.id)"]';
    E2e.calendarViewMenuActionDay = E2e.calendarViewMenuActionList + ':eq(0)'+E2e.inCalendarViewMenuAction;
    E2e.calendarViewMenuActionMonth = E2e.calendarViewMenuActionList + ':eq(1)'+E2e.inCalendarViewMenuAction;
    E2e.calendarViewMenuActionList = E2e.calendarViewMenuActionList + ':eq(2)'+E2e.inCalendarViewMenuAction;
    E2e.linkCalendarTimeView = 'a[ng-click="link.onClick(link.id)"] span.glyphicon-time';
    E2e.linkCalendarListView = 'a[ng-click="link.onClick(link.id)"] span.glyphicon-list';


    E2e.langViewMenu = 'div[ng-show="srvLocale.langs"] > a.dropdown-toggle';
    E2e.langViewMenuTitle = E2e.calendarViewMenu + ' > div[ng-repeat="link in srvLocale.langs"][style!="display: none;"] > span'
    E2e.langViewMenuActionList = 'div[ng-show="srvLocale.langs"] ul li[ng-repeat="link in srvLocale.langs"]';
    E2e.inLangViewMenuAction = ' a[ng-click="srvLocale.setLang(link)"]';
    E2e.langViewMenuActionEnglish = E2e.langViewMenuActionList + ':eq(0)'+E2e.inLangViewMenuAction;
    E2e.langViewMenuActionFrancais = E2e.langViewMenuActionList + ':eq(1)'+E2e.inLangViewMenuAction;


    E2e.pGuider = '.modal.c4p-guider p';
    E2e.linkGuiderClose = '#c4p-guider-close-link';

    // Calendar Page : on left side (day view)
    E2e.calendarPageDay = 'div[ng-include="\'partials/navigation/calendar_day.html\'"] div[sense-opts="{axeY:\'scroll\', watchRefresh:\'calendarSelectedDay\'}"]:eq(0)';
    E2e.calendarPageDayEventList = E2e.calendarPageDay + ' div[ng-repeat="event in calendarSelectedDay.events"]';
    E2e.inCalendarPageDayEventButton = ' div[ng-click="onEventClick(event)"]';
    E2e.inCalendarPageDayEventSubtext = E2e.inCalendarPageDayEventButton;

    // on left side (list page)
    E2e.calendarPageNexts = 'div[ng-include="\'partials/navigation/calendar_events.html\'"]';
    E2e.calendarPageNextsDayList = 'div[ng-include="\'partials/navigation/calendar_events.html\'"] ul[ng-repeat="group in calendarEventsGroupsByDay | c4pFilterEventDateMoreThan:calendarNow"]';
    E2e.inCalendarPageNextsDayEventList = ' li[ng-repeat="item in group.events"]';
    E2e.inCalendarPageNextsDayEventButton = ' a[ng-click="setItemAndGoDetail(item)"]';

    // on right side (month page) : c4p-cell-initial => today and alert-success => selected day
    E2e.calendarPageMonthWeekList = 'tr[ng-repeat="week in calendarMonthWeeks"]';
    E2e.inCalendarPageMonthWeekDayList = ' td[ng-repeat="day in week.days"]';
    E2e.andTodayAndcalendarSelectedDay = '[class="ng-scope c4p-cell-initial alert-success"]';
    E2e.inCalendarPageMonthWeekDayEventList = ' div[ng-repeat="event in week[day.idx].events"]';

    E2e.linkEditItem = 'a[ng-click="editItemDialog()"]';
    E2e.linkAddItem = 'a[ng-click="addItemDialog()"]';
    E2e.linkSubmit = 'a[ng-click="submit()"]';
    E2e.buttonSubmit = 'button[ng-click="submit()"]';

    E2e.detailPageItemName = 'span[ng-model="srvNav.item.name"]:eq(0) span';
    E2e.detailPageItemLocation = 'span[ng-model="srvNav.item.location"]';
    E2e.detailPageItemAmount = 'span[ng-model="srvNav.item.amount"]';
    E2e.detailPageItemStage = 'span[ng-model="srvNav.item.stage"]';
    E2e.detailPageItemProbability = 'div[ng-model="srvNav.item.probability"] > div > span';
    E2e.detailPageItemDescription = 'div[ng-show="srvNav.item.description"] pre';
    E2e.linkDetailSetModeEdit = 'a[ng-click="setModeEdit(true)"]';

    E2e.linkReportAddContact = 'li[ng-repeat="footer in toolboxInEditMode"]:eq(0) a';
    E2e.linkReportAddDocument = 'li[ng-repeat="footer in toolboxInEditMode"]:eq(1) a';
    E2e.linkReportAddRating = 'li[ng-repeat="footer in toolboxInEditMode"]:eq(2) a';
    E2e.linkReportShare = 'li[ng-repeat="footer in toolboxInEditMode"]:eq(3) a';
    E2e.linkRatingFeeling = 'li[ng-repeat="item in possibleRatings | c4pExludeNameFilter:ratingsDone"]:eq(0) div[ng-click="toggleItem(item)"]';
    E2e.linkRatingQuality = 'li[ng-repeat="item in possibleRatings | c4pExludeNameFilter:ratingsDone"]:eq(1) div[ng-click="toggleItem(item)"]';
    E2e.linkRatingEnvironment = 'li[ng-repeat="item in possibleRatings | c4pExludeNameFilter:ratingsDone"]:eq(2) div[ng-click="toggleItem(item)"]';
    E2e.linkRatingAchievement = 'li[ng-repeat="item in possibleRatings | c4pExludeNameFilter:ratingsDone"]:eq(3) div[ng-click="toggleItem(item)"]';
    E2e.linkRatingMeeting = 'li[ng-repeat="item in possibleRatings | c4pExludeNameFilter:ratingsDone"]:eq(4) div[ng-click="toggleItem(item)"]';
    E2e.linkRatingSubmit = 'button[ng-click="add()"]';
    E2e.linkReportSubmitAndShare = 'a[ng-click="submitAndShare()"]';

    E2e.np1Page = '#a4pPage .c4p-accordion';
    E2e.np1PageMenu = E2e.np1Page + ' > div > .c4p-accordion-group';
    E2e.np1PageMenuHeader = E2e.np1PageMenu + ' .c4p-accordion-heading';
    E2e.np1PageMenuHeaderToggleButton = E2e.np1PageMenuHeader + ' .c4p-accordion-toggle[ng-click="isOpen = !isOpen"]';
    E2e.np1PageMenuBody = E2e.np1PageMenu + ' .c4p-accordion-item';
    E2e.np1PageMenuBodyToggleButton = E2e.np1PageMenuBody + ' .c4p-accordion-toggle[ng-click="isOpen = !isOpen"]';

    E2e.np1PageMenuBodyActionList = E2e.np1PageMenuBody + ' .c4p-accordion-inner ul li[ng-repeat="link in possibleLinksToAdd"]';
    E2e.inNp1PageMenuBodyActionButton = ' a[ng-click="closeAccordionGroup(); link.fn(link.linkedBy, link.linkType, srvNav.item)"]';

    E2e.np1PageItemList = E2e.np1Page + ' ul[class="nav nav-stacked"] li';
    E2e.inNp1PageItemHeader = ' > .c4p-accordion-group > .c4p-accordion-heading';
    E2e.inNp1PageItemHeaderToggleButton = E2e.inNp1PageItemHeader + ' .c4p-accordion-toggle[ng-click="isOpen = !isOpen"]';
    E2e.inNp1PageItemFooter = ' > .c4p-accordion-group > .c4p-accordion-item';
    E2e.inNp1PageItemBody = ' > .c4p-accordion-group > div[ng-transclude]';
    E2e.inNp1PageItemBodyTitle = E2e.inNp1PageItemBody + ' > span:eq(0)';
    E2e.inNp1PageItemBodyDetail = E2e.inNp1PageItemBody + ' > span:eq(1)';
    E2e.inNp1PageItemBodyDetailCard = E2e.inNp1PageItemBodyDetail + ' div[ng-click="selectItem(item)"]';
    E2e.inNp1PageItemBodyDetailCardText = E2e.inNp1PageItemBodyDetailCard + ' span > span';
    E2e.inNp1PageItemBodyDetailCardButton = E2e.inNp1PageItemBodyDetailCard;
    //E2e.inNp1PageItemBodyDetailViewButton = E2e.inNp1PageItemBodyDetailCard + ' > a[ng-click="viewDocument(link.item)"]';
    //E2e.inNp1PageItemBodyDetailShareByChatterButton = E2e.inNp1PageItemBodyDetailCard + ' > a[ng-click="shareDocumentByChatter(link.item)"]';

    E2e.liModalContact = '.modal:last .modal-body div[ng-repeat="item in contacts"]';
    E2e.cardContact = 'div[ng-include="\'partials/navigation/cards/draggable_inlined_item.html\'"] div span';
    E2e.liModalDocument = '.modal:last .modal-body div[ng-repeat="item in documents"]';
    E2e.cardDocument = 'div[ng-include="\'partials/navigation/cards/draggable_inlined_item.html\'"] div span';

    E2e.selectorGroupModal = '.modal:last .modal-header button.dropdown-toggle';
    E2e.selectorGroupNameModal = '.modal:last .modal-header button.dropdown-toggle > span';

    E2e.modalDropdownGroupList = '.modal:last .modal-header ul.dropdown-menu li';
    E2e.inModalDropdownGroupButton = ' a[ng-click="toggleObjectGroupFilter(group)"]';

    E2e.fieldGroupModal = '.modal:last .modal-body fieldset[ng-repeat="group in objectGroups"]';

    E2e.modalFieldList = 'fieldset[ng-repeat="field in objectGroupFilter.groupFields"]';
    E2e.inModalFieldTitle = ' > div[title-var="field.title"] > label';
    E2e.inModalFieldInput = ' > div[title-var="field.title"] input[ng-model="object[field.key]"]';
    E2e.inModalDateInput = ' > div[title-var="field.title"] input[ng-model="stringDate"]';
    E2e.inModalTimeInput = ' > div[title-var="field.title"] input[ng-model="stringTime"]';
    E2e.inModalFieldTextarea = ' > div[title-var="field.title"] textarea[ng-model="object[field.key]"]';

    E2e.linkModalToggleItem = '.modal:last .modal-body ul li[style!="display: none;"] div[ng-click="toggleItem(element.id)"]';
    E2e.linkModalValidate = '.modal:last .modal-toolbox ul li[style!="display: none;"] a[ng-click="validateDialog()"]';
    E2e.linkModalCreate = '.modal:last .modal-toolbox ul li[style!="display: none;"] a[ng-click="createObject()"]';
    E2e.linkModalAddContacts = '.modal:last .modal-toolbox ul li[style!="display: none;"] a[ng-click="openDialogContacts()"]';
    E2e.linkModalAddAttachments = '.modal:last .modal-toolbox ul li[style!="display: none;"] a[ng-click="openDialogAttachments()"]';
    E2e.linkModalSetModeEdit = '.modal:last .modal-toolbox ul li[style!="display: none;"] a[ng-click="setModeEdit(true)"]';
    E2e.linkModalCreateEmail = '.modal:last .btn[ng-click="createEmail()"]';
    E2e.linkModalSubmit = '.modal:last .modal-toolbox ul li[style!="display: none;"] a[ng-click="submit()"]';

    E2e.reportDialogRating = 'div[ng-repeat="item in toolboxRatings"]';
    E2e.cardRating = 'div[ng-include="\'partials/navigation/cards/4_rating.html\'"]';

    E2e.meetingPageAttendeeAttendee = 'li[ng-repeat="attendee in srvNav.links.attendee.Attendee.objects"]';
    E2e.meetingPageAccountedDocument = 'li[ng-repeat="document in srvNav.links.child.Document.objects"]';
    E2e.meetingPageAccountedReport = 'li[ng-repeat="report in srvNav.links.child.Report.objects"]';
    E2e.meetingPageAccountedNote = 'li[ng-repeat="note in srvNav.links.child.Note.objects"]';
    E2e.meetingPageAttendeeAttendee = 'li[ng-repeat="attendee in srvNav.attendees"]';
    E2e.meetingPageAccountedDocument = 'li[ng-repeat="document in srvNav.childDocuments"]';
    E2e.meetingPageAccountedReport = 'li[ng-repeat="report in srvNav.childReports"]';
    E2e.meetingPageAccountedNote = 'li[ng-repeat="note in srvNav.childNotes"]';


    E2e.linkAsidePage = 'a[ng-click="setNavAside(true)"]';

    E2e.asidePageSearch = 'header[ng-include="\'partials/navigation/aside_header.html\'"]';
    E2e.asidePageSearchBackLink = E2e.asidePageSearch + ' span[ng-click="removeGlobalSearch()"]';

    E2e.asidePageList = '#a4pAside';

    // WITH beta
    //E2e.asidePageGroupList = E2e.asidePageList + ' .c4p-accordion-group[ng-repeat="groupKey in srvFacet.items.keyes"] .c4p-accordion-heading';
    //E2e.inAsidePageGroupAddButton = ' a[ng-click="addItemDialog(groupKey.value)"]';
    //E2e.asidePageItemList = E2e.asidePageList + ' .c4p-accordion-group[ng-repeat="groupKey in srvFacet.items.keyes"] .c4p-accordion-item ul li[ng-repeat="item in srvFacet.items.lists[groupKey.value]"]';
    //E2e.inAsidePageItemButton = ' a[ng-click="selectItem(item.object)"]';
    // WITHOUT beta
    E2e.asidePageGroupList = E2e.asidePageList + ' div[ng-include="\'partials/navigation/aside_search.html\'"] nav[sense-opts="{axeY:\'scroll\', watchRefresh:\'inputs.itemSearchQuery\'}"] ul li[class="nav-header"]';
    E2e.inAsidePageGroupAddButton = ' a[ng-click="addItemDialog(type)"]';
    E2e.asidePageItemList = E2e.asidePageList + ' div[ng-include="\'partials/navigation/aside_search.html\'"] nav[sense-opts="{axeY:\'scroll\', watchRefresh:\'inputs.itemSearchQuery\'}"] ul li[class!="nav-header"]';
    E2e.inAsidePageItemButton = ' a[ng-click="selectItem(item)"]';

    E2e.asidePageCalendarLink = E2e.asidePageList + ' ul li[ng-click="gotoSlideWithSearchReset(pageNavigation, slideNavigationCalendar)"]';
    E2e.asidePageContactLink = E2e.asidePageList + ' ul li[ng-click="gotoAsideSearch(\'Contact\')"]';
    E2e.asidePageAccountLink = E2e.asidePageList + ' ul li[ng-click="gotoAsideSearch(\'Account\')"]';
    E2e.asidePageOpportunityLink = E2e.asidePageList + ' ul li[ng-click="gotoAsideSearch(\'Opportunity\')"]';
    E2e.asidePageConfigLink = E2e.asidePageList + ' ul li[ng-click="gotoSlideWithSearchReset(pageNavigation, slideNavigationConfig)"]';
    E2e.asidePageSynchronizeLink = E2e.asidePageList + ' ul li a[ng-click="refreshClient();setNavAside(false);"]';

    // The public API for this module is the constructor function.
    // We need to export that function from this private namespace so that
    // it can be used on the outside.
    return E2e;
})(); // Invoke the function immediately to create this class.


/*
//TODO : replace checkFirstPageInEnglish by a DSL to have the right line in error message
angular.scenario.dsl('sleep', function() {
  return function(time) {
    return this.addFuture('sleep for ' + time + ' seconds', function(done) {
      this.$window.setTimeout(function() { done(null, time * 1000); }, time * 1000);
    });
  };
});
*/


function checkFirstPageInEnglish() {
    // Login and Password fields must be visible and in english
    expect(element(c4p.E2e.inputLogin).val()).toBe('');
    expect(element(c4p.E2e.inputPassword).val()).toBe('');
    expect(element(c4p.E2e.buttonConnect).text()).toMatch(new RegExp('^\\s*Log in\\s*$'));
    expect(element(c4p.E2e.linkPasswordForgotten).text()).toMatch(new RegExp('^\\s*Forgot your password\\?\\s*$'));
    expect(element(c4p.E2e.linkRegister).text()).toMatch(new RegExp('^\\s*Register\\s*$'));
    expect(element(c4p.E2e.linkDemoMode).text()).toMatch(new RegExp('^\\s*Try right now with demo data\\s*$'));

    // Feature tour Start button must be visible and in english
    expect(element(c4p.E2e.buttonStartFeatureTour).text()).toMatch(new RegExp('^\\s*Start\\s*$'));
}

function checkFirstPageInFrench() {
    // Login and Password fields must be visible and in french
    expect(element(c4p.E2e.inputLogin).val()).toBe('');
    expect(element(c4p.E2e.inputPassword).val()).toBe('');
    expect(element(c4p.E2e.buttonConnect).text()).toMatch(new RegExp('^\\s*Connectez-vous\\s*$'));
    expect(element(c4p.E2e.linkPasswordForgotten).text()).toMatch(new RegExp('^\\s*Mot de passe oubli\u00E9\\?\\s*$'));
    expect(element(c4p.E2e.linkRegister).text()).toMatch(new RegExp('^\\s*Inscrivez-vous\\s*$'));
    expect(element(c4p.E2e.linkDemoMode).text()).toMatch(new RegExp('^\\s*Essayez en mode d\u00e9mo\\s*$'));

    // Feature tour Start button must be visible and in french
    expect(element(c4p.E2e.buttonStartFeatureTour).text()).toMatch(new RegExp('^\\s*Lancer\\s*$'));
}

function checkFirstFeatureInEnglish() {

	// First feature slide must be visible and in english
    expect(element('#a4pPage h2:eq(0)').text()).toBe('Mobile CRM');
    expect(element('#a4pPage p:eq(0)').text()).toBe('Follow up your clients and opportunities. Look at important information even when you\'re not in the office, online or offline.');

    // Log in and Register links must be visible and in english
    expect(element(c4p.E2e.footerLoginLink).text()).toMatch(new RegExp('^\\s*Log in\\s*$'));
    expect(element(c4p.E2e.footerRegisterLink).text()).toMatch(new RegExp('^\\s*Register\\s*$'));
}

function checkFirstFeatureInFrench() {
    // BUG : feature tour not traduced into french
    expect(element('#a4pPage h2:eq(0)').text()).toBe('Mobile CRM');
    expect(element('#a4pPage p:eq(0)').text()).toBe('Follow up your clients and opportunities. Look at important information even when you\'re not in the office, online or offline.');

    // Log in and Register links traduced into french
    expect(element(c4p.E2e.footerLoginLink).text()).toMatch(new RegExp('^\\s*Connectez-vous\\s*$'));
    expect(element(c4p.E2e.footerRegisterLink).text()).toMatch(new RegExp('^\\s*Inscrivez-vous\\s*$'));
}

function checkCalendarTimePageInEnglish() {
    expect(element(c4p.E2e.linkAsidePage).count()).toBe(1);
    expect(element('a[ng-click="setActivePanel(1)"]').text()).toMatch(new RegExp('^\\s*Calendar\\s*$'));

    // Show link to toggle to List view
    expect(element(c4p.E2e.calendarViewMenuTitle).text()).toMatch(new RegExp('^\\s*Day\\s*$'));
}

function checkCalendarListPageInEnglish() {
    expect(element(c4p.E2e.linkAsidePage).count()).toBe(1);
    expect(element('a[ng-click="setActivePanel(1)"]').text()).toMatch(new RegExp('^\\s*Calendar\\s*$'));

    // Show link to toggle to Time view
    expect(element(c4p.E2e.calendarViewMenuTitle).text()).toMatch(new RegExp('^\\s*List\\s*$'));
}

function checkCalendarMonthPageInEnglish() {
    expect(element(c4p.E2e.linkAsidePage).count()).toBe(1);
    expect(element('a[ng-click="setActivePanel(1)"]').text()).toMatch(new RegExp('^\\s*Calendar\\s*$'));

    // Show link to toggle to Time view
    expect(element(c4p.E2e.calendarViewMenuTitle).text()).toMatch(new RegExp('^\\s*Month\\s*$'));
}

function checkNbModal(nb) {
    expect(element('.modal').count()).toBe(nb);
}

function checkNotification(message, seconds) {
    expect(element('div.noty_message span.noty_text').text()).toBe(message);
    sleep(seconds);
    expect(element('div.noty_message').count()).toEqual(0);
}

function checkGuider(messagePattern) {
    checkNbModal(1);
    expect(element(c4p.E2e.pGuider).count()).toBe(1);
    expect(element(c4p.E2e.pGuider).text()).toMatch(messagePattern);
}

function checkNoGuider() {
    checkNbModal(0);
    expect(element(c4p.E2e.pGuider).count()).toBe(0);
}
