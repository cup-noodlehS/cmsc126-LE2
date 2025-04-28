from budgethink.serializers.base_serializer import BaseCategorySerializer, BaseTransactionSerializer, BaseBudgetSerializer
from account.serializers import UserBaseSerializer


class CategorySerializer(BaseCategorySerializer):
    user = UserBaseSerializer(read_only=True)


class TransactionSerializer(BaseTransactionSerializer):
    user = UserBaseSerializer(read_only=True)
    category = BaseCategorySerializer(read_only=True)


class BudgetSerializer(BaseBudgetSerializer):
    user = UserBaseSerializer(read_only=True)
    category = BaseCategorySerializer(read_only=True)


