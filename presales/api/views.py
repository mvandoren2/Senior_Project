
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import HttpResponse
from management.models import *
from .helper import *
from .serializers import *
import json

#Need to fix this
# - Needs to fix POST and fix patch
@csrf_exempt
@api_view(['POST', 'PATCH'])
def getActivity(request):
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
        
        #create a new activity
        newActivity = Activity(opportunity_ID=activity['opportunity_ID'], account_ID = activity['account_ID'], location = activity['location'], activity_Level = activity['activity_Level'], oneDateTime=date1, twoDateTime=date2, threeDateTime=date3, selectedDateTime=sdate, description=activity['description'], status = activity['status'], flag=activity['flag'])
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

        #add activity type
        activity_type = searchActivityType(activity['activity_Type'])
        newActivity.activty_Type = activity_type
        newActivity.save()

        return HttpResponse(json.dumps({'POST working!': 'Nothing to see here!'}), content_type='application/json')
    elif(request.method == 'PATCH'):
        activity = json.loads(request.body)

        return HttpResponse(json.dumps({'PATCH working!': 'Nothing to see here!'}), content_type='application/json')

@csrf_exempt
@api_view(['GET'])
def getActivities(request):
    if(request.GET.get('opportunity_ID') or request.GET.get('account_ID') or request.GET.get('createdByMember') or request.GET.get('members') or request.GET.get('products') or request.GET.get('status') or request.GET.get('flag')):
        #query whatever is passed in
        query = Activity.objects.all()
        new_query = Activity.objects.none()

        if(request.GET.get('opportunity_ID')):
            new_query |= query.filter(opportunity_ID=request.GET.get('opportunity_ID'))
        if(request.GET.get('account_ID')):
            new_query |= query.filter(account_ID=request.GET.get('account_ID'))
        if(request.GET.get('createdByMember')):
            new_query |= query.filter(createdByMember=request.GET.get('createdByMember'))
        if(request.GET.get('members')):
            new_query |= query.filter(members=request.GET.get('members'))
        if(request.GET.get('products')):
            new_query |= query.filter(products=request.GET.get('products'))
        if(request.GET.get('status')):
            new_query |= query.filter(status=request.GET.get('status'))
        if(request.GET.get('flag')):
            new_query |= query.filter(flag=request.GET.get('flag'))

        #serialize the query
        serializer = ActivitySerializer(new_query, many=True)
        return Response(serializer.data)
    else:
        activities = Activity.objects.all()
        serializer = ActivitySerializer(activities, many=True)
        return Response(serializer.data)

@api_view(['GET'])
def getActiveActvivities(request):
    #get all activities with the status of accapt, reschedule, schedule, and request
    activities = Activity.objects.filter(status__in=['Accept', 'Reschedule', 'Schedule', 'Request'])
    serializer = ActivitySerializer(activities, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def getRequestActivities(request):
    activities = Activity.objects.filter(status__in=['Reschedule', 'Request'])
    serializer = ActivitySerializer(activities, many=True)
    return Response(serializer.data)

@csrf_exempt
@api_view(['GET', 'POST'])
def getMembers(request):
    if(request.method == 'GET'):
        # account = request.GET.get('account')
        # opportunity = request.GET.get('opportunity')
        role = request.GET.get('role')

        if(role):
            members = PresalesMember.objects.filter(user_role__name=role)
        else:
            members = PresalesMember.objects.all()

        serializers = MemberSerializer(members, many=True)
        return Response(serializers.data)

    elif(request.method == 'POST'):
        member = json.loads(request.body)

        #get the external_presales_member_ID from member
        memberId = member['external_presales_member_ID']

        #make memberId into an int and in a list
        memberId = [int(memberId)]

        myMember = PresalesMember.objects.get(presales_member_ID=searchMember(memberId)[0])
        myMember.user_role = UserRole.objects.get(name=member['user_role']['name'])
        for prof in member['proficiency']:
            myMember.proficiency.add(Proficiency.objects.get(product__name=prof['product']['name'], level=prof['level']))
        myMember.save()

        return HttpResponse(json.dumps(member), content_type="application/json")

@api_view(['GET'])
def getMember(request, id):
    try:
        print(id)
        member = PresalesMember.objects.filter(external_presales_member_ID=id)
        serializer = MemberSerializer(member, many=True)
        return Response(serializer.data[0])
    except:
        return Response(status=204)

@csrf_exempt
@api_view(['GET', 'POST'])
def getProducts(request):
    if(request.method == 'GET'):
        if(request.GET.get('name')):
            products = Product.objects.filter(name=request.GET.get('name'))
            serializers = ProductSerializer(products, many=True)
            return Response(serializers.data)
        else:
            products = Product.objects.all()
            serializers = ProductSerializer(products, many=True)
            return Response(serializers.data)
    elif(request.method == 'POST'):
        product = json.loads(request.body)
        searchProduct(product)
        return HttpResponse(json.dumps({'POST working!': 'Nothing to see here!'}), content_type='application/json')
    
#----------------------------------------------------------    
# @api_view(['GET']) 
# def getStatus(request):
#     serializer = StatusSerilizer(Status, many=True)
#     return Response(serializer.data)
    
 #--------------------------------------------------------

@csrf_exempt
@api_view(['GET', 'POST'])
def getActivityType(request):
    if(request.method =='GET'):
        if(request.GET.get('name')):
            activity_Type = ActivityType.objects.filter(name=request.Get.get('name'))
            serializer = ActivityTypeSerializer(activity_Type, many=True)
            return Response(serializer.data)
        else:
            activity_Type = ActivityType.objects.all()
            serializer = ActivityTypeSerializer(activity_Type, many=True)
            return Response(serializer.data)
    elif(request.method == 'POST'):
        activity_Type = json.loads(request.body)
        new_activity_Type = ActivityType(name=activity_Type['name'])
        new_activity_Type.save()
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

#Daniel program below
@csrf_exempt
def sendNotification():
    pass