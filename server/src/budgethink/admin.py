from django.contrib import admin
from .models import Category, Transaction, Budget


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "hex_color", "created_at")
    list_filter = ("user", "created_at")
    search_fields = ("name", "description")
    list_per_page = 20
    ordering = ("name",)
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        (None, {"fields": ("name", "user", "description", "hex_color")}),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "category", "type", "amount", "transaction_date")
    list_filter = ("user", "type", "category", "transaction_date")
    search_fields = ("title", "description")
    list_per_page = 20
    ordering = ("-transaction_date", "-created_at")
    readonly_fields = ("created_at", "updated_at")
    date_hierarchy = "transaction_date"
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "title",
                    "user",
                    "category",
                    "type",
                    "amount",
                    "transaction_date",
                    "description",
                )
            },
        ),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "category", "amount_limit", "created_at")
    list_filter = ("user", "category", "created_at")
    search_fields = ("name",)
    list_per_page = 20
    ordering = ("-created_at",)
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        (None, {"fields": ("name", "user", "category", "amount_limit")}),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )
