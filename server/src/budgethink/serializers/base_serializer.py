from rest_framework import serializers
from budgethink.models import Category, Transaction, Budget


class BaseCategorySerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField()

    class Meta:
        model = Category
        fields = "__all__"


class BaseTransactionSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField()
    category_id = serializers.IntegerField()

    class Meta:
        model = Transaction
        fields = "__all__"


class BaseBudgetSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField()
    category_id = serializers.IntegerField(required=False, allow_null=True)
    type = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Budget
        fields = "__all__"
    
    def get_type(self, obj):
        return 'category' if obj.category else 'total'
    
    def validate(self, data):
        # Custom validation to ensure uniqueness of budgets
        category_id = data.get('category_id')
        month = data.get('month')
        year = data.get('year')
        user_id = data.get('user_id')
        
        # Check if we're creating a total budget and if one already exists
        if not category_id:
            existing = Budget.objects.filter(
                user_id=user_id,
                category_id=None,
                month=month,
                year=year
            )
            
            # If updating, exclude the current instance
            instance = self.instance
            if instance:
                existing = existing.exclude(pk=instance.pk)
                
            if existing.exists():
                raise serializers.ValidationError("A total budget already exists for this month and year")
        
        # Check if we're creating a category budget and if one already exists for this category
        elif category_id:
            existing = Budget.objects.filter(
                user_id=user_id,
                category_id=category_id,
                month=month,
                year=year
            )
            
            # If updating, exclude the current instance
            instance = self.instance
            if instance:
                existing = existing.exclude(pk=instance.pk)
                
            if existing.exists():
                raise serializers.ValidationError("A budget for this category already exists for this month and year")
        
        return data
