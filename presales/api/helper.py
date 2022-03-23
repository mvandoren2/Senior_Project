from management.models import *

def searchMember(members):
    arrM = []
    for m in members:
        #filter by external_presales_member_ID and return the presales_member_ID
        mem = PresalesMember.objects.filter(external_presales_member_ID=m)
        if(mem):
            arrM.append(mem[0].presales_member_ID)
        else:
            #save the external_presales_member_ID and return the presales_member_ID
            newMem = PresalesMember(external_presales_member_ID=m)
            newMem.save()
            arrM.append(newMem.presales_member_ID)

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