from django.db import models

class Product(models.Model):
   product_ID = models.AutoField(primary_key=True)
   name = models.CharField(max_length=100)

   def __str__(self):
      return self.name

class Appointment(models.Model):
   appointment_ID = models.AutoField(primary_key=True)
   opportunityName = models.CharField(max_length=100)
   opportunity_ID = models.CharField(max_length=100)
   account_ID = models.CharField(max_length=100)
   salesmemeber = models.CharField(max_length=100)
   oneDate = models.DateField(blank=True, null=True, help_text = "Year-Month-Day")
   oneTime = models.TimeField(blank=True, null=True, help_text = "Hour:Minute:Second")
   twoDate = models.DateField(blank=True, null=True, help_text = "Year-Month-Day")
   twoTime = models.TimeField(blank=True, null=True, help_text = "Hour:Minute:Second")
   threeDate = models.DateField(blank=True, null=True, help_text = "Year-Month-Day")
   threeTime = models.TimeField(blank=True, null=True, help_text = "Hour:Minute:Second")
   description = models.CharField(blank=True, null=True, max_length=500)
   products = models.ManyToManyField(Product)

   def __str__(self):
      return self.opportunityName