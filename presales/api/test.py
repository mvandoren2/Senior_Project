from tkinter import ACTIVE
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from management.models import *
from .helper import *
from django.utils import timezone

#POSt___________________________________________________________________
class Test (APITestCase):
    
    def test_Post_Products(self):
        addData()
        data ={
            "products":[
                {
                    "name": "Product 4",
                    "external_product_ID": 4
                }
            ]   
        }
        response = self.client.post("/api/products/", data, format = 'json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_Post_Member_Roles(self):
        addData()
        data ={
            "name": "Manager"
        }
        response = self.client.post("/api/members/roles/", data, format = 'json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)   

    def test_Post_Member_ID(self):
        addData()
        data ={
            "user_role": "Presales Manager",
            "proficiency": []
        }
        response = self.client.post("/api/member/5/", data, format = 'json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)   
        
    def test_Post_Activity_ID_Notes(self):
        addData()
        data ={
            "member": '2',
            "note_text": "Testing 01"
        }
        response = self.client.post("/api/activity/1/notes/", data, format = 'json')
        self.assertEqual(response.status_code, status.HTTP_200_OK) 

    def test_Post_Activity_Types(self):
        addData()
        data ={
            "activity_types":[
                {
                    "name": "a"
                }
            ]
        }
        response = self.client.post("/api/activity/types/", data, format = 'json')
        self.assertEqual(response.status_code, status.HTTP_200_OK) 
        
    def test_Post_Activity(self):
        addData()
        currentTime = timezone.now()
        data ={ 
            "createdByMember": '3',  
            "opportunity_ID": '2',
            "account_ID": '2',
            "products": '1',
            "activity_Type": '1',
            "location": 'Remote',
            "oneDateTime": currentTime,
            "twoDateTime": currentTime,
            "threeDateTime": currentTime, 
            "status": 'Request',
            "flag": 'True'
        }
        response = self.client.post("/api/activity/", data, format = 'json')
        self.assertEqual(response.status_code, status.HTTP_200_OK) 

    #PATCH______________________________________________________________________
    def test_Patch_Products(self):
        addData()
        data ={
            "products": [
                {
                    "product_ID": 1,
                    "external_product_ID": "12",
                    "name": "Product 6",
                    "active": 0
                }
            ]
        }
        response = self.client.patch("/api/products/", data, format = 'json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_Patch_Memeber_ID(self):
        addData()
        data ={
            "user_role": 'Presales Manager',
            "proficiency": []
        }
        response = self.client.patch("/api/member/1/", data, format = 'json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_Patch_Activity_Note_ID(self):
        addData()
        data ={
            "note_text": "Testing 02"
        }
        response = self.client.patch("/api/activity/note/1/", data, format = 'json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_Patch_Activity_ID(self):
        addData()
        currentTime = timezone.now()
        data ={
            "status": "Request",
            "selectedDateTime": currentTime
        }
        response = self.client.patch("/api/activity/1/", data, format = 'json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    #GET_________________________________________________________________________
    def test_GET_Products(self):
        addData()
        response = self.client.get("/api/products/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
    def test_GET_Member_Roles(self):
        addData()
        response = self.client.get("/api/members/roles/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
    def test_GET_Members(self):
        addData()
        response = self.client.get("/api/members/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
    def test_GET_Members_ID_Activities(self):
        addData()
        response = self.client.get("/api/member/1/activities/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_GET_Memeber_ID(self):
        addData()
        response = self.client.get("/api/member/1/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_GET_Activities_Past(self):
        addData()
        response = self.client.get("/api/activities/past/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
    def test_GET_Activities_Requests(self):
        addData()
        response = self.client.get("/api/activities/requests/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
    def test_GET_Activities_Accepted(self):
        addData()
        response = self.client.get("/api/activities/accepted/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
    def test_GET_Actitivies_Active(self):
        addData()
        response = self.client.get("/api/activities/active/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
    def test_GET_Activities(self):
        addData()
        response = self.client.get("/api/activities/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_GET_Activity_ID_Sugguested_Memebers(self):
        addData()
        response = self.client.get("/api/activity/1/suggested_members/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
    def test_GET_Activity_ID_Note(self):
        addData()
        response = self.client.get("/api/activity/1/notes/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
            
    def test_GET_Activity_ID_Note(self):
        addData()
        response = self.client.get("/api/activities/current/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
    def test_GET_Actitivity_ID(self):
        addData()
        response = self.client.get("/api/activity/1/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
    def test_GET_Activity_Type(self):
        addData()
        response = self.client.get("/api/activity/types/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
    #DELETE_____________________________________________________________________
    def test_Delete_Activity_Note_ID(self):
        addData()
        response = self.client.delete("/api/activity/note/1/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_Delete_Activity_ID(self):
        addData()
        response = self.client.delete("/api/activity/1/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_Delete_Activity_Types(self):
        addData()
        data = {
            "name": "Activity Type 1"
        }
        response = self.client.delete("/api/activity/types/", data, format = 'json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_Delete_Memeber(self):
        addData()
        response = self.client.delete("/api/member/1/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
