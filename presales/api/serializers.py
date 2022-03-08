from rest_framework import serializers
from management.models import *

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
        model = PresalesMember
        fields = ('external_presales_member_ID', 'user_role', 'proficiency')

class ActivitySerializer(serializers.ModelSerializer):
    members = MemberSerializer(read_only=True, many=True)
    products = ProductSerializer(read_only=True, many=True)

    class Meta:
        model = Activity
        fields = '__all__'