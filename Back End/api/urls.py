from django.urls import path
from . import views

urlpatterns = [
    #Singleton Activity endpoints
    path('activity/', views.addActivity),
    path('activity/types/', views.getActivityTypes),
    path('activity/<activityID>/', views.getActivity),
    path('activity/note/<noteID>/', views.getActivityNote),
    path('activity/<activityID>/notes/', views.getActivityNotes),
    path('activity/<activityID>/suggested_members/', views.getSuggestedMembers),
    
    #Collection Activity endpoints
    path('activities/', views.getActivities),
    path('activities/current/', views.getCurrentActvivities),
    path('activities/accepted/', views.getAcceptedActivities),
    path('activities/requests/', views.getRequestActivities),
    path('activities/past/', views.getPastActivities),
    
    
    #Singleton and collection Member endpoints
    path('member/<id>/', views.getMember),
    path('member/<id>/activities/', views.getMemberActivities),
    path('members/', views.getMembers),
    path('members/roles/', views.getUserRoles),

    #Collection Product endpoint
    path('products/', views.getProducts),

    #Collect Token endpoint
    path('token/<org>/', views.getToken),
]