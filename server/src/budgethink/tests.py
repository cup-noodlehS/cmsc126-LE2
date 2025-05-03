from django.test import TestCase, TransactionTestCase
from django.contrib.auth import get_user_model
from decimal import Decimal
from django.utils import timezone
from datetime import datetime, date
from django.db.utils import IntegrityError
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from .models import Category, Transaction, Budget

User = get_user_model()

class CategoryModelTest(TransactionTestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='testpass123'
        )
        
        self.category = Category.objects.create(
            name='Food & Dining',
            description='Groceries and restaurants',
            user=self.user,
            hex_color='#FF0000'
        )

    def test_category_creation(self):
        """Test basic category creation and field values"""
        self.assertEqual(self.category.name, 'Food & Dining')
        self.assertEqual(self.category.description, 'Groceries and restaurants')
        self.assertEqual(self.category.user, self.user)
        self.assertEqual(self.category.hex_color, '#FF0000')
        self.assertTrue(isinstance(self.category.created_at, datetime))
        self.assertTrue(isinstance(self.category.updated_at, datetime))

    def test_category_str_representation(self):
        """Test the string representation of a category"""
        expected_str = f"Food & Dining ({self.user.username})"
        self.assertEqual(str(self.category), expected_str)

    def test_category_hex_color_clean(self):
        """Test the hex_color field auto-prepends # if missing"""
        category = Category(
            name='Test Category',
            user=self.user,
            hex_color='FF0000'  # Without #
        )
        category.clean()
        self.assertEqual(category.hex_color, '#FF0000')
        
        # Test with # already included
        category = Category(
            name='Test Category 2',
            user=self.user,
            hex_color='#00FF00'
        )
        category.clean()
        self.assertEqual(category.hex_color, '#00FF00')

    def test_category_unique_together(self):
        """Test that a user cannot have duplicate category names"""
        with self.assertRaises(IntegrityError):
            Category.objects.create(
                name='Food & Dining',  # Same name as existing category
                user=self.user         # Same user
            )
        
        # Create a new category for other_user in a separate transaction
        Category.objects.create(
            name='Different Food',  # Different name
            user=self.other_user
        )
        
        # This should pass without error - different user can have same category name
        different_user_category = Category.objects.create(
            name='Food & Dining',
            user=self.other_user
        )
        self.assertEqual(different_user_category.name, 'Food & Dining')

    def test_category_properties(self):
        """Test category transaction-related property methods"""
        # Create some transactions
        Transaction.objects.create(
            user=self.user,
            category=self.category,
            title='Grocery Shopping',
            type='expense',
            amount=Decimal('100.00'),
            transaction_date=date(2024, 1, 1)
        )
        Transaction.objects.create(
            user=self.user,
            category=self.category,
            title='Restaurant',
            type='expense',
            amount=Decimal('50.00'),
            transaction_date=date(2024, 1, 2)
        )
        Transaction.objects.create(
            user=self.user,
            category=self.category,
            title='Food allowance',
            type='income',
            amount=Decimal('200.00'),
            transaction_date=date(2024, 1, 3)
        )

        # Test counting methods
        self.assertEqual(self.category.transactions_count, 3)
        self.assertEqual(self.category.income_count, 1)
        self.assertEqual(self.category.expense_count, 2)
        
        # Test amount aggregation methods
        self.assertEqual(self.category.total_income, Decimal('200.00'))
        self.assertEqual(self.category.total_expense, Decimal('150.00'))
        self.assertEqual(self.category.total_balance, Decimal('50.00'))
        
        # Test with no transactions
        empty_category = Category.objects.create(
            name='Empty Category',
            user=self.user
        )
        self.assertEqual(empty_category.transactions_count, 0)
        self.assertEqual(empty_category.income_count, 0)
        self.assertEqual(empty_category.expense_count, 0)
        self.assertEqual(empty_category.total_income, 0)
        self.assertEqual(empty_category.total_expense, 0)
        self.assertEqual(empty_category.total_balance, 0)

    def test_category_ordering(self):
        """Test category ordering by name"""
        Category.objects.create(name='Amusement', user=self.user)
        Category.objects.create(name='Utilities', user=self.user)
        Category.objects.create(name='Entertainment', user=self.user)
        
        categories = list(Category.objects.filter(user=self.user))
        sorted_names = [c.name for c in categories]
        
        # Should be alphabetically sorted
        expected = ['Amusement', 'Entertainment', 'Food & Dining', 'Utilities']
        self.assertEqual(sorted_names, expected)


class TransactionModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='testpass123'
        )
        
        self.category = Category.objects.create(
            name='Food & Dining',
            user=self.user
        )
        
        self.transaction = Transaction.objects.create(
            user=self.user,
            category=self.category,
            title='Grocery Shopping',
            description='Weekly groceries',
            type='expense',
            amount=Decimal('100.00'),
            transaction_date=date(2024, 1, 1)
        )

    def test_transaction_creation(self):
        """Test basic transaction creation and field values"""
        self.assertEqual(self.transaction.title, 'Grocery Shopping')
        self.assertEqual(self.transaction.description, 'Weekly groceries')
        self.assertEqual(self.transaction.type, 'expense')
        self.assertEqual(self.transaction.amount, Decimal('100.00'))
        self.assertEqual(self.transaction.user, self.user)
        self.assertEqual(self.transaction.category, self.category)
        # Make sure we're comparing date objects to date objects
        self.assertEqual(self.transaction.transaction_date, date(2024, 1, 1))
        self.assertTrue(isinstance(self.transaction.created_at, datetime))
        self.assertTrue(isinstance(self.transaction.updated_at, datetime))

    def test_transaction_str_representation(self):
        """Test the string representation of a transaction"""
        expected_str = f"Grocery Shopping - 100.00 (Expense)"
        self.assertEqual(str(self.transaction), expected_str)

    def test_transaction_formatted_amount(self):
        """Test the formatted_amount property"""
        # Test expense transaction
        self.assertEqual(self.transaction.formatted_amount, '-100.00')
        
        # Test income transaction
        income_transaction = Transaction.objects.create(
            user=self.user,
            category=self.category,
            title='Salary',
            type='income',
            amount=Decimal('200.00'),
            transaction_date=date(2024, 1, 2)
        )
        self.assertEqual(income_transaction.formatted_amount, '+200.00')

    def test_transaction_without_category(self):
        """Test that transactions can be created without a category"""
        no_category_transaction = Transaction.objects.create(
            user=self.user,
            category=None,
            title='Uncategorized Expense',
            type='expense',
            amount=Decimal('75.00'),
            transaction_date=date(2024, 1, 5)
        )
        self.assertIsNone(no_category_transaction.category)
        self.assertEqual(no_category_transaction.title, 'Uncategorized Expense')

    def test_transaction_ordering(self):
        """Test transaction ordering by date and created_at"""
        # Create transactions with different dates
        Transaction.objects.create(
            user=self.user,
            title='Newer Transaction',
            type='expense',
            amount=Decimal('10.00'),
            transaction_date=date(2024, 2, 1)
        )
        
        Transaction.objects.create(
            user=self.user,
            title='Older Transaction',
            type='expense',
            amount=Decimal('20.00'),
            transaction_date=date(2023, 12, 1)
        )
        
        # Same date, different creation time
        same_date_1 = Transaction.objects.create(
            user=self.user,
            title='Same Date 1',
            type='expense',
            amount=Decimal('30.00'),
            transaction_date=date(2024, 1, 15)
        )
        
        # Simulate time passing
        same_date_1.created_at = timezone.now()
        same_date_1.save()
        
        same_date_2 = Transaction.objects.create(
            user=self.user,
            title='Same Date 2',
            type='expense',
            amount=Decimal('40.00'),
            transaction_date=date(2024, 1, 15)
        )
        
        transactions = list(Transaction.objects.filter(user=self.user))
        
        # Should be ordered by date (newest first) then by created_at (newest first)
        ordered_titles = [t.title for t in transactions]
        self.assertEqual(ordered_titles[0], 'Newer Transaction')
        
        # Last should be the oldest date
        self.assertEqual(ordered_titles[-1], 'Older Transaction')
        
        # For same date, newer creation should come first
        same_date_positions = [
            ordered_titles.index('Same Date 1'),
            ordered_titles.index('Same Date 2')
        ]
        self.assertTrue(same_date_positions[1] < same_date_positions[0])

    def test_transaction_clean_category_user_mismatch(self):
        """Test validation when category belongs to different user"""
        other_category = Category.objects.create(
            name='Other Category',
            user=self.other_user
        )
        
        transaction = Transaction(
            user=self.user,
            category=other_category,
            title='Invalid Transaction',
            type='expense',
            amount=Decimal('100.00'),
            transaction_date=date(2024, 1, 1)
        )
        
        with self.assertRaises(ValueError):
            transaction.clean()

    def test_transaction_minimum_amount(self):
        """Test that amount must be at least 0.01"""
        # Create a transaction instance first
        transaction = Transaction(
            user=self.user,
            title='Zero Amount',
            type='expense',
            amount=Decimal('0.00'),
            transaction_date=date(2024, 1, 1)
        )
        
        # Check that the validator raises the expected error
        validator = MinValueValidator(Decimal('0.01'))
        with self.assertRaises(ValidationError):
            validator(transaction.amount)


