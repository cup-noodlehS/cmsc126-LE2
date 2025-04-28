from django.core.management.base import BaseCommand
from budgethink.models import Category, Transaction, Budget
from datetime import datetime, timedelta
import random
from decimal import Decimal
from django.contrib.auth import get_user_model
User = get_user_model()


class Command(BaseCommand):
    help = 'Creates mock data for testing the budgeting app'

    def handle(self, *args, **kwargs):
        # Get or create user with id=2
        user, created = User.objects.get_or_create(id=2, defaults={
            'username': 'test_user',
            'email': 'test@example.com',
            'password': 'testpass123'
        })

        # Create categories
        categories = [
            {'name': 'Food & Dining', 'description': 'Groceries, restaurants, and food delivery'},
            {'name': 'Transportation', 'description': 'Public transport, fuel, and car maintenance'},
            {'name': 'Housing', 'description': 'Rent, utilities, and home maintenance'},
            {'name': 'Entertainment', 'description': 'Movies, games, and leisure activities'},
            {'name': 'Shopping', 'description': 'Clothing, electronics, and other purchases'},
            {'name': 'Healthcare', 'description': 'Medical expenses and insurance'},
            {'name': 'Education', 'description': 'Books, courses, and educational materials'},
            {'name': 'Salary', 'description': 'Monthly salary and bonuses'},
            {'name': 'Freelance', 'description': 'Income from freelance work'},
            {'name': 'Investments', 'description': 'Investment returns and dividends'},
        ]

        category_objects = []
        for category in categories:
            cat, created = Category.objects.get_or_create(
                user=user,
                name=category['name'],
                defaults={'description': category['description']}
            )
            category_objects.append(cat)

        # Create transactions for the last 4 months
        today = datetime.now()
        start_date = today - timedelta(days=120)  # 4 months ago

        # Common transaction descriptions
        expense_descriptions = {
            'Food & Dining': [
                'Grocery shopping at SM Supermarket',
                'Dinner at Jollibee',
                'Coffee at Starbucks',
                'Lunch at McDonald\'s',
                'Food delivery via GrabFood',
                'Weekend groceries',
                'Snacks at 7-Eleven',
                'Breakfast at Cafe',
                'Takeout from Chowking',
                'Grocery at Puregold',
            ],
            'Transportation': [
                'Grab ride to work',
                'Monthly MRT pass',
                'Gas refill',
                'Car maintenance',
                'Jeepney fare',
                'Taxi ride',
                'Bus fare',
                'Parking fee',
                'Car wash',
                'Bike maintenance',
            ],
            'Housing': [
                'Monthly rent',
                'Electricity bill',
                'Water bill',
                'Internet bill',
                'Home maintenance',
                'Condo dues',
                'Property tax',
                'Home insurance',
                'Repair services',
                'Cleaning services',
            ],
            'Entertainment': [
                'Netflix subscription',
                'Movie tickets',
                'Concert tickets',
                'Video games',
                'Streaming subscription',
                'Spotify Premium',
                'Gym membership',
                'Sports event',
                'Theme park tickets',
                'Hobby supplies',
            ],
            'Shopping': [
                'New clothes',
                'Electronics purchase',
                'Home appliances',
                'Furniture',
                'Gadgets',
                'Shoes',
                'Accessories',
                'Home decor',
                'Kitchenware',
                'Office supplies',
            ],
            'Healthcare': [
                'Doctor consultation',
                'Medicine purchase',
                'Dental checkup',
                'Health insurance',
                'Vitamins',
                'Eye checkup',
                'Lab tests',
                'Physical therapy',
                'Medical supplies',
                'Health supplements',
            ],
            'Education': [
                'Online course',
                'Textbooks',
                'Workshop registration',
                'Educational materials',
                'School supplies',
                'Tutorial services',
                'Language class',
                'Certification exam',
                'Research materials',
                'Educational app subscription',
            ],
        }

        income_descriptions = {
            'Salary': [
                'Monthly salary',
                'Performance bonus',
                'Year-end bonus',
                'Overtime pay',
                'Commission',
                '13th month pay',
                'Holiday bonus',
                'Project completion bonus',
            ],
            'Freelance': [
                'Web development project',
                'Graphic design work',
                'Consulting services',
                'Content writing',
                'Video editing',
                'Social media management',
                'Photography gig',
                'Tutoring services',
            ],
            'Investments': [
                'Stock dividends',
                'Investment returns',
                'Interest income',
                'Mutual fund returns',
                'Bond interest',
                'Real estate rental',
                'Business dividends',
                'Crypto returns',
            ],
        }

        # Generate transactions
        transactions = []
        current_date = start_date

        while current_date <= today:
            # Generate 5-10 transactions per day
            num_transactions = random.randint(5, 10)
            
            for _ in range(num_transactions):
                # 70% chance of expense, 30% chance of income
                is_expense = random.random() < 0.7
                
                if is_expense:
                    category = random.choice([c for c in category_objects if c.name not in ['Salary', 'Freelance', 'Investments']])
                    descriptions = expense_descriptions.get(category.name, ['Miscellaneous expense'])
                    amount = Decimal(random.uniform(100, 5000)).quantize(Decimal('0.01'))
                else:
                    category = random.choice([c for c in category_objects if c.name in ['Salary', 'Freelance', 'Investments']])
                    descriptions = income_descriptions.get(category.name, ['Miscellaneous income'])
                    amount = Decimal(random.uniform(1000, 20000)).quantize(Decimal('0.01'))

                # Add random hours and minutes to make transaction times more varied
                random_hours = random.randint(0, 23)
                random_minutes = random.randint(0, 59)
                transaction_datetime = current_date.replace(
                    hour=random_hours,
                    minute=random_minutes
                )

                transaction = Transaction(
                    user=user,
                    category=category,
                    amount=amount,
                    type='expense' if is_expense else 'income',
                    description=random.choice(descriptions),
                    transaction_date=transaction_datetime
                )
                transactions.append(transaction)

            current_date += timedelta(days=1)

        # Bulk create transactions
        Transaction.objects.bulk_create(transactions)

        # Create budgets
        budgets = []
        for category in category_objects:
            if category.name not in ['Salary', 'Freelance', 'Investments']:
                budget = Budget(
                    user=user,
                    category=category,
                    name=f"{category.name} Budget",
                    amount_limit=Decimal(random.uniform(1000, 10000)).quantize(Decimal('0.01'))
                )
                budgets.append(budget)

        # Bulk create budgets
        Budget.objects.bulk_create(budgets)

        self.stdout.write(self.style.SUCCESS('Successfully created mock data')) 