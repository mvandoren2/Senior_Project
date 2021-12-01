from django.contrib import admin
from django.contrib.auth.models import Group
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import *

class ProspectAdmin(admin.ModelAdmin):
   filter_horizontal = ('products',)

admin.site.site_header = 'Pre-Sales Management Administration'
admin.site.site_title = 'Pre-Sales Management Administration'
admin.site.index_title = 'Welcome Pre-Sales Management Administrators'
admin.site.register(Product)
admin.site.register(Appointment, ProspectAdmin)
admin.site.unregister(Group)