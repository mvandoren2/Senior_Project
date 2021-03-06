from django.contrib import admin
from django.contrib.auth.models import Group
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import *

class ProductandMemberSel(admin.ModelAdmin):
   filter_horizontal = ('products','members')

class ProficiencySel(admin.ModelAdmin):
   filter_horizontal = ('proficiency',)

class dateTime(admin.ModelAdmin):
   readonly_fields = ('date_time',)

admin.site.site_header = 'Pre-Sales Management Administration'
admin.site.site_title = 'Pre-Sales Management Administration'
admin.site.index_title = 'Welcome Pre-Sales Management Administrators'
admin.site.register(Product)
admin.site.register(Proficiency)
admin.site.register(UserRole)
admin.site.register(Member, ProficiencySel)
admin.site.register(Activity, ProductandMemberSel)
admin.site.register(ActivityType)
admin.site.register(Note)
admin.site.unregister(Group)
