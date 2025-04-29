from budgethink.serializers.base_serializer import (
    BaseCategorySerializer,
    BaseTransactionSerializer,
    BaseBudgetSerializer,
)
from account.serializers import UserBaseSerializer
from rest_framework import serializers

class CategorySerializer(BaseCategorySerializer):
    user = UserBaseSerializer(read_only=True)
    transactions_count = serializers.IntegerField(read_only=True)
    income_count = serializers.IntegerField(read_only=True)
    expense_count = serializers.IntegerField(read_only=True)
    total_income = serializers.DecimalField(max_digits=20, decimal_places=2, read_only=True)
    total_expense = serializers.DecimalField(max_digits=20, decimal_places=2, read_only=True)
    total_balance = serializers.DecimalField(max_digits=20, decimal_places=2, read_only=True)


class TransactionSerializer(BaseTransactionSerializer):
    user = UserBaseSerializer(read_only=True)
    category = BaseCategorySerializer(read_only=True)
    formatted_amount = serializers.CharField(read_only=True)


class BudgetSerializer(BaseBudgetSerializer):
    user = UserBaseSerializer(read_only=True)
    category = BaseCategorySerializer(read_only=True)
