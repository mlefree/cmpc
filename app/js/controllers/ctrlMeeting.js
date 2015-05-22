
/**
 * Meeting pane controller
 *
 * @param $scope
 * @param $modal
 * @param srvData
 * @param srvConfig
 * @param srvNav
 */
function ctrlMeeting($scope, $q, $modal, $timeout, srvData, srvConfig, srvNav, srvLocale, srvAnalytics) {
'use strict';


    $scope.srvData = srvData;
    $scope.srvNav = srvNav;
    $scope.srvConfig = srvConfig;

    //$scope.scrollXCoord = 0;
    //$scope.meetingSidePanelWidth = 0;
    //$scope.hasScroller = false;
    //$scope.onePageFormat = true;
    //$scope.pageHeight = 320;
    //$scope.pageWidth = 240;
    //$scope.showMenu = true;
    //$scope.updateScrollerTimer = null;

    $scope.meetingHasBeenInitialized =         false;

    $scope.meetingItem = null;
    //$scope.meetingItemName = '';
    $scope.showMeetingAside = true;
    $scope.meetingContactsAsAttendee = [];

    //$scope.meetingSensePanel = null;
    //$scope.setMeetingSensePanel = function (sense) {
    //    $scope.meetingSensePanel = sense;
    //};

    // User has discover meeting functionnalities
    $scope.meetingHasBeenUnderstoodByUser = false;

    /*
     Only Plan objects possess an order attribute named 'pos'.
     A Plan object can possess an ordered list of sub Plan objects (order given by 'pos' attribute of sub Plan objects) : none for the moment.
     A sub Plan object has a Plan as parent while a Plan object has an Event as parent.
     A Plan object possess an unordered list of Plannee objects : only 1 for the moment.
     Only Plannee objects possess a pointer on Document/Note/Report object.
     */
    $scope.meetingPlans = [];

    $scope.viewerDocList = [];

    $scope.selectedMeetingPlanPos = 0;
    $scope.selectedMeetingPlan = null; // selected Plan object
    $scope.currentMeetingItem = null; // first Document/Note/Report linked to Plan via a Plannee
    $scope.currentMeetingNote = null;

    $scope.editorType = "Document"; //currently we have only only document editable un editor view

    $scope.modeEdit = false;
    //$scope.meetingView = 'meetingSplitView';

    $scope.itemNameEditable = false;
    $scope.meetingPlanTitleEditable = false;
    $scope.isPresentationOn = false;
    $scope.meetingTableIsOpen = false;

    $scope.meetingAsidePanel = 'views/meeting/meeting_plan.html';
    $scope.meetingCurrentPanel = 'views/meeting/meeting_plan_viewer.html';


    // Email
    $scope.meetingLaunchEmail = false;
    $scope.meetingLaunchEmailLoading = true;

    $scope.actionItems = {
        'plan': {
            icon: 'bars',
            side: 'views/meeting/meeting_plan.html',
            main: 'views/meeting/meeting_plan_viewer.html'
        },
        'others': {
            icon: 'link',
            side: 'views/meeting/meeting_linked_object.html',
            main: 'views/meeting/meeting_object_viewer.html'
        },
        'select': { // Drag & Drop mode
            icon: 'link',
            side: 'views/meeting/meeting_linked_object.html',
            main: 'views/meeting/meeting_plan_viewer.html'
        }
    };

    $scope.meetingSelectedActionItem = 'plan';
    $scope.actionItem = $scope.actionItems[$scope.meetingSelectedActionItem];

    // $scope.updateScroller = a4p.throttle(function () {
    //     var relative = false;
    //     var timeMs = 500;
    //     var x = 0;
    //     var y = 0;
    //
    //     x = $scope.scrollXCoord;
    //     console.log('meetingSensePanel scrollTo ' + x);
    //
    //     if ($scope.meetingSensePanel && $scope.meetingSensePanel.scroll) {
    //         $scope.meetingSensePanel.scroll.scrollTo(x, y, timeMs, relative);
    //     }
    //
    // }, 200);

    // Handler called when AngularJS destroy this controller
    $scope.$on('$destroy', function (event) {
        //$scope.savePlans();
    });


    /**
     * Functions
     */

    $scope.initMeetingElements = function () {
        var bok = true, i;
        if ($scope.meetingHasBeenInitialized)  return;

        // if (!$scope.srvNav.item) {
        //   $scope.initWithDemoData();
        //   return;
        // }

        $scope.meetingItem = null;
        if ($scope.srvNav.item.a4p_type == "Event")
          $scope.meetingItem = $scope.srvNav.item;

        //$scope.meetingItemName = srvNav.item.name;

        // Get Attendees
        var attendees = srvData.getTypedDirectLinks($scope.meetingItem, 'attendee', 'Attendee');
        $scope.meetingContactsAsAttendee = [];
        for (i = 0; i < attendees.length; i++){
          var attendee = attendees[i];
          var removed = srvData.srvSynchroStatus.hasToBeDeleted(attendee);
          var contact = null;
          if (!removed) contact = srvData.getObject(attendee.relation_id.dbid);
          if (contact) $scope.meetingContactsAsAttendee.push(contact);
        }

        //GA: user really interact with meeting, he shows meeting to N attendees
        srvAnalytics.add('Once', 'Meeting Show');
        if ($scope.meetingContactsAsAttendee.length) srvAnalytics.add('Uses', 'Meeting Show - N',$scope.meetingContactsAsAttendee.length);

        $scope.meetingPlans = [];


        var plans = srvData.getTypedDirectLinks($scope.meetingItem, 'child', 'Plan');
        if (plans && plans.length) {
            plans = plans.sort(_sortPosAsc);

            //re-index plans
            for (i = 0; i < plans.length; i++) {
              var plan = plans[i];
              var planIsRemoved = srvData.srvSynchroStatus.hasToBeDeleted(plan);
              if(planIsRemoved) {
                plans.splice(i, 1);
                i--;
              }
              else {
                plan.pos = i;
                $scope.meetingPlans.push(plan);
              }
            }
        }
        else {

            //if (srvConfig.c4pConfigEnv !== 'P' || srvConfig.c4pConfigEnv !== 'I')
            {
                bok = $scope.addMeetingTable();
            }
            // else {
            //     bok = $scope.addMeetingElement();
            // }
        }

        if ($scope.meetingPlans.length) $scope.setMeetingObject(0);

        // Already Understood ?
        if ($scope.meetingPlans.length > 1) $scope.meetingHasBeenUnderstoodByUser = true;

        $scope.meetingHasBeenInitialized = true;

    };

    $scope.initWithDemoData = function () {

        if ($scope.meetingHasBeenInitialized)  return;

        $scope.meetingItem = {};
        //$scope.meetingItemName = 'Demo Item';

        $scope.meetingPlans = [];

        var note = {
            'a4p_type' : 'Note',
            'title': srvLocale.translations.htmlFormTitle,
            'description': ''
        };
        var object = $scope.addNewNote(note);
        $scope.addMeetingElement();

        var group = {
            type: 'relatedType',
            colorType: 'c4p.Model.a4p_types[relatedType].colorType',
            name: 'this.srvLocale.translations.htmlTitleType[relatedType]',
            icon: 'html5',
            size: 3,
            show: true
        };

        srvNav.itemRelatedGroupList.push(group);
        srvNav.itemRelatedList.relatedType = [];
        srvNav.itemRelatedList.relatedType.push(note);

        $scope.meetingHasBeenInitialized = true;
    };

    function _sortPosAsc(planA, planB) {
        if (!planA.pos || !planB.pos) return 0;
        // sort numerically by ascending order of position attribute
        return (planA.pos - planB.pos);
    }

    // Recurise saving of plans & plans objects
    $scope.savePlans = function (plans) {
        if (a4p.isUndefinedOrNull(plans)) {
            plans = $scope.meetingPlans;
        }
        for (var i = 0; i < plans.length; i++) {
            //re-index plans
            plans[i].pos = i;
            srvData.setAndSaveObject(plans[i]);
            var plannees = srvData.getTypedDirectLinks(plans[i], 'plannee', 'Plannee');
            for (var j = 0; j < plannees.length; j++) {
                // save plannee
                $scope.srvData.setAndSaveObject(plannees[j]);

                // save plannee object (note, picture ...)
                var plaDbid = null;
                if (plannees[j].object_id)
                  plaDbid = plannees[j].object_id.dbid;

                var planneeObj = null;
                if (plaDbid) planneeObj = srvData.getObject(plaDbid);
                if (planneeObj)
                  $scope.srvData.setAndSaveObject(planneeObj);
                else
                  a4p.InternalLog.log('ctrlMeeting','savePlans PB pos:'+i+' nb:'+j);
            }
            // Recursive saving in sub-plans
            var subPlans = srvData.getTypedDirectLinks(plans[i], 'child', 'Plan');
            subPlans = subPlans.sort(_sortPosAsc);
            $scope.savePlans(subPlans);
        }
    };
    //
    // $scope.windowSizeChanged = function () {
    //     $scope.onePageFormat = a4p.Resize.resizePortrait; //prefer One column Mode; srvConfig.c4pConfig.phoneFormatIfSmall ? a4p.Resize.resizeOneColumn : a4p.Resize.resizePortrait;
    //     $scope.pageHeight = a4p.Resize.resizeHeight;
    //     $scope.pageWidth = a4p.Resize.resizeWidth;
    //     $scope.hasScroller = $scope.onePageFormat;
    // };

    $scope.setModeEdit = function (mode) {
        var oldMode = $scope.modeEdit;
        $scope.modeEdit = mode;
        if (mode) {
            // Edit mode means Unlock
            //$scope.modeLock = false;
        }

        if (oldMode && !mode) {
            //Quit edit mode means save ?
            $scope.srvData.setAndSaveObject($scope.meetingItem);
        }
    };


    $scope.showAsideGroup = function (group, value) {
        group.show = value;
        //$scope.relatedScrollToGroup(group);
    };


    $scope.setMeetingView = function (newView) {
        $scope.meetingView = newView;
    };

    $scope.quitMeetingView = function () {
        // Can not go back if Auth is required
        if ($scope.srvSecurity.isSecured() && $scope.modeLock) {
            $scope.openDialogLocked(function () {
                a4p.safeApply($scope, function () {
                    $scope.savePlans();
                    $scope.srvData.setAndSaveObject($scope.meetingItem);
                    $scope.setItemAndGoDetail($scope.meetingItem);
                });
            });
        } else {
            $scope.savePlans();
            $scope.srvData.setAndSaveObject($scope.meetingItem);
            $scope.setItemAndGoDetail($scope.meetingItem);
        }
    };


    $scope.getContentPanelWidth = function () {
        return  ($scope.hasScroller ? $scope.pageWidth : ($scope.pageWidth * 0.6));
    };

    $scope.getSidePanelWidth = function () {
        return  ($scope.hasScroller ? $scope.pageWidth : ($scope.pageWidth * 0.4));
    };


    $scope.getMeetingArticleWidth = function () {
        var width = $scope.responsivePageWidth();
        if ($scope.showMeetingAside) width = width*0.6;
        return width;
    };

    // // @param event
    // $scope.onMeetingScrollMove = function (event) {};
    //
    // // @param event
    // $scope.onMeetingScrollEnd = function (event) {};
    //
    // $scope.onMeetingAfterScrollEnd = function (x, y) {
    //     if ($scope.hasScroller && $scope.meetingSensePanel && $scope.meetingSensePanel.scroll) {
    //         if ($scope.meetingSensePanel.scroll.x > -(100)) {
    //             $scope.scrollXCoord = 0;
    //             a4p.safeApply($scope, function () {
    //                 $scope.updateScroller();
    //             });
    //         }
    //         else if ($scope.meetingSensePanel.scroll.x < ((100) - $scope.pageWidth)) {
    //             $scope.scrollXCoord = -$scope.pageWidth;
    //             a4p.safeApply($scope, function () {
    //                 $scope.updateScroller();
    //             });
    //         }
    //         else {
    //             $scope.scrollXCoord = $scope.meetingSensePanel.scroll.x;
    //         }
    //     }
    // };

    $scope.tapOnLinkedObject = function (item, firstSingleTap) {
        if (firstSingleTap) {
            a4p.safeApply($scope, function () {
                // To let Angular update singleTap status (chevron-right)
            });
            return;
        }
        a4p.safeApply($scope, function () {
            $scope.setActionItem('others', 'side');
            $scope.showDocument(item);
        });
    };

    // @param type
    // @param part is for onePage format, give the part to update
    $scope.setActionItem = function (type, part) {
        $scope.meetingSelectedActionItem = type;
        $scope.actionItem = $scope.actionItems[$scope.meetingSelectedActionItem];
        if ($scope.responsiveIsOnePageFormat())
        {
            //if (part == 'side'){
                $scope.meetingAsidePanel = $scope.actionItem.side;
            //}
            //else {
            //    $scope.meetingAsidePanel = $scope.actionItem.main;
            //}
        }
        else {
            $scope.meetingAsidePanel = $scope.actionItem.side;
            $scope.meetingCurrentPanel = $scope.actionItem.main;
        }

    };

    $scope.editMeetingTitle = function () {
        $scope.itemNameEditable = true;
    };

    $scope.editMeetingPlanTitle = function () {
        $scope.meetingPlanTitleEditable = true;
    };

    $scope.saveItemName = function (value) {

        if (value) {
            $scope.itemNameEditable = false;
            $scope.meetingItem.name = value;
            //$scope.meetingItemName = value;
            //Do it later : $scope.srvData.setAndSaveObject($scope.meetingItem);
        }
        else {
            $scope.itemNameEditable = false;
        }
    };

    $scope.saveMeetingPlanTitle = function (value) {
        if (value) {
            $scope.meetingPlanTitleEditable = false;
            if ($scope.selectedMeetingPlan)
              $scope.selectedMeetingPlan.title = value;
            if ($scope.currentMeetingNote)
              $scope.currentMeetingNote.title = _getPlanTitleForNote($scope.meetingItem, $scope.selectedMeetingPlan);
        }
        else {
            $scope.itemNameEditable = false;
        }
    };

    $scope.toggleMeetingAside = function () {
        $scope.showMeetingAside = !($scope.showMeetingAside);
    };

    $scope.meetingSetReadyForDragObject = function () {
        $scope.showMeetingAside = true;
        $scope.setActionItem('select', 'side');
    };

    var _getPlanTitleForNote = function(parentObject, plan){
        var parentName = srvConfig.getItemName(parentObject);
        //FIXME : event has too long name
        if (parentObject.name) parentName = parentObject.name;
        var title =  parentName + '.'+plan.pos+'.'+plan.title;
        return title;
    };

    // Add a new Plan at the end of the list
    $scope.addMeetingElement = function () {
        var plan = srvData.createObject('Plan', {
            parent_id: $scope.meetingItem.id,
            title: srvLocale.translations.htmlMeetingNoTitle
        });
        plan.pos = $scope.meetingPlans.length;

        //
        var note = {
            'a4p_type' : 'Note',
            'title': _getPlanTitleForNote($scope.meetingItem, plan),
            'description': ''
        };
        var noteObject = $scope.addNewNote(note);

        srvData.newAttachment('Plannee', noteObject, plan);
        srvData.addObject(plan);

        $scope.meetingPlans.push(plan);


        if ($scope.meetingPlans.length == 1) {
          // First note with description
        }

        // Understood ?
        if ($scope.meetingPlans.length > 1)
          $scope.meetingHasBeenUnderstoodByUser = true;

    };

    // Add a new Table in Plans
    $scope.addMeetingTable = function () {
        var bok = false;
        if (!$scope.meetingItem) return bok;

        // Create the plan
        var plan = srvData.createObject('Plan', {
            parent_id: $scope.meetingItem.id,
            title: srvLocale.translations.htmlMeetingPlanTableTitle,
            editor_type:'Table'
        });
        if (plan) {
          bok= true;
          plan.pos = $scope.meetingPlans.length;
        }
        if (!bok) return bok;

        // Create the note
        // var note = {
        //     'a4p_type' : 'Note',
        //     'title': _getPlanTitleForNote($scope.meetingItem, plan),
        //     'description': ''
        // };
        // var noteObject = $scope.addNewNote(note);
        // bok = srvData.newAttachment('Plannee', noteObject, plan);
        // if (!bok) return bok;

        // Create the draw (as document)
        var targetDirPath = 'a4p/c4p/doc';
        var itemName = $scope.meetingItem.name;
        var now = new Date();
        var normalizedParentName = itemName.replace(/ /g, '_');
        var documentInsert = srvData.createObject('Document', {
            name: normalizedParentName + '.' +
                (srvLocale.formatDate(a4pDateParse(a4pDateFormat(now)), 'c4pShortDate')).replace(/\//g, '-') + '.' + 'png',
            body: '',
            length: '0',
            path: targetDirPath,
            description: "Table for " + itemName
        });
        bok = srvData.addAndSaveObject(documentInsert);
        if (bok) bok = srvData.newAttachment('Plannee', documentInsert, plan);
        if (!bok) return bok;


        // Save overall
        bok = srvData.addObject(plan);
        if (bok) $scope.meetingPlans.push(plan);

        return bok;
    };

    // Add a new Plan just after current meeting object selected if any or at the end of the list
    // @param object Object linked to the new Plan via a Plannee object
    // $scope.insertAfterMeetingElement = function (object) {
    //     var plan = srvData.createObject('Plan', {
    //         parent_id: $scope.meetingItem.id,
    //         title: srvLocale.translations.htmlMeetingNoTitle
    //     });
    //     if (($scope.meetingPlans.length === 0) || (!$scope.selectedMeetingPlan)) {
    //         plan.pos = $scope.meetingPlans.length;
    //         srvData.addObject(plan);
    //         $scope.meetingPlans.push(plan);
    //     } else {
    //         plan.pos = $scope.selectedMeetingPlan.pos + 1;
    //         srvData.addObject(plan);
    //         $scope.meetingPlans.splice(plan.pos, 0, plan);
    //         //re-index other plans
    //         for (var i = plan.pos+1; i < $scope.meetingPlans.length; i++) {
    //             $scope.meetingPlans[i].pos = i;
    //         }
    //     }
    //     if (a4p.isDefinedAndNotNull(object)) {
    //         // TODO : object must abide c4p.Model restrictions : object type must be Document/Note/Report
    //         plan.title = srvConfig.getItemName(object);
    //         srvData.newAttachment('Plannee', object, plan);
    //     }
    // };

    $scope.moveMeetingElement = function (plans, old_index, new_index) {
        if (!plans || !plans.length) return;

        if ((old_index >= 0) && (old_index < plans.length)) {
            var plan = plans.splice(old_index, 1)[0];
            // Do not update new_index, because we WANT to insert after it if move down
            // if (new_index > old_index) {
                // Move down, i.e. AFTER new_index object
            //} else {
                // Move up, i.e. BEFORE new_index object
            //}
            if ((new_index >= 0) && (new_index < plans.length)) {
                plans.splice(new_index, 0, plan);
            } else {
                plans.push(plan);
            }
            //re-index elements
            for (var i = 0; i < plans.length; i++) {
                plans[i].pos = i;
            }
        }
    };

    $scope.removeMeetingElement = function (plans, index) {
        if (!plans || !plans.length) return;

        if ((index >= 0) && (index < plans.length)) {
            var plan = plans.splice(index, 1)[0];
            srvData.removeAndSaveObject(plan);// Save now because we do not save removed object upon QUIT
            //re-index elements
            for (var i = index; i < plans.length; i++) {
                plans[i].pos = i;
            }
        }
    };

    $scope.removeMeetingAttendee = function (contactObject) {
        if (!contactObject) return false;

        // Get Attendee of linked to contact
        var attendee = null;
        var attendees = srvData.getTypedDirectLinks($scope.meetingItem, 'attendee', 'Attendee');
        for (i = 0; i < attendees.length; i++){
          if (attendees[i].relation_id.dbid === contactObject.id.dbid) {
              attendee = attendees[i];
              break;
          }
        }

        if (attendee) {
          srvData.removeAndSaveObject(attendee);// Save now because we do not save removed object upon QUIT
          $scope.meetingPopTable(true);
        }
        else return false;

        return true;
    };

    $scope.meetingAddAttendeePopUp = function () {

        var deferred = $q.defer();
        $scope.meetingPopTable(false);
        $scope.doAction('addContacts').then(function (contacts) {

                  //var newAttendee = {};
                  //var newContact = {};
                  if (contacts && contacts.length) {
                      // link as attendee

                      // refresh Table
                      $scope.meetingPopTable(true);
                      a4p.safeApply($scope, function() {
                        deferred.resolve(contacts.length);
                      });
                  }
                  else {
                      a4p.safeApply($scope, function() {
                          deferred.reject();//{error:'htmlMsgShareByEmailPb', log:'cancelled by user'}
                      });
                  }

              // if (a4p.isDefined(result)) {
              //     a4p.safeApply($scope, function () {
              //         for (var c = 0; c < result.length; c++) {
              //             srvData.newAndSaveAttachment('Attendee', result[c], parentObject);
              //         }
              //     });
              // }
        });

        return deferred.promise;

    };


    $scope.meetingEditAttendeePopUp = function (contact) {

      $scope.editObjectDialog(contact,
          function (result) {
              if (a4p.isDefined(result)) {
                  a4p.safeApply($scope, function() {
                      srvData.setAndSaveObject(result);

                  });
              }
          }
      );

      return;
    };

    // @param index : index 0 is up
    $scope.moveUpMeetingElement = function (index) {
        if (index <= 0) {
            return;
        }
        $scope.moveMeetingElement($scope.meetingPlans, index, index - 1);
    };

    // @param index : index max is down
    $scope.moveDownMeetingElement = function (index) {
        if (index >= ($scope.meetingPlans.length - 1)) {
            return;
        }
        $scope.moveMeetingElement($scope.meetingPlans, index, index + 1);
    };

    // @param val
    $scope.setDragMeetingElementIdx = function (val) {
        $scope.dragMeetingElementIdx = val;
    };


    $scope.gotoNextMeetingPlan = function () {
      if (!$scope.meetingPlans.length || $scope.selectedMeetingPlanPos === 0) return;

      $scope.updateMeetingObj($scope.selectedMeetingPlanPos - 1);
    };

    $scope.gotoPreviousMeetingPlan = function () {
        if (!$scope.meetingPlans.length || $scope.meetingPlans.length == ($scope.selectedMeetingPlanPos + 1)) return;

        $scope.updateMeetingObj($scope.selectedMeetingPlanPos + 1);
    };


    $scope.meetingTakePictureObj = function () {
        $scope.doAction('createNewPicture').then(function (obj) {
            a4p.safeApply($scope, function () {
                if (a4p.isDefinedAndNotNull(obj) && $scope.selectedMeetingPlan) {
                    // TODO : obj must abide c4p.Model restrictions : obj type must be Document/Note/Report
                    //$scope.selectedMeetingPlan.title = srvConfig.getItemName(obj);
                    srvData.newAttachment('Plannee', obj, $scope.selectedMeetingPlan);
                    $scope.updateMeetingObj();
                }
            });
        });

    };

    $scope.meetingTakePicture = function () {
        $scope.doAction('createNewPicture');
    };

    // @param meetingObj Plan object to select
    $scope.setMeetingObject = function (pos) {

        var planObj = $scope.meetingPlans[pos];
        if (!planObj) return;

        $scope.selectedMeetingPlan = planObj;
        $scope.selectedMeetingPlanPos = pos;
        $scope.currentMeetingItem = null;
        $scope.currentMeetingNote = null;

        var plannees = srvData.getTypedDirectLinks(planObj, 'plannee', 'Plannee');
        // TODO : reference ALL Document/Note/Report attached to this Plan ?
        for (var i = 0; i < plannees.length; i++) {
          var planneeObj = srvData.getObject(plannees[i].object_id.dbid);
          if (planneeObj && planneeObj.a4p_type == 'Note')
              $scope.currentMeetingNote = planneeObj;
          else if (planneeObj)
              $scope.currentMeetingItem = planneeObj;
        }
    };


    $scope.meetingCreateNewEmail = function() {
        if (!$scope.meetingItem) return;
        a4p.safeApply($scope,function(){
          $scope.meetingLaunchEmail = true;
          $scope.meetingLaunchEmailLoading = true;
        });
    };


    // to launch if mail sent
    $scope.afterMeetingLaunchEmailDone = function() {
        a4p.safeApply($scope,function(){
          $scope.meetingLaunchEmail = false;
          $scope.meetingLaunchEmailLoading = true;
        });
    };

    $scope.afterMeetingLaunchEmailShow = function() {
      $timeout(function() {
            $scope.meetingLaunchEmailLoading = false;
      },400);
    };


    $scope.togglePresentation = function () {
        return;

        // $scope.isPresentationOn = !$scope.isPresentationOn;
        //
        // if ($scope.isPresentationOn) {
        //     $scope.setViewerDocList();
        // }
    };

    // $scope.getMeetingViewMode = function () {
    //     if ($scope.isPresentationOn) {
    //         return 'presentation';
    //     }
    //     if ($scope.selectedMeetingPlan) {
    //         return 'editor';
    //     }
    //     return null;
    // };

    $scope.setViewerDocList = function  () {

        var i;
        $scope.viewerDocList = [];
        for (i=0 ; i < $scope.meetingPlans.length; i++ ) {
            var plannees = srvData.getTypedDirectLinks($scope.meetingPlans[i], 'plannee', 'Plannee');
            for (j = 0; j < plannees.length; j++) {
                $scope.viewerDocList.push(srvData.getObject(plannees[j].object_id.dbid));
            }
            // TODO : add recursive Plans (view code in savePlans() for example) ?
        }
        //function in ctrlViewer scope
        $scope.setDocumentList($scope.viewerDocList);
    };

    $scope.updateMeetingObj = function (newMeetingPlanPos) {

        // if ($scope.selectedMeetingPlan) {
        //     a4p.safeApply($scope, function() {
        //         $scope.setMeetingObject(null);
        //     });
        // }
        //a4p.safeApply($scope, function() {
            //     $scope.editorType = null; //reload ctrl ?
            // });


        a4p.safeApply($scope, function() {
            //$scope.editorType = 'Document';

            if (newMeetingPlanPos || newMeetingPlanPos === 0) $scope.selectedMeetingPlanPos =  newMeetingPlanPos;
            $scope.setMeetingObject($scope.selectedMeetingPlanPos);
            $scope.meetingLoadingSpinner = true;
        });
    };

    $scope.setObjectLinkNav = function (newMeetingObject) {
        if (!$scope.selectedMeetingPlan)
        {
            $scope.setActionItem('others', 'side');
        }
        else {
            $scope.setActionItem('select', 'side');
        }
    };


    $scope.meetingPopTable = function(bOpen) {

        // Refresh Attendees
        var attendees = srvData.getTypedDirectLinks($scope.meetingItem, 'attendee', 'Attendee');
        $scope.meetingContactsAsAttendee = [];
        for (i = 0; i < attendees.length; i++){
          var attendee = attendees[i];
          var removed = srvData.srvSynchroStatus.hasToBeDeleted(attendee);
          var contact = null;
          if (!removed) contact = srvData.getObject(attendee.relation_id.dbid);
          if (contact) $scope.meetingContactsAsAttendee.push(contact);
        }

        // Toggle Table open
        if ($scope.meetingTableIsOpen !== bOpen) {
          $scope.meetingTableIsOpen = !$scope.meetingTableIsOpen;
          $timeout(function(){
              $.popcircle('#pops',
              {
                spacing:'10px',
                type:'full', // full, half, quad
                offset:0,	// 0, 1, 2, 3, 4, 5, 6, 7 or 5.1
                ease:'easeOutElastic',
                time:'slow' // slow, fast, 1000
              });
          },20);
        }
    };

    //---------------
    //  Spinner do init

    $scope.meetingLoadingSpinner = true;
    $scope.afterMeetingSpinnerShow = function() {
        //console.log('Fully shown');
        $timeout(function() {
                $scope.computeMeeting();
                // remove spinner
                $scope.meetingLoadingSpinner = false;
        },400);
    };
    $scope.afterMeetingSpinnerHide = function() {

      // Table is loaded or not
      if ($scope.selectedMeetingPlan.editor_type == 'Table') {
        //$scope.meetingPopTable(true);
        $timeout(function() {
                $scope.meetingPopTable(true);
        },400);
      }
      else {
        $scope.meetingTableIsOpen = false;
      }

    };
    $scope.computeMeeting = function() {

        a4p.InternalLog.log('ctrlMeeting','computeMeeting ');
        $scope.initMeetingElements();
    };



    // INIT
    $scope.initMeetingElements();

}

angular.module('crtl.meeting', []).controller('ctrlMeeting', ctrlMeeting);
//ctrlMeeting.$inject = ['$scope', '$q', '$modal', '$timeout',      'srvData', 'srvConfig', 'srvNav', 'srvLocale', 'srvAnalytics'];
