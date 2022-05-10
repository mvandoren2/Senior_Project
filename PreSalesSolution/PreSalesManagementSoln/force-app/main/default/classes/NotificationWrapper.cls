public class NotificationWrapper {
    @AuraEnabled public string activityStatus{ get; set; }
    @AuraEnabled public string opportunityId{ get; set; }
    @AuraEnabled public string activityType{ get; set; }
    @AuraEnabled public string dateLocaleString{ get; set; }
    @AuraEnabled public List <string> team{ get; set; }
    @AuraEnabled public List <string> submittedBy{ get; set;}
    @AuraEnabled public List <string> managers{ get; set;}
}
