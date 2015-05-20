
/**
 * Meeting pane controller
 *
 * @param $scope
 * @param $modal
 * @param srvData
 * @param srvConfig
 * @param srvNav
 */
function ctrlMeetingEmail($scope, $modal, $timeout, $sce, $q, srvData, srvConfig, srvNav, srvLocale, srvAnalytics, srvLog) {
    'use strict';

    $scope.meetingEmailLoading = true;
    $scope.meetingEmailHasBeenInitialized = false;
    $scope.meetingEmailPlans = [];
    $scope.meetingEmailUserName = '';
    $scope.meetingEmailUserEmail = '';
    $scope.meetingEmailDocIds = [];



    // Functions
    // -------------------

    // Destructor : Handler called when AngularJS destroy this controller
    $scope.$on('$destroy', function (event) {
        //$scope.savePlans();
    });

    // Constructor
    $scope.initMeetingEmail = function () {

        if (!$scope.meetingPlans) return; // depends on ctrlMeeting
        if ($scope.meetingEmailHasBeenInitialized)  return;

        for (var i = 0; i < $scope.meetingPlans.length; i++) {
          var planObj = $scope.meetingPlans[i];
          if (!planObj) continue;
          var currentItemName = '';
          var currentNoteHtml = '';

          var plannees = srvData.getTypedDirectLinks(planObj, 'plannee', 'Plannee');
          for (var j = 0; j < plannees.length; j++) {
            var planneeObj = srvData.getObject(plannees[j].object_id.dbid);
            if (planneeObj && planneeObj.a4p_type == 'Note')
                currentNoteHtml = planneeObj.description.replace(/(?:\r\n|\r|\n)/g, '<br />');
            else if (planneeObj && planneeObj.a4p_type == 'Document') {
                currentItemName = planneeObj.name;
                $scope.meetingEmailDocIds.push(planneeObj.id);
            }
          }

          $scope.meetingEmailPlans.push({
                        title:planObj.title,
                        pos:i,
                        itemName:currentItemName,
                        noteHtml: currentNoteHtml});
        }

        // Get User login : owner of event ?
        var userContact = srvData.getPrincipalUserContact();
        $scope.meetingEmailUserName = srvConfig.getItemName(userContact);
        $scope.meetingEmailUserEmail = srvConfig.getItemPrincipalEmail(userContact);

        $scope.meetingEmailHasBeenInitialized = true;


    };

    $scope.afterMeetingEmailHasBeenInitialized = function(){
      //$timeout(function() {






              $scope.meetingEmailSend().then(function(){

              },function(){

              });
              //$scope.afterMeetingLaunchEmailDone(); //remove email
              //if (bok) alert('Sent !');
      //},10);
    };


    $scope.meetingEmailSend = function() {

        var deferred = $q.defer();
        var promise = deferred.promise;

        if (!$scope.meetingItem) {
          deferred.reject({error:'htmlMsgShareByEmailPb', log:'no meeting Item'});
          return promise;
        }

        //GA : store interested in meeting
        //srvAnalytics.add('Once', 'Interest in Meeting Email');

        // Launch an email with all shared docs in plans to all atteendees

        var postTitle = $scope.meetingItem.name;
        var idsContact = [];
        var emails = [];
        var idsDocument = [];
        var attendees = srvData.getTypedDirectLinks($scope.meetingItem, 'attendee', 'Attendee');
        var i;
        for (i = 0; i < attendees.length; i++) {
            var attendee = attendees[i];
            //if (attendee) idsContact.push(attendees[i].id);
            var contact = null;
            if (attendee && attendee.relation_id && attendee.relation_id.dbid) contact = srvData.getObject(attendee.relation_id.dbid);
            if (contact && contact.email) idsContact.push(contact.id); //emails.push(contact.email);
        }

        var elMail = document.getElementById("c4pMeetingEmailToExport");
        var emailBody = (elMail && elMail.innerHTML) ? elMail.innerHTML : 'email is empty';
        //emailBody = emailBody.replace(/(?:\r\n|\r|\n)/g, '<br />');


        // for (i = 0; i < $scope.meetingPlans.length; i++) {
        //     var plan = $scope.meetingPlans[i];
        //     var plannees = srvData.getTypedDirectLinks(plan, 'plannee', 'Plannee');
        //     var doc = null;
        //     var note = null;
        //     for (var j = 0; j < plannees.length; j++) {
        //       var planneeObj = srvData.getObject(plannees[j].object_id.dbid);
        //       if (planneeObj && planneeObj.a4p_type == 'Note')
        //           note = planneeObj;
        //       else if (planneeObj)
        //           doc = planneeObj;
        //     }
        //
        //     var noteHTML = '';
        //     var titleHTML = '*';
        //     var docTitleHTML = '';
        //     if (doc) {
        //       idsDocument.push(doc.id);
        //       docTitleHTML = srvLocale.translations.htmlTextMeetingDocSeen+' '+doc.name;
        //     }
        //     if (note) noteHTML = note.description;
        //     if (plan) titleHTML = ''+(plan.pos + 1) +' - '+plan.title;
        //
        //     emailBody = emailBody+ ''+titleHTML+'\n\r'+docTitleHTML+'\n\r'+noteHTML+'\n\r';
        // }


        var email = {
            'emailType': 'share',
            'subject': postTitle,
            'body': emailBody,
            'contacts': idsContact,
            'documents': $scope.meetingEmailDocIds,
            'emailsInput': emails // empty because idsContact not empty
        };

        //var ret = $scope.addEmailToParent(null, false, email, $scope.meetingItem);



        $scope.shareByEmailV2($scope.meetingItem, email).then(function(doc){

            deferred.resolve(doc);
            //alert('Sent !');
            srvLog.logSuccess(true,'Email sent','Email sent: '+postTitle);
        },function(error){
            deferred.reject({error:'htmlMsgShareByEmailPb', log:'Not sent'});
            //alert('Not sent !');
            srvLog.logWarning(true,'Email not sent','Email not sent: '+postTitle);
        });

        return promise;
    };




    // INIT
    $scope.initMeetingEmail();

}
ctrlMeetingEmail.$inject = ['$scope', '$modal', '$timeout', '$sce', '$q', 'srvData', 'srvConfig', 'srvNav', 'srvLocale', 'srvAnalytics', 'srvLog'];
