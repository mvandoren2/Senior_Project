from django.shortcuts import render, get_list_or_404
from .models import *
from django.contrib.auth.decorators import login_required

#make login page a tab

@login_required
def dashboard(request):
   #pull all existing appiontments
   myUser = Appointment.objects.all()
   print(myUser)
   return render(request, 'management/dashboard.html', {'myUser': myUser})