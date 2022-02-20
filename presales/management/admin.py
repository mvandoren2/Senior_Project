from django.contrib import admin
from django.contrib.auth.models import Group
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import *

class ProductandMemberSel(admin.ModelAdmin):
   filter_horizontal = ('products','members',)

class dateTime(admin.ModelAdmin):
   readonly_fields = ('date_time',)

admin.site.site_header = 'Pre-Sales Management Administration'
admin.site.site_title = 'Pre-Sales Management Administration'
admin.site.index_title = 'Welcome Pre-Sales Management Administrators'
admin.site.register(StatusHistory, dateTime)
admin.site.register(Product)
admin.site.register(UserRole)
admin.site.register(PresalesMember)
admin.site.register(Activity, ProductandMemberSel)
admin.site.unregister(Group)