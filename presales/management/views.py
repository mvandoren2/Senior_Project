from django.shortcuts import render, get_list_or_404
from .models import *
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
@login_required
def dashboard(request):
   myUser = Activity.objects.all()
   print(myUser)

   if(request.method == 'POST'):
      activity = json.loads(request.body)
      print(activity["address"]["city"])

   return render(request, 'management/dashboard.html', {'myUser': myUser})