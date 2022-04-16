from unicodedata import name
from management.models import *
from datetime import datetime

def searchMember(members):
    arrM = []
    for m in members:
        #filter by external_presales_member_ID and return the presales_member_ID
        mem = Member.objects.filter(external_member_ID=m)
        if(mem):
            arrM.append(mem[0].member_ID)
        else:
            #save the external_presales_member_ID and return the presales_member_ID
            newMem = Member(external_member_ID=m)
            newMem.user_role = UserRole.objects.get(name='Sales Representative')
            newMem.save()
            arrM.append(newMem.member_ID)

    return arrM

def searchProducttoAdd(products):
    arrP = []
    for p in products:
        #filter by external_presales_member_ID and return the presales_member_ID
        prod = Product.objects.filter(external_product_ID=p)
        if(prod):
            arrP.append(prod[0].product_ID)
    return arrP

def searchProducttoCreate(products):
    arrP = []
    for p in products:
        if(Product.objects.filter(name=p['name']).exists()):
            pass
        else:
            #save the external_presales_member_ID and return the presales_member_ID
            newProd = Product(name=p['name'])
            if('external_product_ID' in p):
                newProd.external_product_ID = p['external_product_ID']
            if('active' in p):
                newProd.active = p['active']
            newProd.save()
            for i in range(1,5):
                newProf = Proficiency(product=newProd, level=i)
                newProf.save()
            arrP.append(newProd.product_ID)
    return arrP
    
def searchActivity(activity):
    #search to see if there is a activity with the same opportunity_ID, acount_ID, and date

    request_activity_Type = ActivityType.objects.get(type_ID=activity['activity_Type'])        

    date1 = datetime.fromisoformat(activity['oneDateTime'].split('.')[0] + '+00:00')

    act = Activity.objects.filter(
        opportunity_ID=activity['opportunity_ID'], 
        account_ID = activity['account_ID'], 
        location = activity['location'], 
        activity_Type = request_activity_Type,
        activity_Level = activity['activity_Level'], 
        oneDateTime=date1,
        status = activity['status'], 
        flag=activity['flag']
    )
    if(act):
        return True
    else:
        return False

def searchProficiency(prodLevels):
    arrP = []
    for p in prodLevels:
        #filter proficiencies by product name and level
        name = Product.objects.get(product_ID=p['product_ID'])
        prof = Proficiency.objects.filter(product__name=name, level=p['level'])
        if(prof):
            arrP.append(prof[0].proficiency_ID)
    return arrP

def isWithinAnHour(date1, date2):
    #get abs value of the difference
    diff = abs(date1 - date2)
    #if the difference is less than an hour, return true
    if(diff.seconds < 3600):
        return True
    else:
        return False