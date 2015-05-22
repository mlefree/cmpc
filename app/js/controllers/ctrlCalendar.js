/**
 * Calendar view controller
 *
 * @param $scope
 * @param version
 * @param srvAnalytics
 * @param srvLocale
 * @param srvTime
 * @param srvConfig
 */
function ctrlCalendar($scope, $timeout, version, srvAnalytics, srvLocale, srvTime, srvConfig){
    'use strict';

    // TODO : manage also Tasks

    $scope.calendarNow = new Date(srvTime.year, srvTime.month - 1, srvTime.day, 0, 0, 0, 0);
    //var now = new Date();
    //$scope.calendarNow = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    $scope.ctrlCalendarInitialized = false;
    $scope.ctrlCalendarCanevasInitialized = false;

    //$scope.datetimeFormat = "yyyy-MM-dd HH:mm:ss";
    $scope.calendarSelected = new Date(); // now

    // Date selected by user
    $scope.calendarSelectedDay = null; // Structure with Date <= calendarSel

    // Display fields
    $scope.calendarYear = 0;
    $scope.calendarMonth = 0;
    $scope.calendarMonthName = '';
    $scope.calendarMonthShortName = '';
    $scope.calendarMonthFullName = '';
    $scope.calendarDayFullName = '';
    $scope.calendarDayCasualName = '';
    $scope.calendarPreviousMonthName = '';
    $scope.calendarPreviousYear = 0;
    $scope.calendarNextMonthName = '';
    $scope.calendarNextYear = 0;

    $scope.calendarMonths = [];// Locale Month Info
    $scope.calendarMonthWeeks = [];// Locale Weeks Info
    $scope.calendarHoursDay = [];// Locale Hours info

    // Events groups
    $scope.calendarEventsGroupsByDay = [];

    // Month Size
    $scope.calendarMonthWidth = 400;
    $scope.calendarMonthHeight = 400;
    $scope.calendarMonthCellWidth = 30;
    $scope.calendarMonthCellHeight = 30; //{{(bodyHeight / calendarMonthWeeks.length)}}px
    //resize-vars="{bodyHeight:&quot;responsivePageHeight() -getResizePathValue('calendar_header', '', 'offsetHeight') -getResizePathValue('calendar_month_header', '', 'offsetHeight')&quot;}"
    $scope.calendarNextEvent = null;

    //-----------------------
    // Methods

    $scope.initCalendarCtrl = function () {
        $scope.ctrlCalendarCanevasInitialized = false;

        // FIXME : no update of data in this controller if srvLocale.translations change

        if (!$scope.ctrlCalendarInitialized) {

          // ConfigCtrl inherit
          $scope.configStateEdit = false;
          $scope.configStateAdd = true;

          // Header & Footer
          $scope.setNavTitle(srvLocale.translations.htmlTitleCalendar);
            $scope.calendarViews = [
                {
                    id: 'dayView',
                    icon: 'clock-o'
                },
                {
                    id: 'monthView',
                    icon: 'calendar'
                },
                {
                    id: 'listView',
                    icon: 'list'
                }
            ];

            // Events filters
          $scope.filterAscEvent = false;
          $scope.filterCriteriaEvent = 'date_start';
          $scope.filterAscEventGroup = false;
          $scope.filterCriteriaEventGroup = 'date';

          $scope.calendarHoursDay = $scope.srvLocale.getHoursDay();
          $scope.calendarMonths = $scope.srvLocale.getMonths();

          // Init selected day
          var back = $scope.srvNav.lastInHistoryWithType('Event');
          if (back) {
            var selEvent = $scope.srvData.getObject(back.id);
            $scope.calendarSelected = a4pDateParse(selEvent.date_start);
          } else {
            $scope.calendarSelected = new Date(); // now
          }


          // get update from Time changing
          srvTime.addListenerOnDay(function() {
              $scope.calendarNow = new Date(srvTime.year, srvTime.month - 1, srvTime.day, 0,  0,  0, 0);
              _onCalendarNowChange($scope);
          });

        }

        //init size & canevas
        _computeCalendarMonthSize($scope);
        $scope.ctrlCalendarCanevasInitialized = true;

        _onEventChange($scope);

        if (!$scope.ctrlCalendarInitialized) {
          // Get the next meeting
          _buildNextEvent($scope);
        }

        $scope.ctrlCalendarInitialized = true;
    };


    function _computeCalendarMonthSize(scope) {
        var h = scope.responsivePageHeight() - 200;
        var w = scope.responsivePageWidth() - 100;

        //FIXME : resdesign calendar
        var hCell = h / 7;
        var wCell = w / 7;

        // get the min
        var minCell = hCell;//(hCell < wCell) ? Math.round(hCell) : Math.round(wCell);

        scope.calendarMonthHeight = minCell*6;
        scope.calendarMonthCellHeight = minCell;
        scope.calendarMonthWidth = minCell*7;
        scope.calendarMonthCellWidth = minCell;
        // TODO
        // {{(bodyHeight / calendarMonthWeeks.length)}}px
        //  /calendarMonthWeeks[0].days.length

    }

    function _createGroup(date) {
        return {
            date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0),
            day: date.getDate(),
            year: date.getFullYear(),
            month: date.getMonth(),
            //TODO ??
            //monthName:$scope.calendarMonths[$scope.calendarSelected.getMonth()].name,
            //monthShortName:$scope.calendarMonths[$scope.calendarSelected.getMonth()].shortName,
            //orderDate: evtStartDate,
            //closestDate : closestDate,
            events: [],
            eventsPosition: [],
            eventsAllDay: [],
            eventsAllDayPosition: []
        };
    }

    function _buildEventGroupsByDay(self) {
        // Build Events group by Date
        var eventsSorted = self.srvData.currentItems.Event.slice(0);// Copy array but NOT events (copy only pointers on events)
        eventsSorted.sort(function (a,b) {
            if (a[self.filterCriteriaEvent] <= b[self.filterCriteriaEvent]) {
                return -1;
            }
            return 1;
        });
        self.calendarEventsGroupsByDay = [];

        var eventNb = eventsSorted.length;
        if (eventNb <= 0) {
            return;
        }
        var initEvent = eventsSorted[0];
        var initEventStartDate = a4pDateParse(initEvent.date_start);
        var groupStartDate = new Date(initEventStartDate.getFullYear(), initEventStartDate.getMonth(), initEventStartDate.getDate(), 0, 0, 0, 0);
        //var groupStartDate = new Date(srvTime.year, srvTime.month - 1, srvTime.day, 0, 0, 0, 0);
        var groupEndDate = new Date(groupStartDate.getFullYear(), groupStartDate.getMonth(), groupStartDate.getDate(), 23, 59, 59, 0);

        // BEWARE : order by date_start, but NOT by date_end
        var firstEventIdx = 0;
        while (firstEventIdx < eventNb) {
            var firstEvent = eventsSorted[firstEventIdx];
            var firstEventEndDate = a4pDateParse(firstEvent.date_end);
            if (firstEventEndDate.getTime() < groupStartDate.getTime()) {
                // Event in past time
                firstEventIdx++;
                continue;
            }
            // Start group
            var firstEventStartDate = a4pDateParse(firstEvent.date_start);
            if (firstEventStartDate.getTime() >= groupEndDate.getTime()) {
                // Group starts directly on next event start_date
                groupStartDate = new Date(firstEventStartDate.getFullYear(), firstEventStartDate.getMonth(), firstEventStartDate.getDate(), 0, 0, 0, 0);
                groupEndDate = new Date(groupStartDate.getFullYear(), groupStartDate.getMonth(), groupStartDate.getDate() + 1, 0, 0, 0, 0);
            }
            var group = _createGroup(groupStartDate);
            // Add events in group
            var nextEventIdx = firstEventIdx;
            var nextEvent = firstEvent;
            var nextEventStartDate = firstEventStartDate;
            var nextEventEndDate = firstEventEndDate;
            while ((nextEventIdx < eventNb) && (nextEventStartDate.getTime() < groupEndDate.getTime())) {
                if (groupStartDate.getTime() <= nextEventEndDate.getTime()) {
                    var posPercent = 0;
                    var lengthPercent = 100;
                    if (nextEventStartDate.getTime() <= groupStartDate.getTime()) {
                        lengthPercent = a4pTranslateDatesToPxSize(groupStartDate, nextEventEndDate, 100);
                    } else {
                        posPercent = a4pTranslateDateToPx(nextEventStartDate, 100);
                        if (nextEventEndDate.getTime() >= groupEndDate.getTime()) {
                            lengthPercent = a4pTranslateDatesToPxSize(nextEventStartDate, groupEndDate, 100);
                        } else {
                            lengthPercent = a4pTranslateDatesToPxSize(nextEventStartDate, nextEventEndDate, 100);
                        }
                    }
                    // We have already following conditions :
                    // (nextEventStartDate.getTime() <= groupEndDate.getTime())
                    // && (groupStartDate.getTime() <= nextEventEndDate.getTime())

                    if ((nextEventStartDate.getTime() < groupStartDate.getTime()) ||
                         (groupEndDate.getTime() <= nextEventEndDate.getTime()) ||
                         ((nextEventStartDate.getTime() == groupStartDate.getTime()) &&
                           ((groupEndDate.getTime() - 1000) <= nextEventEndDate.getTime()))) {
                        // Event covers one full day or covers many days
                        group.eventsAllDay.push(nextEvent);
                        group.eventsAllDayPosition.push({
                            posPercent: posPercent,
                            lengthPercent: lengthPercent,
                            posWithLastPercent: 0,
                            event: nextEvent
                        });
                    } else {
                        group.events.push(nextEvent);
                        group.eventsPosition.push({
                            posPercent: posPercent,
                            lengthPercent: lengthPercent,
                            posWithLastPercent: 0,
                            event: nextEvent
                        });
                    }
                }
                // Next event
                nextEventIdx++;
                if (nextEventIdx < eventNb) {
                    nextEvent = eventsSorted[nextEventIdx];
                    nextEventStartDate = a4pDateParse(nextEvent.date_start);
                    nextEventEndDate = a4pDateParse(nextEvent.date_end);
                }
            }
            // End group
            if ((group.events.length > 0) || (group.eventsAllDay.length > 0)) {
                self.calendarEventsGroupsByDay.push(group);
            }
            // Next group  : group starts on next day
            groupStartDate = new Date(groupStartDate.getFullYear(), groupStartDate.getMonth(), groupStartDate.getDate() + 1, 0, 0, 0, 0);
            groupEndDate = new Date(groupStartDate.getFullYear(), groupStartDate.getMonth(), groupStartDate.getDate() + 1, 0, 0, 0, 0);
        }
    }

    function _buildEventsGroupsByDaySinceToday(self) {
        // Keep only groups starting since calendarNow
        self.calendarEventsGroupsByDaySinceToday = [];
        var nb = self.calendarEventsGroupsByDay.length;
        for (var i = 0; i < nb; i++) {
            var group = self.calendarEventsGroupsByDay[i];
            if (group.date.getTime() >= self.calendarNow.getTime()) {
                self.calendarEventsGroupsByDaySinceToday = self.calendarEventsGroupsByDay.slice(i);
                break;
            }
        }
    }

    function _buildNextEvent(self) {

        _buildEventsGroupsByDaySinceToday(self);

        // get first EventsGroupsByDaySinceToday'sevent ending after now
        var now = new Date();

        self.calendarNextEvent = null;
        if (!self.calendarEventsGroupsByDaySinceToday || !self.calendarEventsGroupsByDaySinceToday.length) return;

        var nb = self.calendarEventsGroupsByDay.length;
        for (var i = 0; (i < nb) && (self.calendarNextEvent === null); i++) {
            var group = self.calendarEventsGroupsByDay[i];

            var nbe = group.events.length;
            for (var j = 0; (j < nbe) && (self.calendarNextEvent === null); j++) {
                var ev = group.events[j];
                var evtEndDate = a4pDateParse(ev.date_end);
                if (now < evtEndDate) {
                  self.calendarNextEvent = ev;
                  break;
                }
            }

            var nbea = group.eventsAllDay.length;
            for (var k = 0; (k < nbea) && (self.calendarNextEvent === null); k++) {
                var eva = group.eventsAllDay[k];
                var evtaEndDate = a4pDateParse(eva.date_end);
                if (now < evtaEndDate) {
                  self.calendarNextEvent = eva;
                  break;
                }
            }

        }
    }

    function _computeCasualDay(self) {
        var day = self.calendarSelected.getDay() - 1;
        if (day < 0) day = 6;
        var dayQualif = '';
        var checkToday = new Date(self.calendarSelected.getFullYear(), self.calendarSelected.getMonth(), self.calendarSelected.getDate(), 0, 0, 0, 0);
        var checkYesterday = new Date(self.calendarSelected.getFullYear(), self.calendarSelected.getMonth(), self.calendarSelected.getDate() + 1, 0, 0, 0, 0);
        var checkTomorrow = new Date(self.calendarSelected.getFullYear(), self.calendarSelected.getMonth(), self.calendarSelected.getDate() - 1, 0, 0, 0, 0);
        if (checkToday.getTime() == self.calendarNow.getTime()) {
            dayQualif = srvLocale.translations.htmlTextToday + ', ';
        } else if (checkYesterday.getTime() == self.calendarNow.getTime()) {
            dayQualif = srvLocale.translations.htmlTextYesterday + ', ';
        } else if (checkTomorrow.getTime() == self.calendarNow.getTime()) {
            dayQualif = srvLocale.translations.htmlTextTomorrow + ', ';
        }
        self.calendarDayCasualName = dayQualif + self.calendarMonthWeeks[0].days[day].name;
    }

    function _onCalendarNowChange(self) {
        // update all data influenced by $scope.calendarNow
        //buildEventsGroupsByDaySinceToday();
        _computeCasualDay(self);
    }

    function _getGroupForSelectedDay(self) {
        // retrieve or create group for current Day
        var len = self.calendarEventsGroupsByDay.length;
        for (var i = 0; i < len; i++) {
            var currentDay = self.calendarEventsGroupsByDay[i];
            if (currentDay.year < self.calendarSelected.getFullYear()) continue;
            if (currentDay.year > self.calendarSelected.getFullYear()) break;
            if (currentDay.month < self.calendarSelected.getMonth()) continue;
            if (currentDay.month > self.calendarSelected.getMonth()) break;
            if (currentDay.day < self.calendarSelected.getDate()) continue;
            if (currentDay.day > self.calendarSelected.getDate()) break;
            return currentDay;
        }
        return _createGroup(self.calendarSelected);
    }

    /* For a given date, get the ISO week number
    *
    * Based on information at:
    *
    *    http://www.merlyn.demon.co.uk/weekcalc.htm#WNR
    *
    * Algorithm is to find nearest thursday, it's year
    * is the year of the week number. Then get weeks
    * between that date and the first day of that year.
    *
    * Note that dates in one year can be weeks of previous
    * or next year, overlap is up to 3 days.
    *
    * e.g. 2014/12/29 is Monday in week  1 of 2015
    *      2012/1/1   is Sunday in week 52 of 2011
    */
    function _getWeekNumber(d) {
        // Copy date so don't modify original
        d = new Date(d);
        d.setHours(0, 0, 0);
        // Set to nearest Thursday: current date + 4 - current day number
        // Make Sunday's day number 7
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        // Get first day of year
        var yearStart = new Date(d.getFullYear(), 0, 1);
        // Calculate full weeks to nearest Thursday
        var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1) / 7);
        // Return array of year and week number
        return [d.getFullYear(), weekNo];
    }

    function _getMonthWeeks(self, month, year) {
        var monthWeeks = [];
        var localeWeekDays = [
            {idx: 0, name: srvLocale.translations.htmlTextMonday, shortName: srvLocale.translations.htmlTextShortMonday},
            {idx: 1, name: srvLocale.translations.htmlTextTuesday, shortName: srvLocale.translations.htmlTextShortTuesday},
            {idx: 2, name: srvLocale.translations.htmlTextWednesday, shortName: srvLocale.translations.htmlTextShortWednesday},
            {idx: 3, name: srvLocale.translations.htmlTextThursday, shortName: srvLocale.translations.htmlTextShortThursday},
            {idx: 4, name: srvLocale.translations.htmlTextFriday, shortName: srvLocale.translations.htmlTextShortFriday},
            {idx: 5, name: srvLocale.translations.htmlTextSaturday, shortName: srvLocale.translations.htmlTextShortSaturday},
            {idx: 6, name: srvLocale.translations.htmlTextSunday, shortName: srvLocale.translations.htmlTextShortSunday}
        ];

        // Init
        var firstDayMonth = a4pFirstDayOfMonth(year, month+1);
        var firstDayMonthWeek = a4pDayOfSameWeek(firstDayMonth, 1);
        var lastDayMonth = a4pLastDayOfMonth(year, month+1);
        //var lastDayMonthWeek = a4pDayOfSameWeek(lastDayMonth, 7);

       // Loop on each week and each day
        var nbGroups = self.calendarEventsGroupsByDay.length;
        var currentDay = new Date(firstDayMonthWeek.getFullYear(), firstDayMonthWeek.getMonth(), firstDayMonthWeek.getDate(), 0, 0, 0, 0);
        var groupIdx = 0;
        var currentGroup = null;
        for (; groupIdx < nbGroups; groupIdx++) {
            var initGroup = self.calendarEventsGroupsByDay[groupIdx];
            if (initGroup.year < currentDay.getFullYear()) continue;
            if (initGroup.year > currentDay.getFullYear()) break;
            if (initGroup.month < currentDay.getMonth()) continue;
            if (initGroup.month > currentDay.getMonth()) break;
            if (initGroup.day < currentDay.getDate()) continue;
            if (initGroup.day > currentDay.getDate()) break;
            currentGroup = initGroup;
            break;
        }
        if (!currentGroup) {
            currentGroup = _createGroup(currentDay);
        }
        while (currentDay <= lastDayMonth) {
            var week = {
                id:a4pWeek(currentDay),
                days:[]
            };
            for (var dayId = 0; dayId < 7; dayId++) {
                var day = {
                    day: dayId,
                    date: new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate(), 0, 0, 0, 0),
                    name: localeWeekDays[dayId].name,
                    shortName: localeWeekDays[dayId].shortName,
                    isWeekend: ((dayId >= 5)),
                    group:currentGroup
                };
                week.days.push(day);
                currentDay.setDate(currentDay.getDate()+1);
                currentGroup = null;
                for (; groupIdx < nbGroups; groupIdx++) {
                    var testGroup = self.calendarEventsGroupsByDay[groupIdx];
                    if (testGroup.year < currentDay.getFullYear()) continue;
                    if (testGroup.year > currentDay.getFullYear()) break;
                    if (testGroup.month < currentDay.getMonth()) continue;
                    if (testGroup.month > currentDay.getMonth()) break;
                    if (testGroup.day < currentDay.getDate()) continue;
                    if (testGroup.day > currentDay.getDate()) break;
                    currentGroup = testGroup;
                    break;
                }
                if (!currentGroup) {
                    currentGroup = _createGroup(currentDay);
                }
            }
            monthWeeks.push(week);
        }

        return monthWeeks;
    }

    function _onSelChange(self) {
        // update all data influenced by $scope.calendarSelected
        if ((self.calendarYear != self.calendarSelected.getFullYear()) || (self.calendarMonth != self.calendarSelected.getMonth())) {
            self.calendarYear = self.calendarSelected.getFullYear();
            self.calendarMonth = self.calendarSelected.getMonth();
            self.calendarMonthWeeks = _getMonthWeeks(self, self.calendarMonth, self.calendarYear);
            self.calendarMonthName = self.calendarMonths[self.calendarMonth].name;
            self.calendarMonthShortName = self.calendarMonths[self.calendarMonth].shortName;
            self.calendarMonthFullName = self.calendarMonthName + ' ' + self.calendarYear;
        }
        self.calendarDayFullName = self.calendarSelected.getDate() + ' ' + self.calendarMonthName + ' ' + self.calendarYear;
        _computeCasualDay(self);
        //Previous
        var previous = new Date(self.calendarSelected.getFullYear(),self.calendarSelected.getMonth() - 1, 1,0,0,0,0);
        self.calendarPreviousMonthName = self.calendarMonths[previous.getMonth()].name;
        self.calendarPreviousYear = self.calendarSelected.getFullYear() - 1;
        //Next
        var next = new Date(self.calendarSelected.getFullYear(),self.calendarSelected.getMonth() + 1, 1,0,0,0,0);
        self.calendarNextMonthName = self.calendarMonths[next.getMonth()].name;
        self.calendarNextYear = self.calendarSelected.getFullYear() + 1;

        self.calendarSelectedDay = _getGroupForSelectedDay(self);

        self.stopSpinner();
        //GA: user really interact with calendar, he changes the Selected day
        srvAnalytics.add('Once', 'Calendar');
    }

    function _onEventChange(self) {
        _buildEventGroupsByDay(self);
        //buildEventsGroupsByDaySinceToday();
        // update all data influenced by $scope.calendarSelected
        self.calendarYear = self.calendarSelected.getFullYear();
        self.calendarMonth = self.calendarSelected.getMonth();
        self.calendarMonthWeeks = _getMonthWeeks(self, self.calendarMonth, self.calendarYear);
        self.calendarMonthName = self.calendarMonths[self.calendarMonth].name;
        self.calendarMonthShortName = self.calendarMonths[self.calendarMonth].shortName;
        self.calendarMonthFullName = self.calendarMonthName + ' ' + self.calendarYear;
        self.calendarDayFullName = self.calendarSelected.getDate() + ' ' + self.calendarMonthName + ' ' + self.calendarYear;
        _computeCasualDay(self);

        //Previous
        var previous = new Date(self.calendarSelected.getFullYear(),self.calendarSelected.getMonth() - 1, 1,0,0,0,0);
        self.calendarPreviousMonthName = self.calendarMonths[previous.getMonth()].name;
        self.calendarPreviousYear = self.calendarSelected.getFullYear() - 1;
        //Next
        var next = new Date(self.calendarSelected.getFullYear(),self.calendarSelected.getMonth() + 1, 1,0,0,0,0);
        self.calendarNextMonthName = self.calendarMonths[next.getMonth()].name;
        self.calendarNextYear = self.calendarSelected.getFullYear() + 1;

        self.calendarSelectedDay = _getGroupForSelectedDay(self);
    }

    // Navigation : view, next/previous day
    // -------------------------------------

    $scope.checkViewActive = function(id){
        //a4p.InternalLog.log('ctrlCalendar - checkViewActive', ''+id+' ?= '+$scope.calendarView);
        return $scope.calendarView == id;
    };

    $scope.checkViewNp1Active = function(id){
        //a4p.InternalLog.log('ctrlCalendar - checkViewActive', ''+id+' ?= '+$scope.calendarView);
        return ($scope.calendarView != id);
    };

    $scope.onEventClick = function (event) {
        //a4p.InternalLog.log('ctrlCalendar - onEventClick goto Event with aside closed ',event.name);
        $scope.setItemAndGoDetail(event,true);
    };

    $scope.setSelectedDate = function (date){

        if (!date || date == "undefined") return;
        if (($scope.calendarSelected.getFullYear() != date.getFullYear()) ||
            ($scope.calendarSelected.getMonth() != date.getMonth()) ||
            ($scope.calendarSelected.getDate() != date.getDate())) {
            $scope.calendarSelected = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
            // Refresh
            _onSelChange($scope);
        }
    };

    $scope.onDayClick = function (date) {

        $scope.setSelectedDate(date);

        // do not open dialog if no data
        if ((!$scope.calendarSelectedDay.events || !$scope.calendarSelectedDay.events.length) &&
            (!$scope.calendarSelectedDay.eventsAllDay || !$scope.calendarSelectedDay.eventsAllDay.length))
            return;

        // temp ?
        $scope.openDialog(
                {
                    backdrop: true,
                    windowClass: 'modal c4p-modal-large c4p-dialog',
                    controller: 'ctrlDialogCalendarDay',
                    templateUrl: 'views/dialog/dialogCalendarDay.html',
                    resolve: {
                        srvLocale: function () {
                            return $scope.srvLocale;
                        },
                        calendarDayCasualName: function () {
                            return $scope.calendarDayCasualName;
                        },
                        calendarDayFullName: function () {
                            return $scope.calendarDayFullName;
                        },
                        calendarSelectedDay: function () {
                            return $scope.calendarSelectedDay;
                        }
                    }
                },
                function (params) {
                    if (params && params.item && !params.gotoMeeting) $scope.onEventClick(params.item);

                    if (params && params.item && params.gotoMeeting) $scope.gotoMeeting(params.item);
                }
        );

        return; //soon

        //focus on Day Column
        //$scope.setCalendarView('dayView');
    };

    $scope.gotoPreviousMonth = function () {
      // var year = $scope.calendarSelected.getFullYear();
      // var month = $scope.calendarSelected.getMonth();
      // var day = $scope.calendarSelected.getDate();
      //   if (month > 0) {
      //       month = month - 1;
      //   } else {
      //       month = 11;
      //       year = year -1;
      //   }
      // $scope.calendarSelected = new Date(year, month, day, 0, 0, 0, 0);

        $scope.calendarSelected.setMonth($scope.calendarSelected.getMonth()-1);
        // Refresh
        $scope.calendarLoadingSpinner = true;//onSelChange();
    };

    $scope.gotoNextMonth = function () {

      // var year = $scope.calendarSelected.getFullYear();
      // var month = $scope.calendarSelected.getMonth();
      // var day = $scope.calendarSelected.getDate();
      //   if (month < 11) {
      //       month = month+1;
      //   } else {
      //       month = 0;
      //       year = year+1;
      //   }
      //  $scope.calendarSelected = new Date(year, month, day, 0, 0, 0, 0);

        $scope.calendarSelected.setMonth($scope.calendarSelected.getMonth()+1);
        // Refresh
        $scope.calendarLoadingSpinner = true;//onSelChange();
    };

    $scope.gotoNow = function () {
        //$scope.calendarNow = new Date();
        $scope.calendarSelected = new Date($scope.calendarNow.getFullYear(), $scope.calendarNow.getMonth(), $scope.calendarNow.getDate(), 0, 0, 0, 0);
        // Refresh
        $scope.calendarLoadingSpinner = true;//onSelChange();
    };

    $scope.gotoPreviousDay = function () {
        $scope.calendarSelected.setDate($scope.calendarSelected.getDate()-1);
        // Refresh
        $scope.calendarLoadingSpinner = true;//onSelChange();
    };

    $scope.gotoNextDay = function () {
        $scope.calendarSelected.setDate($scope.calendarSelected.getDate()+1);
        // Refresh
        $scope.calendarLoadingSpinner = true;//onSelChange();
    };

    $scope.gotoNextYear = function () {
        $scope.calendarSelected.setFullYear($scope.calendarSelected.getFullYear()+1);
        // Refresh
        $scope.calendarLoadingSpinner = true;//onSelChange();
    };

    $scope.gotoPreviousYear = function () {
        $scope.calendarSelected.setFullYear($scope.calendarSelected.getFullYear()-1);
        // Refresh
        $scope.calendarLoadingSpinner = true;//onSelChange();
    };

    $scope.gotoNextMeeting = function () {
        if (!$scope.calendarNextEvent) return;

        $scope.gotoMeeting($scope.calendarNextEvent);
    };

    /**
     * Translate Date & Time
     */
    $scope.translateDateDayToString = function(date) {
      var val = $scope.srvLocale.formatDate(date,'shortDate');
      return val;
    };
    $scope.translateDateDayToFullString = function(date) {
      var val = $scope.srvLocale.formatDate(date,'fullDate');
      return val;
    };
    $scope.translateDateToTimeString = function (date) {

      var val = srvLocale.formatDate(date,'shortTime');
      return val;
      //return a4pTranslateDateToTimeString(oneDate);
    };



    // $scope._formatStringDateToDay = function(string) {
    //   var date = a4pDateParse(string);
    //   var val = $scope.srvLocale.formatDate(date,'shortDate');
    //   return val;
    // };
    //
    // $scope._formatStringDateToTime = function(string) {
    //   var date = a4pDateParse(string);
    //   var val = $scope.srvLocale.formatDate(date,'shortTime');
    //   return val;
    // };


    $scope.getEventTime = function(dateStr) {
      var time = '';
      //var event = $scope.srvData.getObject($scope.itemDBId);
      if (!dateStr) return time;

      var date = a4pDateParse(dateStr);
      time = $scope.translateDateToTimeString(date);

      return time;
    };



    $scope.isMultiDayEventWithTimeToShow = function(event, date,isBegin){
        var b = false;

        var evtStartDate = a4pDateParse(event.date_start);
        var evtEndDate = a4pDateParse(event.date_end);
        var dateBegin = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
        var dateEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 0);

        if (	isBegin && dateBegin < evtStartDate){
          b = true;
        }
        else if(!isBegin && evtEndDate < dateEnd){
          b = true;
        }
        return b;
    };

    //
    // CtrlNavigation inheritance : addItemDialog
    //
    // Launch Event Edit Dialog
    $scope.addItemDialog = function(type, hour){

        // if hour is given, use it as now
        var now = new Date();
        // var hourBegin = now.getHours() + 1;
        // var hourEnd = now.getHours() + 2;
        // if (hour) {
        //   hourBegin = hour;
        //   hourEnd = hour +1;
        // }
        // var mnBegin = 0;
        // var mnEnd = 0;
        var hourBegin = now.getHours();
        if (hour) hourBegin = hour;
        var hourEnd = hourBegin + 1;
        var mnBegin = now.getMinutes();
        var mnEnd = mnBegin;

        // Create a temp event to edit
        var selectedDayAsDate = $scope.calendarSelected;
        var selectedDayAsDateStart = new Date(	selectedDayAsDate.getFullYear(),
                        selectedDayAsDate.getMonth(),
                        selectedDayAsDate.getDate(),
                        hourBegin, mnBegin, 0, 0);
        var selectedDayAsDateEnd = new Date(	selectedDayAsDate.getFullYear(),
                        selectedDayAsDate.getMonth(),
                        selectedDayAsDate.getDate(),
                        hourEnd, mnEnd, 0, 0);
        var newEvent = $scope.srvData.createObject('Event', {
                        name:srvLocale.translations.htmlTextDefaultEventName,
                        date_start: a4pDateFormat(selectedDayAsDateStart),
                        date_end: a4pDateFormat(selectedDayAsDateEnd)
        });

        $scope.openDialog(
                {
                    backdrop: false,
                    windowClass: 'modal c4p-modal-large c4p-dialog',
                    controller: 'ctrlEditDialogObject',
                    templateUrl: 'views/dialog/edit_object.html',
                    resolve: {
                        srvData: function () {
                            return $scope.srvData;
                        },
                        srvLocale: function () {
                            return $scope.srvLocale;
                        },
                        srvConfig: function () {
                            return srvConfig;
                        },
                        objectItem: function () {
                            //return angular.copy(newEvent);
                            return newEvent;
                        },
                        removeFct: function () {
                            return function (obj) {
                                $scope.srvData.removeAndSaveObject(obj);
                                $scope.gotoBack(0);
                            };
                        },
                        startSpinner: function () {
                            return $scope.startSpinner;
                        },
                        stopSpinner: function () {
                            return $scope.stopSpinner;
                        },
                        openDialogFct: function () {
                            return $scope.openDialog;
                        }
                    }
                },
                function (result) {
                    if (a4p.isDefined(result)) {
                        a4p.safeApply($scope, function() {
                            $scope.addEvent(result);
                        });
                    }
                });
    };

    $scope.addEvent = function(event) {
        if (a4p.isUndefined(event) || !event) return;

        $scope.srvData.addAndSaveObject(event);
        _onEventChange($scope);
        a4p.InternalLog.log('ctrlCalendar - openDialogEditEvent', 'Created event.id.dbid:' + event.id.dbid);
        $scope.onEventClick(event);

        //GA: user really interact with calendar, he adds one event
        srvAnalytics.add('Once', 'Calendar - add Event');
    };

    $scope.removeEvent = function(event){
      a4p.InternalLog.log('ctrlCalendar - removeEvent',event.name);
      var array = [event.name];
      $scope.openDialogConfirm(srvLocale.translations.htmlTextConfirmDelete , array,
        function(confirm) {
            if (confirm) {
                        a4p.safeApply($scope, function() {
                            var i;
                            var attendees = $scope.srvData.getRemoteLinks(event, 'attendee');
                            for (i = 0; i < attendees.length; i++) {
                                $scope.srvData.delAndSaveAttachment('Attendee', attendees[i], event);
                            }
                            var attachees = $scope.srvData.getRemoteLinks(event, 'attachee');
                            for (i = 0; i < attachees.length; i++) {
                                $scope.srvData.delAndSaveAttachment('Attachee', attachees[i], event);
                            }
                            var children = $scope.srvData.getRemoteLinks(event, 'child');
                            for (i = 0; i < children.length; i++) {
                                $scope.srvData.removeAndSaveObject(children[i]);
                            }
                            $scope.srvData.removeAndSaveObject(event);
                                      _onEventChange($scope);
                            //$scope.gotoNow();
                            });
              }
        }
      );

    };

    $scope.selectHour = function (event, hour) {
        hour.selected = true;
    };

    $scope.cancelHour = function (event, hour) {
        hour.selected = false;
    };

    $scope.newEventAtHour = function (event, hour) {
        hour.selected = false;
        $scope.addItemDialog(null, hour.hour);
    };


    //---------------
    //  Spinner do init
    $scope.calendarLoadingSpinner = true;
    $scope.afterCalendarSpinnerShow = function() {
        //console.log('Fully shown');
        $timeout(function() {
                $scope.computeCalendar();
        },400);
    };
    $scope.afterCalendarSpinnerHide = function() {
        //console.log('Fully hidden');
    };
    $scope.computeCalendar = function() {

        a4p.InternalLog.log('ctrlCalendar','computeCalendar ');
        $scope.initCalendarCtrl();
        // remove spinner
        $scope.calendarLoadingSpinner = false;
    };


    //---------------
    // Events catched

    $scope.$on('mindMapUpdated', function (event) {
        $scope.calendarLoadingSpinner = true;//onEventChange();
    });

    $scope.$on('mindMapLoaded', function (event) {
        $scope.calendarLoadingSpinner = true;//onEventChange();
    });

    $scope.$on('responsiveWindowSizeChanged', function () {
        $scope.calendarLoadingSpinner = true;
    });

}

angular.module('crtl.calendar', []).controller('ctrlCalendar', ctrlCalendar);
//ctrlCalendar.$inject = ['$scope','$timeout', 'version', 'srvAnalytics', 'srvLocale', 'srvTime', 'srvConfig'];
