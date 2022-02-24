from django.urls import path
from . import views

urlpatterns = [
    path('add_activity/', views.addActivity),
    path('add_members/', views.addMembers),
    path('get_activity/', views.getActivity),
]