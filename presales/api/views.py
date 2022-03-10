
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

@api_view(['GET'])
def getallMembers(request):
    members = PresalesMember.objects.all()
    if(not members):
        members = {"Members": None}
    serializer = MemberSerializer(members, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def getMember(request, id):
    try:
        print(id)
        member = PresalesMember.objects.filter(external_presales_member_ID=id)
        serializer = MemberSerializer(member, many=True)
        return Response(serializer.data[0])
    except:
        return Response(status=204)

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

        date1 = activity['oneDateTime']
        if(date1):
            date1 = date1.split(".")[0] + "Z"

        date2 = activity['twoDateTime']
        if(date2):
            date2 = date2.split(".")[0] + "Z"

        date3 = activity['threeDateTime']
        if(date3):
            date3 = date3.split(".")[0] + "Z"

        sdate = activity['selectedDateTime']
        if(sdate):
            sdate = sdate.split(".")[0] + "Z"

        print(date1, date2, date3, sdate)
        
        #create a new activity
        newActivity = Activity(opportunity_ID=activity['opportunity_ID'], oneDateTime=date1, twoDateTime=date2, threeDateTime=date3, selectedDateTime=sdate, description=activity['description'], flag=activity['flag'])
        newActivity.save()

        #add presales_member_ID to the activity
        member = activity['createdByMember']
        if(type(member) != list):
            member = [member]
        member = searchMember(member)
        member = member[0]
        newActivity.createdByMember = PresalesMember.objects.get(presales_member_ID=member)
        newActivity.save()

        #add product_ID to the activity
        products = activity['products']
        arrP = searchProduct(products)
        for p in arrP:
            newActivity.products.add(p)

    return HttpResponse(json.dumps({'POST working!': 'Nothing to see here!'}), content_type='application/json')

@csrf_exempt
def addMembersandDate(request):
    if(request.method == 'POST'):
        memberForm = json.loads(request.body)
        updateActivity = Activity.objects.get(activity_ID=memberForm['activity_ID'])
        
        members = memberForm['members']

        #remove members from the update activity if they do not exist in the memberForm
        for m in updateActivity.members.all():
            if(m.external_presales_member_ID not in members):
                updateActivity.members.remove(m)

        arrM = searchMember(members)
        for m in arrM:
            updateActivity.members.add(m)

        #add a selectedDateTime to the activity from membersForm['selectedDateTime']
        selectedDateTime = memberForm['selectedDateTime'].split(".")[0]
        updateActivity.selectedDateTime = selectedDateTime
        updateActivity.save()
    
    return HttpResponse(json.dumps({'POST working!': 'Nothing to see here!'}), content_type='application/json')  