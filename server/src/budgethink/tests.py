from django.test import TestCase
from django.contrib.auth import get_user_model
from decimal import Decimal
from .models import Category, Transaction, Budget
from django.core.exceptions import ValidationError

User = get_user_model()

class CategoryModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.category = Category.objects.create(
            name='Food & Dining',
            description='Groceries and restaurants',
            user=self.user,
            hex_color='#FF0000'
        )

    def test_category_creation(self):
        self.assertEqual(self.category.name, 'Food & Dining')
        self.assertEqual(self.category.description, 'Groceries and restaurants')
        self.assertEqual(self.category.user, self.user)
        self.assertEqual(self.category.hex_color, '#FF0000')

    def test_category_hex_color_clean(self):
        category = Category(
            name='Test Category',
            user=self.user,
            hex_color='FF0000'  # Without #
        )
        category.clean()
        self.assertEqual(category.hex_color, '#FF0000')

    def test_category_unique_together(self):
        with self.assertRaises(Exception):
            Category.objects.create(
                name='Food & Dining',
                user=self.user
            )

    def test_category_properties(self):
        # Create some transactions
        Transaction.objects.create(
            user=self.user,
            category=self.category,
            title='Grocery Shopping',
            type='expense',
            amount=Decimal('100.00'),
            transaction_date='2024-01-01'
        )
        Transaction.objects.create(
            user=self.user,
            category=self.category,
            title='Salary',
            type='income',
            amount=Decimal('200.00'),
            transaction_date='2024-01-02'
        )

        self.assertEqual(self.category.transactions_count, 2)
        self.assertEqual(self.category.income_count, 1)
        self.assertEqual(self.category.expense_count, 1)
        self.assertEqual(self.category.total_income, Decimal('200.00'))
        self.assertEqual(self.category.total_expense, Decimal('100.00'))
        self.assertEqual(self.category.total_balance, Decimal('100.00'))


class TransactionModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
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
            transaction_date='2024-01-01'
        )

    def test_transaction_creation(self):
        self.assertEqual(self.transaction.title, 'Grocery Shopping')
        self.assertEqual(self.transaction.description, 'Weekly groceries')
        self.assertEqual(self.transaction.type, 'expense')
        self.assertEqual(self.transaction.amount, Decimal('100.00'))
        self.assertEqual(self.transaction.user, self.user)
        self.assertEqual(self.transaction.category, self.category)

    def test_transaction_get_formatted_amount(self):
        self.assertEqual(self.transaction.get_formatted_amount(), '-100.00')
        
        income_transaction = Transaction.objects.create(
            user=self.user,
            category=self.category,
            title='Salary',
            type='income',
            amount=Decimal('200.00'),
            transaction_date='2024-01-02'
        )
        self.assertEqual(income_transaction.get_formatted_amount(), '+200.00')

    def test_transaction_clean_category_user_mismatch(self):
        other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='testpass123'
        )
        other_category = Category.objects.create(
            name='Other Category',
            user=other_user
        )
        
        transaction = Transaction(
            user=self.user,
            category=other_category,
            title='Invalid Transaction',
            type='expense',
            amount=Decimal('100.00'),
            transaction_date='2024-01-01'
        )
        
        with self.assertRaises(ValueError):
            transaction.clean()


class BudgetModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.category = Category.objects.create(
            name='Food & Dining',
            user=self.user
        )
        self.budget = Budget.objects.create(
            user=self.user,
            category=self.category,
            name='Food Budget',
            amount_limit=Decimal('1000.00')
        )

    def test_budget_creation(self):
        self.assertEqual(self.budget.name, 'Food Budget')
        self.assertEqual(self.budget.amount_limit, Decimal('1000.00'))
        self.assertEqual(self.budget.user, self.user)
        self.assertEqual(self.budget.category, self.category)

    def test_budget_unique_together(self):
        with self.assertRaises(Exception):
            Budget.objects.create(
                user=self.user,
                category=self.category,
                name='Another Food Budget',
                amount_limit=Decimal('2000.00')
            )

    def test_budget_clean_category_user_mismatch(self):
        other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='testpass123'
        )
        other_category = Category.objects.create(
            name='Other Category',
            user=other_user
        )
        
        budget = Budget(
            user=self.user,
            category=other_category,
            name='Invalid Budget',
            amount_limit=Decimal('1000.00')
        )
        
        with self.assertRaises(ValueError):
            budget.clean()

    def test_all_budget_constraint(self):
        # Create an "all" budget (category=None)
        Budget.objects.create(
            user=self.user,
            category=None,
            name='All Categories Budget',
            amount_limit=Decimal('5000.00')
        )
        
        # Try to create another "all" budget
        with self.assertRaises(ValueError):
            Budget.objects.create(
                user=self.user,
                category=None,
                name='Another All Budget',
                amount_limit=Decimal('6000.00')
            )
