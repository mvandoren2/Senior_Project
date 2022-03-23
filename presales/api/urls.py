from django.urls import path
from . import views

urlpatterns = [
    path('add_members_date/', views.addMembersandDate),
    path('activity/', views.getActivity),
    path('activitys/', views.getActivitys),
    path('activity/active/', views.getActiveActvivitys),
    path('activity/request/', views.getRequestActivitys),
    path('products/', views.getProducts),
    path('member/<id>/', views.getMember),
    path('members/', views.getMembers),
]