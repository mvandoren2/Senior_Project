from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from .models import *

@login_required
def dashboard(request):
   myUser = Activity.objects.all()
   print(myUser)

   return render(request, 'management/dashboard.html', {'myUser': myUser})