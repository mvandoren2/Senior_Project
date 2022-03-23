from django.urls import path
from . import views

urlpatterns = [
    path('add_activity/', views.addActivity),
    path('add_members_date/', views.addMembersandDate),
    path('get_activity/', views.getActivity),
    path('get_all_products/', views.getallProducts),
    path('member/<id>/', views.getMember),
    path('members/', views.getMembers),
]