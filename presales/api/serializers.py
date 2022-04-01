from dataclasses import fields
from rest_framework import serializers
from management.models import *

class MemberNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ('external_member_ID',)

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class ProductName(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ('name',)

class ProficiencySerializer(serializers.ModelSerializer):
    product = ProductName(read_only=True)

    class Meta:
        model = Proficiency
        fields = ('product', 'level')

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRole
        fields = ('name',)

class MemberSerializer(serializers.ModelSerializer):
    user_role = RoleSerializer(many=False)
    proficiency = ProficiencySerializer(many=True)

    class Meta:
        model = Member
        fields = ('external_member_ID', 'user_role', 'proficiency')

class ActivityTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityType
        fields = '__all__'

class UserRolesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRole
        fields = '__all__'        
                
class ActivitySerializer(serializers.ModelSerializer):
    members = MemberSerializer(read_only=True, many=True)
    products = ProductSerializer(read_only=True, many=True)
    createdByMember = MemberSerializer(read_only=True)
    leadMember = MemberSerializer(read_only=True)
    activity_Type = ActivityTypeSerializer(read_only=True)

    class Meta:
        model = Activity
        fields = '__all__'

class NoteSerializer(serializers.ModelSerializer):
    member = MemberNameSerializer(read_only=True)

    class Meta:
        model = Note
        fields = '__all__'

class SimpleActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ('activity_ID', 'opportunity_ID', 'account_ID', 'selectedDateTime', 'status')