from django.shortcuts import render, get_list_or_404
from .models import *
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
import json

@csrf_exempt
@login_required
def dashboard(request):
   myUser = Activity.objects.all()
   print(myUser)

   if(request.method == 'POST'):
      activity = json.loads(request.body)
      print(activity)

   if(request.method == 'GET'):
      activity = list(Activity.objects.values())
      if(activity):
         activity_json = json.dumps(activity, indent=4, sort_keys=True, default=str)
         print(activity_json)
      else:
         activity_json = [{'error': 'No activities found'}]
      
      return HttpResponse(activity_json, content_type='application/json')

   return render(request, 'management/dashboard.html', {'myUser': myUser})