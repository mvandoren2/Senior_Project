from datetime import datetime
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.http import HttpResponse
from collections import OrderedDict
from management.models import *
from itertools import chain
from .serializers import *
from .helper import *
import smtplib
import json

@csrf_exempt
@api_view(['POST'])
def addActivity(request):
    if(request.method == 'POST'):
        activity = json.loads(request.body)

        #Check if activity already exists
        if(searchActivity(activity)):
            return HttpResponse("Activity already exists", status=409)

        #add activity type
        request_activity_Type = ActivityType.objects.get(type_ID=activity['activity_Type'])

        date1 = datetime.fromisoformat(activity['oneDateTime'].split('.')[0] + '+00:00')
        
        #create a new activity
        newActivity = Activity(
            opportunity_ID=activity['opportunity_ID'], 
            account_ID = activity['account_ID'], 
            location = activity['location'], 
            activity_Type = request_activity_Type,
            oneDateTime = date1,
            status = activity['status'], 
            flag=activity['flag']
        )

        newActivity.save()

        #add member_ID to the activity
        member = activity['createdByMember']
        if(type(member) != list):
            member = [member]
        member = searchMember(member)
        member = member[0]
        newActivity.createdByMember = Member.objects.get(member_ID=member)
        newActivity.save()

        #add members to the activity
        if("members" in activity):
            members = activity['members']
            if(type(members) != list):
                members = [members]
            members = searchMember(members)
            for member in members:
                newActivity.members.add(Member.objects.get(member_ID=member))
            newActivity.save()

        #add activeManager to the activity
        if("activeManager" in activity):
            activeManager = activity['activeManager']
            if(type(activeManager) != list):
                activeManager = [activeManager]
            activeManager = searchMember(activeManager)
            for member in activeManager:
                newActivity.activeManager = Member.objects.get(member_ID=member)
            newActivity.save()

        #add product_ID to the activity
        products = activity['products']
        arrP = searchProducttoAdd(products)
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

        return Response(ActivitySerializer(newActivity).data, status=201, content_type='application/json')
        # return HttpResponse(json.dumps({'POST Success': 'True'}), content_type='application/json')

@csrf_exempt
@api_view(['GET', 'PATCH', 'DELETE'])
def getActivity(request, activityID):
    if(request.method == 'GET'):
        try:
            activity = Activity.objects.filter(activity_ID=activityID)
            serializer = ActivitySerializer(activity, many=True)

            return Response(serializer.data[0])
        
        except:
            return Response(status=204)

    elif(request.method == 'DELETE'):
        activity_Delete = Activity.objects.get(activity_ID=activityID)
        activity_Delete.delete()
        return HttpResponse(json.dumps({'DELETE Success': 'True'}), content_type='application/json')

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
            
            updateActivity.save()

        if('activityLevel' in activity_patch):
            updateActivity.activity_Level = activity_patch['activityLevel']
            updateActivity.save()

        if('members' in activity_patch):
            #if the leadMember is not in the memberForm, remove it
            if('leadMember' in activity_patch):
                leadM = Member.objects.get(external_member_ID=activity_patch['leadMember'])
            if(not 'leadMember' in activity_patch or leadM not in updateActivity.members.all()):
                updateActivity.leadMember = None
                updateActivity.save()
            elif('leadMember' in activity_patch):
                member = [activity_patch['leadMember']]
                memberID = searchMember(member)
                updateActivity.leadMember = Member.objects.filter(member_ID=memberID[0])[0]
                updateActivity.save()
        
        if("activeManager" in activity_patch):
            activeManager = activity_patch['activeManager']
            if(type(activeManager) != list):
                activeManager = [activeManager]
            activeManager = searchMember(activeManager)
            for member in activeManager:
                updateActivity.activeManager = Member.objects.get(member_ID=member)
            updateActivity.save()

        if('status' in activity_patch):
            updateActivity.status = activity_patch['status']
            updateActivity.save()

        if('flag' in activity_patch):
            updateActivity.flag = activity_patch['flag']
            updateActivity.save()

        if('oneDateTime' in activity_patch):
            if(activity_patch['oneDateTime'] != None):
                oneDateTime = datetime.fromisoformat(activity_patch['oneDateTime'].split('.')[0] + '+00:00')
                updateActivity.oneDateTime = oneDateTime
                updateActivity.save()
            elif(activity_patch['oneDateTime'] == None):
                updateActivity.oneDateTime = None
                updateActivity.save()

        if('twoDateTime' in activity_patch):
            if(activity_patch['twoDateTime'] != None):
                twoDateTime = datetime.fromisoformat(activity_patch['twoDateTime'].split('.')[0] + '+00:00')
                updateActivity.twoDateTime = twoDateTime
                updateActivity.save()
            elif(activity_patch['twoDateTime'] == None):
                updateActivity.twoDateTime = None
                updateActivity.save()

        if('threeDateTime' in activity_patch):
            if(activity_patch['threeDateTime'] != None):
                threeDateTime = datetime.fromisoformat(activity_patch['threeDateTime'].split('.')[0] + '+00:00')
                updateActivity.threeDateTime = threeDateTime
                updateActivity.save()
            elif(activity_patch['threeDateTime'] == None):
                updateActivity.threeDateTime = None
                updateActivity.save()

        if('selectedDateTime' in activity_patch):
            if(activity_patch['selectedDateTime'] != None):
                selectedDateTime = datetime.fromisoformat(activity_patch['selectedDateTime'].split('.')[0] + '+00:00')
                updateActivity.selectedDateTime = selectedDateTime
                updateActivity.save()
            elif(activity_patch['selectedDateTime'] == None):
                updateActivity.selectedDateTime = None
                updateActivity.save()

        return HttpResponse(json.dumps({'PATCH Success': 'True'}), content_type='application/json')

