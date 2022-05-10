public with sharing class GetNinjaUsers {
    @AuraEnabled(cacheable=true)
    public static List <User> GetNinjaUsers(List <String> user_Ids){
        Query userQuery = new Query('User')
            .selectField('Id')
            .selectField('Name')
            .selectField('FullPhotoUrl')
            .selectField('Email');
            
        if(user_Ids.size() > 0)   
            userQuery.addConditionIn('Id', user_Ids);
            
        return userQuery.run();
    }
}
