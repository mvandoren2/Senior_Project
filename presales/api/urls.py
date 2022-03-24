from django.urls import path
from . import views

urlpatterns = [
    path('activity/', views.getActivity),
    path('activities/', views.getActivities),
    path('activity/active/', views.getActiveActvivities),
    path('activity/request/', views.getRequestActivities),
    path('products/', views.getProducts),
    path('member/<id>/', views.getMember),
    path('members/', views.getMembers),
]