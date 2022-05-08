from select import select
from time import time
from management.models import *
from django.db.models import Q
from datetime import datetime
from django.utils import timezone

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
            if('user_role' in m):
                newMem.user_role = UserRole.objects.get(name=m['user_role'])
            newMem.user_role = UserRole.objects.get(name='Sales Representative')
            newMem.save()
            arrM.append(newMem.member_ID)

    return arrM

def searchProducttoAdd(products):
    arrP = []
    for p in products:
        prod = Product.objects.filter(product_ID=p)
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

    prods = []
    
    for p in activity['products']:
        prod = Product.objects.get(product_ID=p)
        #if the product exist then add it to a list
        if(prod):
            prods.append(prod)

    act = Activity.objects.filter(
        opportunity_ID=activity['opportunity_ID'], 
        account_ID = activity['account_ID'], 
        location = activity['location'],
        products__in = prods,
        activity_Type = request_activity_Type,
        oneDateTime=date1,
        status = activity['status']
    )
    if(act):
        return True
    else:
        return False

def queryActivities(queries) :
    query = Activity.objects.all()

    if(queries.get('opportunity')):
        query &= query.filter(opportunity_ID=queries.get('opportunity'))
    if(queries.get('account')):
        query &= query.filter(account_ID=queries.get('account'))
    if(queries.get('member')):
        salesforce_user_ID = queries.get('member')

        memberID = Member.objects.get(external_member_ID=salesforce_user_ID).member_ID
        
        query &= query.filter(Q(members__member_ID=memberID) | Q(activeManager=memberID) | Q(createdByMember=memberID))

    if(queries.get('product')):
        query &= query.filter(products=int(queries.get('product')))
    if(queries.get('status')):
        query &= query.filter(status=queries.get('status'))
    if(queries.get('flag')):
        flag_bool = queries.get('flag') == 'true'

        query &= query.filter(flag=flag_bool)
    if(queries.get('activityType')):
        query &= query.filter(activity_Type__name=queries.get('activityType'))

    return query


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

def addData():
    currentTime = timezone.now()

    #create dummby data for userRoles
    userRole = UserRole(name='Sales Representative')
    userRole.save()
    userRole = UserRole(name='Presales Member')
    userRole.save()
    userRole = UserRole(name='Presales Manager')
    userRole.save()
    userRole = UserRole(name='Admin')
    userRole.save()

    #create dummy data for products
    products = [
        {
            'name': 'Product 1',
            'external_product_ID': '1',
            'active': True
        },
        {
            'name': 'Product 2',
            'external_product_ID': '2',
            'active': True
        },
        {
            'name': 'Product 3',
            'external_product_ID': '3',
            'active': False
        }
    ]
    searchProducttoCreate(products)

    #create dummy data for members
    members = Member(
            external_member_ID = 1,
            user_role = UserRole.objects.get(roles_ID=1)
        )
    members.save()
    
    members = Member(
            external_member_ID = 2,
            user_role = UserRole.objects.get(roles_ID=2)
        )
    members.save()
    
    members = Member(
            external_member_ID = 3,
            user_role = UserRole.objects.get(roles_ID=3)
        )
    members.save()
    
    members = Member(
            external_member_ID = 4,
            user_role = UserRole.objects.get(roles_ID=4)
        )
    members.save()

    #create dummy data for activity types
    activityTypes = ActivityType(name='Activity Type 1')
    activityTypes.save()

    #create dummy data for activity
    activities = Activity(
        opportunity_ID=1,
        account_ID=1,
        location='Location 1',
        activity_Type=activityTypes,
        oneDateTime=currentTime,
        status='Request',
        flag=True
    )
    activities.save()

    #create dummy data for note
    notes = Note(
        activity = activities,
        member = Member.objects.get(member_ID=1),
        note_text = 'Note 1',
        note_date = currentTime
    )
    notes.save()

def rescheduleActivity(activity, reschedule):
    #make a new activity with the same information as the old activity
    newActivity = Activity(
        opportunity_ID=activity.opportunity_ID,
        account_ID=activity.account_ID,
        location=activity.location,
        activity_Type=activity.activity_Type,
        activity_Level=activity.activity_Level,
        createdByMember=searchMember(reschedule['createdByMember'])[0],
        members=activity.members,
        leadMember=activity.leadMember,
        activeManager=activity.activeManager,
        oneDateTime=reschedule['oneDateTime'],
        twoDateTime=reschedule['twoDateTime'],
        threeDateTime=reschedule['threeDateTime'],
        selectedDate=None,
        products=activity.products,
        status=reschedule['status'],
        flag=reschedule['flag']
    )
    newActivity.save()

    #get all notes related to the old activity
    notes = Note.objects.filter(activity=activity)
    
    #add the notes to the new activity
    for n in notes:
        newNote = Note(
            activity = newActivity,
            member = n.member,
            note_text = n.note_text,
            note_date = n.note_date
        )
        newNote.save()