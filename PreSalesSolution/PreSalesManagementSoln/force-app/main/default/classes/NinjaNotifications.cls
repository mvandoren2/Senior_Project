public with sharing class NinjaNotifications {
    public NinjaNotifications() {
        
    }
    
    @AuraEnabled
    public static void SendNinjaNotification(NotificationWrapper activityInfo){
        switch on activityInfo.activityStatus {
            when 'Request' {
                sendRequestNotifications(activityInfo);
            }

            when 'Accept', 'Scheduled' {
                sendAcceptedNotification(activityInfo);
            }

            when 'Assigned' {
                sendAssignedNotification(activityInfo);
            }
        }
        
    }

    private static string getCustomNotificationType() {
        string customNotifName = 'PresalesNinjaNotif';
        
        List <CustomNotificationType> ninjaNotification = new Query('CustomNotificationType')
            .selectField('Id')
            .addConditionEq('CustomNotifTypeName', customNotifName)
            .run();

        return ninjaNotification[0].Id;
    }

    private static void sendNotification(string title, string body, string opportunityId, Set <string> userIds) {
        Messaging.CustomNotification notif = new Messaging.CustomNotification();

        notif.setTitle(title);
        notif.setBody(body);
        notif.setNotificationTypeId(getCustomNotificationType());
        notif.setTargetId(opportunityId);

        notif.send(userIds);
    }

    private static void sendRequestNotifications(NotificationWrapper activityInfo) {
        List <String> opportnityId_list = new List <String>();

        opportnityId_list.add(activityInfo.opportunityId);

        Account opportunityInfo = OpportunityData.getOpportunities(opportnityId_list)[0];
        
        string managerNotifTitle = 'New Presales Activity Requested';
        string managerNotifBody = 'A ' + activityInfo.activityType + 
            ' has been requested for the opportunity: ' + 
            opportunityInfo.Opportunities[0].Name;

        sendNotification(managerNotifTitle, managerNotifBody, activityInfo.opportunityId, new Set <string>(activityInfo.managers));
    }

    private static void sendAcceptedNotification(NotificationWrapper activityInfo) {
        List <String> opportnityId_list = new List <String>();

        opportnityId_list.add(activityInfo.opportunityId);

        Account opportunityInfo = OpportunityData.getOpportunities(opportnityId_list)[0];

        string salesEvent = activityInfo.activityStatus == 'Accept' ? 
            ' was accepted and is pending scheduling ' :
            ' was scheduled for ' + activityInfo.dateLocaleString + ' ';

        string salesNotifTitle = 'Your Presales Activity Request was Accepted';
        string salesNotifBody = 'Your Presales Activity Request for the opportunity: ' + 
            opportunityInfo.Opportunities[0].Name + salesEvent;

        sendNotification(salesNotifTitle, salesNotifBody, activityInfo.opportunityId, new Set <string>(activityInfo.submittedBy));

        string memberEvent = activityInfo.activityStatus == 'Accept' ? '' :
            ' on ' + activityInfo.dateLocaleString + ' local time. ';
        
        string memberNotifTitle = 'New Presales Activity Assigned';
        string memberNotifBody = 'You have been assigned a ' + activityInfo.activityType + 
            ' for the opportunity: ' + opportunityInfo.Opportunities[0].Name + memberEvent;

        sendNotification(memberNotifTitle, memberNotifBody, activityInfo.opportunityId, new Set <string>(activityInfo.team));
    }

    private static void sendAssignedNotification(NotificationWrapper activityInfo) {
        List <String> opportnityId_list = new List <String>();

        opportnityId_list.add(activityInfo.opportunityId);
        
        Account opportunityInfo = OpportunityData.getOpportunities(opportnityId_list)[0];

        string memberEvent = activityInfo.activityStatus == 'Accept' ? '' :
        ' on ' + activityInfo.dateLocaleString + ' local time. ';
        
        string memberNotifTitle = 'New Presales Activity Assigned';
        string memberNotifBody = 'You have been assigned a ' + activityInfo.activityType + 
            ' for the opportunity: ' + opportunityInfo.Opportunities[0].Name + memberEvent;

        sendNotification(memberNotifTitle, memberNotifBody, activityInfo.opportunityId, new Set <string>(activityInfo.team));
    }
}
