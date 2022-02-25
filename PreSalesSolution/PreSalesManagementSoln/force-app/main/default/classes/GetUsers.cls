public with sharing class GetUsers {
    @AuraEnabled(cacheable=true)
    public static List<User> getPreSalesTeamMembers(String usrId, String usrRole) {
      
          return [SELECT Id, Name, FullPhotoUrl FROM User];
    }
}
