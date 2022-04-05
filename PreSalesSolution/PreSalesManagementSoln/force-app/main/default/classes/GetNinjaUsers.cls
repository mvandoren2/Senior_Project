public with sharing class GetNinjaUsers {
    @AuraEnabled(cacheable=true)
    public static List <User> GetNinjaUsers(List <String> user_Ids){
        return new Query('User')
            .selectField('Id')
            .selectField('Name')
            .selectField('FullPhotoUrl')
            .addConditionIn('Id', user_Ids)
            .run();
    }
}
