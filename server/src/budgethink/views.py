from main.utils import GenericView
from main.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Q

from budgethink.models import Category, Transaction, Budget
from budgethink.serializers.serializer import (
    CategorySerializer,
    TransactionSerializer,
    BudgetSerializer,
)


class CategoryView(GenericView):
    serializer_class = CategorySerializer
    queryset = Category.objects.all()
    permission_classes = [IsAuthenticated]

    def initialize_queryset(self, request):
        self.queryset = self.queryset.filter(user=self.request.user)
    
    def pre_create(self, request): # only allow 20 categories per user
        if self.queryset.count() >= 20:
            return Response({"error": "You can only have 20 categories"}, status=400)


class TransactionView(GenericView):
    serializer_class = TransactionSerializer
    queryset = Transaction.objects.all()
    permission_classes = [IsAuthenticated]

    def filter_queryset(self, filters, excludes):
        search = filters.pop("search", None)
        if search:
            self.queryset = self.queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        return super().filter_queryset(filters, excludes)

    def dashboard_endpoint(self, request):
        self.initialize_queryset(request)
        months_span = int(request.query_params.get("months_span", 4))
        try:
            income = (
                self.queryset.filter(type="income").aggregate(total=Sum("amount"))[
                    "total"
                ]
                or 0
            )
            expense = (
                self.queryset.filter(type="expense").aggregate(total=Sum("amount"))[
                    "total"
                ]
                or 0
            )
            balance = income - expense

            categories = (
                self.queryset.filter(type="expense")
                .values("category__name")  # Assuming category has a name field
                .annotate(total=Sum("amount"))
            )
            categories = list(categories)

            from django.db.models.functions import TruncMonth
            from django.db.models import Q
            from datetime import datetime, timedelta

            end_date = datetime.now()
            start_date = end_date - timedelta(days=months_span * 30)

            monthly_data = (
                self.queryset.filter(
                    Q(type="income") | Q(type="expense"),
                    transaction_date__gte=start_date,
                    transaction_date__lte=end_date,
                )
                .annotate(month=TruncMonth("transaction_date"))
                .values("month", "type")
                .annotate(total=Sum("amount"))
                .order_by("-month")
            )

            income_vs_expenses = []
            current_month = None
            month_data = {}

            for entry in monthly_data:
                month = entry["month"].strftime("%B")
                if month != current_month:
                    if current_month is not None:
                        income_vs_expenses.append(month_data)
                    current_month = month
                    month_data = {"month": month, "income": 0, "expense": 0}

                if entry["type"] == "income":
                    month_data["income"] = entry["total"]
                else:
                    month_data["expense"] = entry["total"]

            if current_month is not None:
                income_vs_expenses.append(month_data)

            recent_transactions = self.queryset.order_by("-transaction_date")[:10]
            serialized_recent_transactions = self.serializer_class(
                recent_transactions, many=True
            ).data

            data = {
                "income": income,
                "expense": expense,
                "balance": balance,
                "categories": categories,
                "income_vs_expenses": income_vs_expenses,
                "recent_transactions": serialized_recent_transactions,
            }
            return Response(data)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def initialize_queryset(self, request):
        self.queryset = self.queryset.filter(user=self.request.user)


class BudgetView(GenericView):
    serializer_class = BudgetSerializer
    queryset = Budget.objects.all()
    permission_classes = [IsAuthenticated]

    def initialize_queryset(self, request):
        self.queryset = self.queryset.filter(user=self.request.user)

    def filter_queryset(self, filters, excludes):
        month = filters.pop("month", None)
        year = filters.pop("year", None)
        
        if month is not None:
            try:
                month = int(month)
                self.queryset = self.queryset.filter(month=month)
            except (ValueError, TypeError):
                pass
        
        if year is not None:
            try:
                year = int(year)
                self.queryset = self.queryset.filter(year=year)
            except (ValueError, TypeError):
                pass
        
        return super().filter_queryset(filters, excludes)