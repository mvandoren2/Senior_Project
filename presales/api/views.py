from datetime import datetime
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import HttpResponse
from collections import OrderedDict
from management.models import *
from itertools import chain
from .helper import *
from .serializers import *
import json

results = 5

@csrf_exempt
@api_view(['POST'])
def addActivity(request):
    if(request.method == 'POST'):
        activity = json.loads(request.body)

        #Check if activity already exists
        if(searchActivity(activity)):
            return HttpResponse("Activity already exists", status=409)

        #add activity type
        activity_type_ID = searchActivityType(activity['activity_Type'])

        request_activity_Type = ActivityType.objects.get(type_ID=activity_type_ID)        

        date1 = datetime.fromisoformat(activity['oneDateTime'].split('.')[0] + '+00:00')
        
        #create a new activity
        newActivity = Activity(
            opportunity_ID=activity['opportunity_ID'], 
            account_ID = activity['account_ID'], 
            location = activity['location'], 
            activity_Type = request_activity_Type,
            activity_Level = activity['activity_Level'], 
            oneDateTime=date1,
            status = activity['status'], 
            flag=activity['flag']
        )

        newActivity.save()

        #add presales_member_ID to the activity
        member = activity['createdByMember']
        if(type(member) != list):
            member = [member]
        member = searchMember(member)
        member = member[0]
        newActivity.createdByMember = Member.objects.get(member_ID=member)
        newActivity.save()

        #add product_ID to the activity
        products = activity['products']
        arrP = searchProduct(products)
        for p in arrP:
            newActivity.products.add(p)

        newActivity.save()

        #set selectedDateTime if necessary
        if((not activity['twoDateTime']) and (not activity['twoDateTime'])):
            newActivity.selectedDateTime = date1

        else:
            if(activity['twoDateTime']):
                newActivity.twoDateTime = activity['twoDateTime']

            if(activity['threeDateTime']):
                newActivity.threeDateTime = activity['threeDateTime']

        newActivity.save()

        if('notes' in activity):
            newNote = Note(
                activity=newActivity,
                member=newActivity.createdByMember,
                note_text=activity['notes']
            )

            newNote.save()

        return HttpResponse(json.dumps({'POST working!': 'Nothing to see here!'}), content_type='application/json')

@csrf_exempt
@api_view(['GET', 'PATCH'])    
def getActivity(request, activityID):
    if(request.method == 'GET'):
        try:
            activity = Activity.objects.filter(activity_ID=activityID)
            serializer = ActivitySerializer(activity, many=True)

            return Response(serializer.data[0])
        
        except:
            return Response(status=204)

    elif(request.method == 'PATCH'):
        activity_patch = json.loads(request.body)

        updateActivity = Activity.objects.get(activity_ID=activityID)

        #check to see if the json contains a members
        if('members' in activity_patch):
            members = activity_patch['members']

            #remove members from the update activity if they do not exist in the memberForm
            for m in updateActivity.members.all():
                if(m.external_member_ID not in members):
                    updateActivity.members.remove(m)

            arrM = searchMember(members)
            for m in arrM:
                updateActivity.members.add(m)

        if('leadMember' in activity_patch):
            #remove leadMember from the update activity if they do not exist in the memberForm
            if(activity_patch['leadMember'] == None):
                updateActivity.leadMember = None
            else:
                leadMember = searchMember([activity_patch['leadMember']])[0]
                updateActivity.leadMember = Member.objects.get(external_member_ID=leadMember)
            updateActivity.save()

        if('status' in activity_patch):
            updateActivity.status = activity_patch['status']
            updateActivity.save()

        if('flag' in activity_patch):
            updateActivity.flag = activity_patch['flag']
            updateActivity.save()

        if('oneDateTime' in activity_patch):
            oneDateTime = activity_patch['oneDateTime'].split(".")[0]
            updateActivity.oneDateTime = oneDateTime
            updateActivity.save()

        if('twoDateTime' in activity_patch):
            twoDateTime = activity_patch['twoDateTime'].split(".")[0]
            updateActivity.twoDateTime = twoDateTime
            updateActivity.save()

        if('threeDateTime' in activity_patch):
            threeDateTime = activity_patch['threeDateTime'].split(".")[0]
            updateActivity.threeDateTime = threeDateTime
            updateActivity.save()

        if('selectedDateTime' in activity_patch):
            selectedDateTime = activity_patch['selectedDateTime'].split(".")[0]
            updateActivity.selectedDateTime = selectedDateTime
            updateActivity.save()

        return HttpResponse(json.dumps({'PATCH working!': 'Nothing to see here!'}), content_type='application/json')

@csrf_exempt
@api_view(['GET'])
def getActivities(request):
    query = Activity.objects.all()
    
    if(request.GET.get('opportunity_ID') or request.GET.get('account_ID') or request.GET.get('createdByMember') or request.GET.get('members') or request.GET.get('products') or request.GET.get('status') or request.GET.get('flag')):
        #query whatever is passed in
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
        serializer = ActivitySerializer(query, many=True)

        return Response(serializer.data)

