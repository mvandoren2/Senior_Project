
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import HttpResponse
from management.models import *
from .serializers import *
import json

@api_view(['GET'])
def getActivity(request):
    activity = Activity.objects.all()
    serializer = ActivitySerializer(activity, many=True)
    return Response(serializer.data)

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
                

@csrf_exempt
def addActivity(request):
    if(request.method == 'POST'):
        activity = json.loads(request.body)
        
        #create a new activity
        newActivity = Activity(opportunity_ID=activity['opportunity_ID'], oneDateTime=activity['oneDateTime'], twoDateTime=activity['twoDateTime'], threeDateTime=activity['threeDateTime'], selectedDateTime=activity['selectedDateTime'], description=activity['description'], flag=activity['flag'])
        newActivity.save()

        #add presales_member_ID to the activity
        members = activity['members']
        arrM = searchMember(members)
        for m in arrM:
            newActivity.members.add(m)
        
        #add product_ID to the activity
        products = activity['products']
        arrP = searchProduct(products)
        for p in arrP:
            newActivity.products.add(p)

    return HttpResponse(json.dumps({'POST working!': 'Nothing to see here!'}), content_type='application/json')

@csrf_exempt
def addMembers(request):
    if(request.method == 'POST'):
        memberForm = json.loads(request.body)
        updateActivity = Activity.objects.get(activity_ID=memberForm['activity_ID'])
        
        members = memberForm['members']
        arrM = searchMember(members)
        for m in arrM:
            updateActivity.members.add(m)
    
    return HttpResponse(json.dumps({'POST working!': 'Nothing to see here!'}), content_type='application/json')  