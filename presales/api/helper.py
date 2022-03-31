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
            newMem.save()
            arrM.append(newMem.member_ID)

    return arrM

def searchProduct(products):
    arrP = []
    for p in products:
        #filter by external_presales_member_ID and return the presales_member_ID
        prod = Product.objects.filter(external_product_ID=p['external_product_ID'])
        if(prod):
            arrP.append(prod[0].product_ID)
        else:
            #save the external_presales_member_ID and return the presales_member_ID
            newProd = Product(external_product_ID=p['product_ID'], name=p['name'])
            newProd.save()
            arrP.append(newProd.product_ID)

    return arrP

def searchActivityType(activityType):
    #check to see if the activity name is already in the database
    act = ActivityType.objects.filter(type_ID=activityType)
    if(act):
        return act[0].type_ID
    else:
        print("Oopsie Woopsie! Uwu someone made a fucky wucky!! A wittle fucko boingo! The code monkeys at our headquarters are working VEWY HAWD to fix this!")
    
def searchActivity(activity):
    #search to see if there is a activity with the same opportunity_ID, acount_ID, and date

    activity_type_ID = searchActivityType(activity['activity_Type'])

    request_activity_Type = ActivityType.objects.get(type_ID=activity_type_ID)        

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