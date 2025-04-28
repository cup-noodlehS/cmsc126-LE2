from rest_framework import serializers
from budgethink.models import Category, Transaction, Budget

class BaseCategorySerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField()
    class Meta:
        model = Category
        fields = '__all__'


class BaseTransactionSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField()
    category_id = serializers.IntegerField()
    class Meta:
        model = Transaction
        fields = '__all__'


class BaseBudgetSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField()
    category_id = serializers.IntegerField()
    class Meta:
        model = Budget
        fields = '__all__'
