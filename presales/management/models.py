from itertools import product
from django.db import models

class UserRole(models.Model):
   roles_ID = models.AutoField(primary_key=True)
   name = models.CharField(max_length=50)

   class meta:
      verbose_name_plural = 'User Roles'

   def __str__(self):
      return self.name

class Product(models.Model):
   product_ID = models.AutoField(primary_key=True)
   external_product_ID = models.CharField(max_length=50, blank=True, null=True)
   name = models.CharField(max_length=100)

   class meta:
      verbose_name = 'Product'
      verbose_name_plural = 'Products'

   def __str__(self):
      return self.name

class Proficiency(models.Model):
   proficiency_ID = models.AutoField(primary_key=True)
   product = models.ForeignKey(Product, on_delete=models.CASCADE)
   level = models.IntegerField(default=1)

   class meta:
      verbose_name = 'Proficiency'
      verbose_name_plural = 'Proficiencies'

   def __str__(self):
      return self.product.name + " " + str(self.level)

class PresalesMember(models.Model):
   presales_member_ID = models.AutoField(primary_key=True)
   external_presales_member_ID = models.CharField(max_length=50)
   user_role = models.ForeignKey(UserRole, on_delete=models.CASCADE, blank=True, null=True)
   proficiency = models.ManyToManyField(Proficiency, blank=True)

   class meta:
      verbose_name = 'Presales Member'
      verbose_name_plural = 'Presales Members'

   def __str__(self):
      return str(self.presales_member_ID)
   
class ActivityType(models.Model):
   type_ID = models.AutoField(primary_key=True)   
   name = models.CharField(max_length=50)
   
   class meta:
      verbose_name_plural = 'Activity Type'

   def __str__(self):
      return self.name
   

class Activity(models.Model):
   status_choice = [
      ('Accept', "accept"),
      ('Reschedule', "reschedule"),
      ('Scheduled', "scheduled"),
      ('Request', "request"),
      ('Cancel', "cancel"),
      ('Decline', 'decline'),
      ('Expire', 'expire'),
      ('Complete', 'complete'),
   ]
   
   Activity_level = [
      ('Level 1', 'Level 1: PowerPoint'),
      ('Level 2', 'Level 2: Demo'),
      ('Level 3', 'Level 3: Requirements'),
      ('Level 4', 'Level 4: Demo/Questions'),
   ]

   location_choice = [
      ('Remote', 'remote'),
      ('Onsite', 'onsite'),
   ]
 
   activity_ID = models.AutoField(primary_key=True)
   opportunity_ID = models.CharField(max_length=100)
   account_ID = models.CharField(max_length=100)
   location = models.CharField(max_length = 50, choices = location_choice, default = 'Remote')
   activity_Type = models.ForeignKey(ActivityType, on_delete=models.CASCADE, blank=True, null=True)    
   activity_Level = models.CharField(max_length=50, choices = Activity_level, default = 'Level 1')
   createdByMember = models.ForeignKey(PresalesMember, on_delete=models.CASCADE, blank=True, null=True, related_name='createdByMember')
   members = models.ManyToManyField(PresalesMember, blank=True)
   oneDateTime = models.DateTimeField(blank=True, null=True, help_text = "Year-Month-Day Hour:Minute:Second")
   twoDateTime = models.DateTimeField(blank=True, null=True, help_text = "Year-Month-Day Hour:Minute:Second")
   threeDateTime = models.DateTimeField(blank=True, null=True, help_text = "Year-Month-Day Hour:Minute:Second")
   selectedDateTime = models.DateTimeField(blank=True, null=True, help_text = "Year-Month-Day Hour:Minute:Second")
   products = models.ManyToManyField(Product)
   status = models.CharField(max_length=50, choices = status_choice, default = 'Request')
   flag = models.BooleanField(default=False)

   class meta:
      verbose_name_plural = 'Activities'

   def __str__(self):
      return str(self.activity_ID)

class Note(models.Model):
   note_ID = models.AutoField(primary_key=True)
   activity = models.ForeignKey(Activity, on_delete=models.CASCADE)
   user = models.ForeignKey(UserRole, on_delete=models.CASCADE)
   note_text = models.CharField(max_length=500)

   class meta:
      verbose_name_plural = 'Notes'

   def __str__(self):
      return self.note_text