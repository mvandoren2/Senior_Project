from management.models import *

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
            newProd = Product(external_product_ID=p['external_product_ID'], name=p['name'])
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
        