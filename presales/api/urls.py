from django.urls import path
from . import views

urlpatterns = [
    path('add/', views.addData),
    path('get/', views.getData),
    path('post/', views.postData),
]