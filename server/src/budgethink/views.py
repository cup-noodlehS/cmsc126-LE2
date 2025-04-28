from main.utils import GenericView
from main.permissions import IsAuthenticated

from budgethink.models import Category, Transaction, Budget
from budgethink.serializers.serializer import CategorySerializer, TransactionSerializer, BudgetSerializer


class CategoryView(GenericView):
    serializer_class = CategorySerializer
    queryset = Category.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)


class TransactionView(GenericView):
    serializer_class = TransactionSerializer
    queryset = Transaction.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)


class BudgetView(GenericView):
    serializer_class = BudgetSerializer
    queryset = Budget.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)
