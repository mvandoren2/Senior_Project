public with sharing class OpportunityData {
    @AuraEnabled(cacheable=true)
    public static List <Account> OpportunityData(List<String> opportunity_IDs) {
        List<Account> ret = new List<Account>();
        
        List <Account> accounts = 
            new Query('Account')
                .selectField('Name')
                .addSubquery(
                    Query.subquery('Opportunities')
                        .selectFields('Id, Name')
                        .addConditionIn('Id', opportunity_IDs)
                )
                .run();

        for(Account account : accounts) {
            if(account.Opportunities.size() != 0){
                ret.add(account);
            }
        }        

        return ret;
    }   
}