@csrf_exempt
@api_view(['GET','POST', 'DELETE'])
def getActivityTypes(request):
    if(request.method =='GET'):
        activity_Type = ActivityType.objects.all()
        serializer = ActivityTypeSerializer(activity_Type, many=True)
        return Response(serializer.data)

    elif(request.method == 'POST'):
        activity_Type = json.loads(request.body)
        for a in activity_Type["activity_types"]:
            if(ActivityType.objects.filter(name=a['name']).exists()):
                pass
            else:
                new_activity_Type = ActivityType(name=a['name'])
                new_activity_Type.save()
        return HttpResponse(json.dumps({'POST Success': 'True'}), content_type='application/json')

    elif(request.method == 'DELETE'):
        activity_Type = json.loads(request.body)
        activity_Type = ActivityType.objects.get(name=activity_Type['name'])
        activity_Type.delete()
        return HttpResponse(json.dumps({'DELETE Success': 'True'}), content_type='application/json')
            
@api_view(['GET'])
def getActivities(request):
    activities = queryActivities(request.GET)

    serializer = ActivitySerializer(activities, many=True)

    return Response(serializer.data)

@api_view(['GET'])
def getCurrentActvivities(request):
    #get all activities with the status of accapt, reschedule, schedule, and request
    activities = queryActivities(request.GET)
    
    activities &= activities.filter(status__in=['Accept', 'Reschedule', 'Scheduled', 'Request'])    

    serializer = ActivitySerializer(activities, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def getAcceptedActivities(request):
    activities = queryActivities(request.GET)
    
    activities = activities.filter(status__in=['Accept', 'Scheduled'])
    serializer = ActivitySerializer(activities, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def getRequestActivities(request):
    activities = queryActivities(request.GET)
    
    activities = activities.filter(status__in=['Reschedule', 'Request'])
    serializer = ActivitySerializer(activities, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def getPastActivities(request):
    activities = queryActivities(request.GET)
    
    activities = activities.filter(status__in=['Cancel', 'Expire', 'Complete'])
    serializer = ActivitySerializer(activities, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def getSuggestedMembers(request, activityID):
    #get the activity
    if(activityID == -1):
        activity = json.loads(request.body)
        oID = activity['opportunity_ID']
        aID = activity['activity_ID']
        date1 = activity['oneDateTime']

        if("twoDateTime" in activity):
            date2 = activity["twoDateTime"]
        else:
            date2 = None
        if("threeDateTime" in activity):
            date3 = activity["threeDateTime"]
        else:
            date3 = None

        prod = []
        prods = searchProducttoAdd(activity['products'])
        for p in prods:
            prod.append(str(p))

    else:
        activity = Activity.objects.get(activity_ID=activityID)
        oID = activity.opportunity_ID
        aID = activity.account_ID
        date1 = activity.oneDateTime
        if(activity.twoDateTime != None):
            date2 = activity.twoDateTime
        else:
            date2 = None
        if(activity.threeDateTime != None):
            date3 = activity.threeDateTime
        else:
            date3 = None

        prod = []
        for p in activity.products.all():
            prod.append(str(p))

    if(len(prod) == 0):
        prodW = 0
    else:
        prodW = .25 / len(prod)

    avaW = .25
    oppW = .3
    accW = .2
    total = 0

    allmembers = Member.objects.filter(user_role__name='Presales Member')
    serializers = MemberSerializer(allmembers, many=True)
    members = serializers.data

    for m in members:
        aS = False
        avaAmount = avaW
        memID = Member.objects.filter(external_member_ID=m['external_member_ID'])

        #get all activity that the member is assigned to that have the status of accept, reschedule, or schedule
        memAct = Activity.objects.filter(
            members=memID[0], 
            status__in=['Request', 'Accept', 'Reschedule', 'Schedule']
        )

        aList = []

        #then see if any of the oneDateTime is within the hour of this activity
        for a in memAct:
            if(str(a) != str(activityID) and a.selectedDateTime != None):
                if(isWithinAnHour(a.selectedDateTime, date1)):
                    #add just the activity ID to aList
                    aList.append(a.activity_ID)
                    avaAmount = 0
                    aS = True
                if(date2):
                    if(isWithinAnHour(a.selectedDateTime, date2)):
                        aList.append(a.activity_ID)
                        avaAmount = 0
                        aS = True
                if(date3):
                    if(isWithinAnHour(a.selectedDateTime, date3)):
                        aList.append(a.activity_ID)
                        avaAmount = 0
                        aS = True

        aList = Activity.objects.filter(activity_ID__in=aList)

        if(avaAmount == 0):
            conflicts = SimpleActivitySerializer(aList, many=True).data
            m.update({'Conflicts': conflicts})

        #get the count of how many activity the member is appart of
        oAmount = Activity.objects.filter(opportunity_ID=oID, members=memID[0]).count()
        if(oAmount > 0):
            oAmount = oppW
        aAmount = Activity.objects.filter(account_ID=aID, members=memID[0]).count()
        if(aAmount > 0):
            aAmount = accW
        pAmount = 0
        
        #see if the proficiency is the same as the activity
        prof = list(memID[0].proficiency.all())

        #make prof into a list
        prof = [str(p)[:-2] for p in prof]

        total = 0
        for p in prof:
            if(p in prod):
                total += 1
                pAmount += prodW
        
        total = oAmount + aAmount + pAmount + avaAmount
        
        m.update(
        {
            "Conflict Status": aS,
            "Opportunity Weight": oAmount, 
            "Account Weight": aAmount, 
            "Product Weight": pAmount, 
            "Availablity": avaAmount, 
            "Total Percentage": total
        })

    #sort the members by the weight
    members = sorted(
        members, 
        key=lambda k: k['Opportunity Weight'] + k['Account Weight'] + k['Product Weight'] + k['Availablity'] + k['Total Percentage'], 
        reverse=True
    )

    #remove all members that have a product weight of 0
    members = [m for m in members if m['Product Weight'] != 0]

    return Response(members)

# add in the account look up and opportunity look up as well.
@api_view(['GET'])
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

@csrf_exempt
@api_view(['GET', 'DELETE', 'POST', 'PATCH'])
def getMember(request, id):
    if(request.method == 'POST'):
        data = request.data

        if(Member.objects.filter(external_member_ID=id).exists()):
            return HttpResponse("Member already exists", status=409)
        
        #get the role ID
        role = UserRole.objects.get(name=data['user_role'])
        #create the memeber
        member = Member(
            external_member_ID = id,
            user_role = role,
        )
        member.save()

        if("proficiency" in data):
            #get the proficiency ID's
            prof = searchProficiency(data['proficiency'])
            
            for p in prof:
                member.proficiency.add(p)
                member.save()

        return HttpResponse(json.dumps({'POST Success': 'True'}), content_type='application/json')

    elif(request.method == 'GET'):
        member = searchMember([id])[0]
        member = Member.objects.filter(member_ID=member)
        serializer = MemberSerializer(member, many=True)
        return Response(serializer.data[0])

    elif(request.method == 'DELETE'):
        member = Member.objects.get(external_member_ID=id)
        member.delete()
        return HttpResponse(json.dumps({'DELETE Success': 'True'}), content_type='application/json')

    elif(request.method == 'PATCH'):
        data = request.data
        
        #get the member
        member = Member.objects.get(external_member_ID=id)

        # proficiencies to accept json object array
        if("proficiency" in data):
            #get the proficiency ID's
            prof = searchProficiency(data['proficiency'])
    
            for p in prof:
                member.proficiency.add(p)
                member.save()

            for p in member.proficiency.all().values_list('proficiency_ID', flat=True):
                if(p not in prof):
                    member.proficiency.remove(p)
                    member.save()

        if("user_role" in data):
            #get the role ID
            role = UserRole.objects.get(name=data['user_role'])
            member.user_role = role
            member.save()

        return HttpResponse(json.dumps({'PATCH Success': 'True'}), content_type='application/json')

@api_view(['GET'])
def getMemberActivities(request, id):
    memID = Member.objects.get(external_member_ID=id)
    actsM = Activity.objects.filter(members=memID)
    actsL = Activity.objects.filter(createdByMember=memID)
    actsMa = Activity.objects.filter(activeManager=memID)
    actsLm = Activity.objects.filter(leadMember=memID)
    acts = set(actsM | actsL | actsMa | actsLm)

    #get the member
    memberS = MemberSerializer(memID, many=False).data

    serializers = ActivitySerializer(acts, many=True).data

    response = {
        "Member": memberS,
        "Activities": serializers
    }
    

    return Response(response)

@csrf_exempt
@api_view(['GET', 'POST', 'PATCH', 'DELETE'])
def getProducts(request):
    if(request.method == 'GET'):
        if(request.GET.get('active')):
            products = Product.objects.filter(active=request.GET.get('active'))
            serializers = ProductSerializer(products, many=True)
            return Response(serializers.data)
        else:
            products = Product.objects.all()
            serializers = ProductSerializer(products, many=True)
            return Response(serializers.data)
    elif(request.method == 'POST'):
        product = json.loads(request.body)
        
        searchProducttoCreate(product["products"])
        return HttpResponse(json.dumps({'POST Success': 'True'}), content_type='application/json')
    elif(request.method == 'PATCH'):
        data = request.data
        for p in data["products"]:
            product = Product.objects.get(product_ID=p['product_ID'])
            if("name" in p):
                product.name = p['name']
                product.save()
            if("external_product_ID" in p):
                product.external_product_ID = p['external_product_ID']
                product.save()
            if("active" in p):
                product.active = p['active']
                product.save()
        return HttpResponse(json.dumps({'PATCH Success': 'True'}), content_type='application/json')
    elif(request.method == 'DELETE'):
        data = request.data
        product = Product.objects.get(product_ID=data['product_ID'])
        product.delete()
        return HttpResponse(json.dumps({'DELETE Success': 'True'}), content_type='application/json')

@csrf_exempt
@api_view(['PATCH', 'DELETE'])
def getActivityNote(request, noteID):
    if(request.method == 'DELETE'):
        note = Note.objects.get(note_ID=noteID)
        note.delete()
        return HttpResponse(json.dumps({'DELETE Success': 'True'}), content_type='application/json')
    elif(request.method == 'PATCH'):
        jForm = json.loads(request.body)
        note = Note.objects.get(note_ID=noteID)
        note.note_text = jForm['note_text']
        note.save()
        return HttpResponse(json.dumps({'PATCH Success': 'True'}), content_type='application/json')

@csrf_exempt
@api_view(['GET', 'POST'])
def getActivityNotes(request, activityID):
    if(request.method == 'GET'):
        notes = Note.objects.filter(activity=activityID)
        serializers = NoteSerializer(notes, many=True)
        return Response(serializers.data)
    elif(request.method == 'POST'):
        note = json.loads(request.body)

        if(Note.objects.filter(activity=activityID, note_text=note['note_text']).exists()):
            return HttpResponse("Note already exists", status=409)
        
        memberID = searchMember([note['member']])[0]

        act = Activity.objects.get(activity_ID=activityID)
        mem = Member.objects.get(member_ID=memberID)
        newNote = Note(member = mem, note_text = note['note_text'], activity = act)
        newNote.save()
        return HttpResponse(json.dumps(note), content_type="application/json")

@csrf_exempt
@api_view(['GET', 'POST'])
def getUserRoles(request):
    if(request.method =='GET'):
        user_roles = UserRole.objects.all()
        serializer = UserRolesSerializer(user_roles, many=True)
        return Response(serializer.data)
    elif(request.method == 'POST'):
        user_role = json.loads(request.body)
        if(UserRole.objects.filter(name=user_role['name']).exists()):
            return HttpResponse("User role already exists", status=409)
        new_user_role = UserRole(name=user_role['name'])
        new_user_role.save()
        return HttpResponse(json.dumps({'POST Success': 'True'}), content_type='application/json')

def getToken(request, org):
    if(request.method == 'GET'):
        #get the org from the user
        org = User.objects.get(username=org)
        token = str(Token.objects.get(user=org))        
        return HttpResponse(json.dumps({'Token': token}), content_type='application/json')