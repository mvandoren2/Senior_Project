from django.urls import path
from . import views

urlpatterns = [
    #Singleton Activity endpoints
    path('activity/', views.addActivity),
    path('activity/<activityID>/', views.getActivity),
    path('activity/types/', views.getActivityType),
    path('activity/note/<noteID>/', views.getActivityNote),
    path('activity/<activityID>/notes/', views.getActivityNotes),
    path('activity/<activityID>/suggested_members/', views.getSuggestedMembers),
    
    #Collection Activity endpoints
    path('activities/', views.getActivities),
    path('activities/active/', views.getActiveActvivities),
    path('activities/accepted/', views.getAcceptedActivities),
    path('activities/requests/', views.getRequestActivities),
    path('activities/past/', views.getPastActivities),
    
    #Singleton and collection Member endpoints
    path('member/<id>/', views.getMember),
    path('members/', views.getMembers),

    #Collection Product endpoint
    path('products/', views.getProducts),
]