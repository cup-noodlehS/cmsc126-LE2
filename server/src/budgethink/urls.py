from django.urls import path
from .views import (
    CategoryView,
    TransactionView,
    BudgetView,
)

urlpatterns = [
    path(
        "categories/",
        CategoryView.as_view({"get": "list", "post": "create"}),
        name="category-list",
    ),
    path(
        "categories/<int:pk>/",
        CategoryView.as_view({"get": "retrieve", "put": "update", "delete": "destroy"}),
        name="category-detail",
    ),
    path(
        "transactions/",
        TransactionView.as_view({"get": "list", "post": "create"}),
        name="transaction-list",
    ),
    path(
        "transactions/dashboard/",
        TransactionView.as_view({"get": "dashboard_endpoint"}),
        name="transaction-dashboard",
    ),
    path(
        "transactions/<int:pk>/",
        TransactionView.as_view(
            {"get": "retrieve", "put": "update", "delete": "destroy"}
        ),
        name="transaction-detail",
    ),
    path(
        "budgets/",
        BudgetView.as_view({"get": "list", "post": "create"}),
        name="budget-list",
    ),
    path(
        "budgets/<int:pk>/",
        BudgetView.as_view({"get": "retrieve", "put": "update", "delete": "destroy"}),
        name="budget-detail",
    ),
]
