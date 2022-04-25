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
            "activity_Type": 1,
            "oneDateTime": currentTime,
            "twoDateTime": currentTime,
            "threeDateTime": currentTime,
            "opportunity_ID": "1",
            "account_ID": "1",
            "status": "Request",
            "flag": False,
            "location": "Onsight",
            "createdByMember": [1],
            "products": [1]
        }
        response = self.client.post("/api/activity/", data, format = 'json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
    #POST 409 CONFLICT___________________________________________________________________
    def test_Post_Member_Roles(self):
        addData()
        data ={
            "name": "Admin"  
        }
        response = self.client.post("/api/members/roles/", data, format = 'json')
        self.assertEqual(response.status_code, 409)   

    def test_Post_Member_ID(self):
        addData()
        data ={
            "external_member_ID": "1",
            "user_role": "Presales Manager",
            "proficiency": []
        }
        response = self.client.post("/api/member/1/", data, format = 'json')
        self.assertEqual(response.status_code, 409)   
        
    def test_Post_Activity_ID_Notes(self):
        addData()
        data ={
            "member": '1',
            "note_text": "Note 1"
        }
        response = self.client.post("/api/activity/1/notes/", data, format = 'json')
        self.assertEqual(response.status_code, 409) 
    
    def test_Post_Activity(self):
        addData()
        currentTime = timezone.now()
        data ={ 
                "activity_Type": '1',
                "oneDateTime": currentTime,
                "twoDateTime": currentTime,
                "threeDateTime": currentTime,
                "opportunity_ID": 1,
                "account_ID": 1,
                "status": "Request",
                "flag": True,
                "location": "Location 1",
                "createdByMember": 1,
                "products": [1]
        }
        response = self.client.post("/api/activity/", data, format = 'json')
        self.assertEqual(response.status_code, 200)
    
        
    #PATCH 404 NOT_FOUND__________________________________________________________________
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
        response = self.client.post("/api/product/", data, format = 'json')
        self.assertEqual(response.status_code, 404)
                
    #POST 405 METHOD_NOT_ALLOWED___________________________________________________________________
    def test_Post_Activity_Types(self):
        addData()
        data ={
            "activity_types":[
                {
                    "type_ID": 1,
                    "name": "a"
                }
            ]
        }
        response = self.client.post("/api/activity/type/", data, format = 'json')
        self.assertEqual(response.status_code,405 ) 
            
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
        
    #PATCH 404 NOT_FOUND__________________________________________________________________
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
        response = self.client.patch("/api/products/'", data, format = 'json')
        self.assertEqual(response.status_code, 404)  
    
    def test_Patch_Memeber_ID(self):
        addData()
        data ={
            "user_role": 'Presales Manager',
            "proficiency": []
        }
        response = self.client.patch("/api/member/1/'", data, format = 'json')
        self.assertEqual(response.status_code, 404)
    
    def test_Patch_Activity_Note_ID(self):
        addData()
        data ={
            "note_text": "Testing 02"
        }
        response = self.client.patch("/api/activity/note/1/'", data, format = 'json')
        self.assertEqual(response.status_code,404)
        
    def test_Patch_Activity_ID(self):
        addData()
        currentTime = timezone.now()
        data ={
            "status": "Request",
            "selectedDateTime": currentTime
        }
        response = self.client.patch("/api/activity/1/'", data, format = 'json')
        self.assertEqual(response.status_code, 404)
    
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
    
    def test_GET_Memeber_ID(self):
        addData()
        response = self.client.get("/api/member/6/")
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
        
    #GET 404 NOT_FOUND__________________________________________________________________
    def test_GET_Products(self):
        addData()
        response = self.client.get("/api/product/")
        self.assertEqual(response.status_code, 404)
        
    def test_GET_Member_Roles(self):
        addData()
        response = self.client.get("/api/members/role/")
        self.assertEqual(response.status_code, 404)
        
    def test_GET_Members(self):
        addData()
        response = self.client.get("/api/member/")
        self.assertEqual(response.status_code, 404)
        
    def test_GET_Members_ID_Activities(self):
        addData()
        response = self.client.get("/api/member/1/actvitie/")
        self.assertEqual(response.status_code, 404)

    def test_GET_Memeber_ID(self):
        addData()
        response = self.client.get("/api/membe/1/")
        self.assertEqual(response.status_code, 404)

    def test_GET_Activities_Past(self):
        addData()
        response = self.client.get("/api/actvities/Past/")
        self.assertEqual(response.status_code, 404)
        
    def test_GET_Activities_Requests(self):
        addData()
        response = self.client.get("/api/actvities/Request/")
        self.assertEqual(response.status_code, 404)
        
    def test_GET_Activities_Accepted(self):
        addData()
        response = self.client.get("/api/actvitiess/accepted/")
        self.assertEqual(response.status_code, 404)
        
    def test_GET_Activities(self):
        addData()
        response = self.client.get("/api/actvties/")
        self.assertEqual(response.status_code, 404)

    def test_GET_Activity_ID_Sugguested_Memebers(self):
        addData()
        response = self.client.get("/api/activity/1/suggestedmember/")
        self.assertEqual(response.status_code, 404)
        
    def test_GET_Activity_ID_Note(self):
        addData()
        response = self.client.get("/api/activity/1/Notes/")
        self.assertEqual(response.status_code, 404)
            
    def test_GET_Activity_ID_Note(self):
        addData()
        response = self.client.get("/api/actvities/Current/")
        self.assertEqual(response.status_code, 404)
        
    def test_GET_Actitivity_ID(self):
        addData()
        response = self.client.get("/api/Actvity/1/")
        self.assertEqual(response.status_code, 404)
    
    #GET 204 NO CONTENT_________________________________________________________
    def test_GET_Activity_Type(self):
        addData()
        response = self.client.get("/api/activity/TYPES/")
        self.assertEqual(response.status_code, 204)
        
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
    