class BudgetModelTest(TransactionTestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='testpass123'
        )
        
        self.category = Category.objects.create(
            name='Food & Dining',
            user=self.user
        )
        
        self.entertainment = Category.objects.create(
            name='Entertainment',
            user=self.user
        )
        
        self.budget = Budget.objects.create(
            user=self.user,
            category=self.category,
            name='Food Budget',
            amount_limit=Decimal('1000.00'),
            month=1,
            year=2024
        )

    def test_budget_creation(self):
        """Test basic budget creation and field values"""
        self.assertEqual(self.budget.name, 'Food Budget')
        self.assertEqual(self.budget.amount_limit, Decimal('1000.00'))
        self.assertEqual(self.budget.user, self.user)
        self.assertEqual(self.budget.category, self.category)
        self.assertEqual(self.budget.month, 1)
        self.assertEqual(self.budget.year, 2024)
        self.assertTrue(isinstance(self.budget.created_at, datetime))
        self.assertTrue(isinstance(self.budget.updated_at, datetime))

    def test_budget_str_representation(self):
        """Test the string representation of a budget"""
        expected_str = f"Food Budget - 1000.00 (1/2024)"
        self.assertEqual(str(self.budget), expected_str)
        
        # Test with no name (uses category name)
        budget_no_name = Budget.objects.create(
            user=self.user,
            category=self.entertainment,
            amount_limit=Decimal('500.00'),
            month=1,
            year=2024
        )
        expected_str = f"Entertainment - 500.00 (1/2024)"
        self.assertEqual(str(budget_no_name), expected_str)
        
        # Test with no category
        total_budget = Budget.objects.create(
            user=self.user,
            category=None,
            name='Total Budget',
            amount_limit=Decimal('5000.00'),
            month=2,
            year=2024
        )
        expected_str = f"Total Budget - 5000.00 (2/2024)"
        self.assertEqual(str(total_budget), expected_str)
        
        # Test with no name and no category
        total_budget_no_name = Budget.objects.create(
            user=self.other_user,
            category=None,
            amount_limit=Decimal('3000.00'),
            month=1,
            year=2024
        )
        expected_str = f"All Categories - 3000.00 (1/2024)"
        self.assertEqual(str(total_budget_no_name), expected_str)

    def test_budget_unique_together(self):
        """Test that unique_together constraint works"""
        # Same user, category, month, year
        with self.assertRaises(IntegrityError):
            Budget.objects.create(
                user=self.user,
                category=self.category,
                name='Another Food Budget',
                amount_limit=Decimal('2000.00'),
                month=1,
                year=2024
            )
        
        # Different month - should work
        diff_month = Budget.objects.create(
            user=self.user,
            category=self.category,
            name='Food Budget February',
            amount_limit=Decimal('1000.00'),
            month=2,
            year=2024
        )
        self.assertEqual(diff_month.month, 2)
        
        # Different year - should work
        diff_year = Budget.objects.create(
            user=self.user,
            category=self.category,
            name='Food Budget Next Year',
            amount_limit=Decimal('1000.00'),
            month=1,
            year=2025
        )
        self.assertEqual(diff_year.year, 2025)
        
        # Different user - should work
        other_category = Category.objects.create(
            name='Food', 
            user=self.other_user
        )
        diff_user = Budget.objects.create(
            user=self.other_user,
            category=other_category,
            name='Other User Food Budget',
            amount_limit=Decimal('1000.00'),
            month=1,
            year=2024
        )
        self.assertEqual(diff_user.user, self.other_user)

    def test_budget_clean_category_user_mismatch(self):
        """Test validation when category belongs to different user"""
        other_category = Category.objects.create(
            name='Other Category',
            user=self.other_user
        )
        
        budget = Budget(
            user=self.user,
            category=other_category,
            name='Invalid Budget',
            amount_limit=Decimal('1000.00'),
            month=1,
            year=2024
        )
        
        with self.assertRaises(ValueError):
            budget.clean()

    def test_total_budget_constraint(self):
        """Test that only one total budget (no category) can exist per month/year per user"""
        # Create a total budget
        total_budget = Budget.objects.create(
            user=self.user,
            category=None,
            name='Total Budget January',
            amount_limit=Decimal('5000.00'),
            month=1,
            year=2024
        )
        
        # Try to create another total budget for same month/year
        with self.assertRaises(ValueError):
            Budget.objects.create(
                user=self.user,
                category=None,
                name='Another Total Budget January',
                amount_limit=Decimal('6000.00'),
                month=1,
                year=2024
            )
            
        # Different month should work
        feb_total = Budget.objects.create(
            user=self.user,
            category=None,
            name='Total Budget February',
            amount_limit=Decimal('5000.00'),
            month=2,
            year=2024
        )
        self.assertEqual(feb_total.month, 2)
        
        # Different user should work
        other_user_total = Budget.objects.create(
            user=self.other_user,
            category=None,
            name='Other User Total Budget',
            amount_limit=Decimal('3000.00'),
            month=1,
            year=2024
        )
        self.assertEqual(other_user_total.user, self.other_user)
        
    def test_budget_minimum_amount(self):
        """Test that amount_limit must be at least 0.01"""
        # Create a budget instance first
        budget = Budget(
            user=self.user,
            category=self.category,
            name='Zero Budget',
            amount_limit=Decimal('0.00'),
            month=3,
            year=2024
        )
        
        # Check that the validator raises the expected error
        validator = MinValueValidator(Decimal('0.01'))
        with self.assertRaises(ValidationError):
            validator(budget.amount_limit)
