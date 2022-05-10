public with sharing class OpportunityData {
    @AuraEnabled
    public static void OpportunityData(){

    }
    
    @AuraEnabled(cacheable=true)
    public static List <Account> OpportunityData(List<String> opportunity_Ids) {
        return getOpportunities(opportunity_Ids);
    }
    
    @AuraEnabled
    public static List <Account> getOpportunities(List<String> opportunity_Ids){
        List<Account> ret = new List<Account>();
        
        Query acctQuery = new Query('Account').selectFields('Id, Name');

        if(opportunity_Ids.size() > 0)
            acctQuery.addSubquery(
                Query.subquery('Opportunities')
                    .selectFields('Id, Name')
                    .addConditionIn('Id', opportunity_Ids)
                );

        else 
            acctQuery.addSubquery(
                Query.subquery('Opportunities')
                    .selectFields('Id, Name')
                );

        List <Account> accounts = acctQuery.run();

        for(Account account : accounts) {
            if(account.Opportunities.size() != 0){
                ret.add(account);
            }
        }        

        return ret;
    }
}
