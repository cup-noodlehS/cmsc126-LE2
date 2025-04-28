from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from decimal import Decimal
from django.db.models import Sum

User = get_user_model()


class Category(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    hex_color = models.CharField(max_length=7, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="categories")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def transactions_count(self):
        return self.transactions.count()
    
    @property
    def income_count(self):
        return self.transactions.filter(type="income").count()
    
    @property
    def expense_count(self):
        return self.transactions.filter(type="expense").count()

    @property
    def total_income(self):
        return self.transactions.filter(type="income").aggregate(total=Sum("amount"))["total"] or 0

    @property
    def total_expense(self):
        return self.transactions.filter(type="expense").aggregate(total=Sum("amount"))["total"] or 0
    
    @property
    def total_balance(self):
        return self.total_income - self.total_expense

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        unique_together = ["name", "user"]
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.user.username})"

    def clean(self):
        if self.hex_color and not self.hex_color.startswith("#"):
            self.hex_color = f"#{self.hex_color}"


class Transaction(models.Model):
    TRANSACTION_TYPE_CHOICES = [
        ("income", "Income"),
        ("expense", "Expense"),
    ]

    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="transactions"
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="transactions")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    type = models.CharField(
        max_length=10, choices=TRANSACTION_TYPE_CHOICES, default="expense"
    )
    amount = models.DecimalField(
        max_digits=20, decimal_places=2, validators=[MinValueValidator(Decimal("0.01"))]
    )
    transaction_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Transaction"
        verbose_name_plural = "Transactions"
        ordering = ["-transaction_date", "-created_at"]
        indexes = [
            models.Index(fields=["user", "transaction_date"]),
            models.Index(fields=["user", "type"]),
        ]

    def __str__(self):
        return f"{self.title} - {self.amount} ({self.get_type_display()})"

    def get_formatted_amount(self):
        return f"{'+' if self.type == 'income' else '-'}{self.amount}"

    def clean(self):
        if self.category and self.category.user != self.user:
            raise ValueError("Category must belong to the same user as the transaction")


class Budget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="budgets")
    category = models.OneToOneField(
        Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="budgets"
    )
    name = models.CharField(max_length=255)
    amount_limit = models.DecimalField(
        max_digits=20, decimal_places=2, validators=[MinValueValidator(Decimal("0.01"))]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Budget"
        verbose_name_plural = "Budgets"
        ordering = ["-created_at"]
        unique_together = ["user", "name"]
        indexes = [
            models.Index(fields=["user", "category"]),
        ]

    def __str__(self):
        category_name = self.category.name if self.category else "All Categories"
        return f"{self.name} - {self.amount_limit} ({category_name})"

    def save(self, *args, **kwargs):
        if not self.category:
            existing_all_budget = (
                Budget.objects.filter(user=self.user, category=None)
                .exclude(pk=self.pk)
                .exists()
            )
            if existing_all_budget:
                raise ValueError("You can only have one all budget")
        super().save(*args, **kwargs)

    def clean(self):
        if self.category and self.category.user != self.user:
            raise ValueError("Category must belong to the same user as the budget")