@api_view(['GET'])
def getActiveActvivities(request):
    #get all activities with the status of accapt, reschedule, schedule, and request
    activities = Activity.objects.filter(status__in=['Accept', 'Reschedule', 'Schedule', 'Request'])
    serializer = ActivitySerializer(activities, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def getAcceptedActivities(request):
    activities = Activity.objects.filter(status__in=['Accept', 'Scheduled'])
    serializer = ActivitySerializer(activities, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def getRequestActivities(request):
    activities = Activity.objects.filter(status__in=['Reschedule', 'Request'])
    serializer = ActivitySerializer(activities, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def getPastActivities(request):
    activities = Activity.objects.filter(status__in=['Cancel', 'Expire', 'Complete'])
    serializer = ActivitySerializer(activities, many=True)
    return Response(serializer.data)

# Create an api that will weight the members for suggested members. This will take in account for profiecency, availability, opportunity, and account.
# The date time should be not within the hour.
@csrf_exempt
@api_view(['GET'])
def getSuggestedMembers(request, activityID):
    #get the activity
    activity = Activity.objects.get(activity_ID=activityID)
    oID = activity.opportunity_ID
    aID = activity.account_ID

    prod = []
    for p in activity.products.all():
        prod.append(str(p) + " " + str(activity.activity_Level[-1:]))


    prodW = 3
    oppW = 2
    accW = 1

    allmembers = Member.objects.filter(user_role__name='Presales Member')
    serializers = MemberSerializer(allmembers, many=True)
    members = serializers.data

    for m in members:
        memID = Member.objects.filter(external_member_ID=m['external_member_ID'])

        #get the count of how manny activity the member is appart of
        oAmount = Activity.objects.filter(opportunity_ID=oID, members=memID[0]).count() * oppW
        aAmount = Activity.objects.filter(account_ID=aID, members=memID[0]).count() * accW
        
        #see if the proficiency is the same as the activity
        # prof = list(memID[0].proficiency.all())
        # #make prof into a list
        # # prof = [str(p) for p in prof]
        # for p in prod:
        #     if(p in m['proficiency']):
        #         print(p)
        # print("PROF:", prof)
            
        
        m.update({"Opportunity Weight": oAmount, "Account Weight": aAmount}) #need to add product weight

    return Response(members)

# add in the account look up and opportunity look up as well.
@csrf_exempt
@api_view(['GET', 'POST'])
def getMembers(request):
    if(request.method == 'GET'):
        # account = request.GET.get('account')
        # opportunity = request.GET.get('opportunity')
        role = request.GET.get('role')

        if(role):
            members = Member.objects.filter(user_role__name=role)
        else:
            members = Member.objects.all()

        serializers = MemberSerializer(members, many=True)
        return Response(serializers.data)

    elif(request.method == 'POST'):
        member = json.loads(request.body)

        #get the external_presales_member_ID from member
        memberId = member['member_ID']

        #make memberId into an int and in a list
        memberId = [int(memberId)]

        myMember = Member.objects.get(member_ID=searchMember(memberId)[0])
        myMember.user_role = UserRole.objects.get(name=member['user_role']['name'])
        for prof in member['proficiency']:
            #check to see if proficiency name and level is in the database
            if(Proficiency.objects.filter(name=prof['name'], level=prof['level']).exists()):
                myMember.proficiency.add(Proficiency.objects.get(name=prof['name'], level=prof['level']))
            else:
                #create a new proficiency
                newProf = Proficiency(name=prof['name'], level=prof['level'])
                newProf.save()
                myMember.proficiency.add(newProf)
        myMember.save()

        return HttpResponse(json.dumps(member), content_type="application/json")

@api_view(['GET'])
def getMember(request, id):
    try:
        print(id)
        member = Member.objects.filter(external_member_ID=id)
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

@csrf_exempt
@api_view(['PATCH', 'DELETE'])
def getActivityNote(request, noteID):
    if(request.method == 'DELETE'):
        note = Note.objects.get(note_ID=noteID)
        note.delete()
        return HttpResponse(json.dumps({'DELETE working!': 'Nothing to see here!'}), content_type='application/json')
    elif(request.method == 'PATCH'):
        jForm = json.loads(request.body)
        note = Note.objects.get(note_ID=noteID)
        note.note_text = jForm['note_text']
        note.save()
        return HttpResponse(json.dumps({'PATCH working!': 'Nothing to see here!'}), content_type='application/json')

@csrf_exempt
@api_view(['GET', 'POST'])
def getActivityNotes(request, activityID):
    if(request.method == 'GET'):
        notes = Note.objects.filter(activity=activityID)
        serializers = NoteSerializer(notes, many=True)
        return Response(serializers.data)
    elif(request.method == 'POST'):
        note = json.loads(request.body)
        memberID = searchMember([note['member']])[0]

        act = Activity.objects.get(activity_ID=activityID)
        mem = Member.objects.get(member_ID=memberID)
        newNote = Note(member = mem, note_text = note['note_text'], activity = act)
        newNote.save()
        return HttpResponse(json.dumps(note), content_type="application/json")

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

#----------------------------------------------------------
#Daniel program below
# @csrf_exempt
# def sendNotification():
#     pass
#----------------------------------------------------------
#----------------------------------------------------------    
# @api_view(['GET']) 
# def getStatus(request):
#     serializer = StatusSerilizer(Status, many=True)
#     return Response(serializer.data)
# #--------------------------------------------------------