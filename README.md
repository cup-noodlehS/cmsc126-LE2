# cmsc126-LE2

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Python (v3.8 or higher)
- pip

The frontend is built with Next.js and the backend uses Django.

## ✅ Feature To-Do List

🔐 User Authentication
- [ ] Register, Login, Logout
- [ ] Session-based data access

### 💰 Income & Expense Entries
- [ ] Add, Edit, Delete entries
- [ ] Fields: title, amount, date, type, notes

### 🗂 Categorization
- [ ] Dropdown category selection
- [ ] Assign category per expense

### 📅 Monthly Summary
- [ ] Monthly income & expense totals
- [ ] Remaining balance calculation

### 📊 Dashboard (with Chart.js)
- [ ] Pie chart: Expenses by category
- [ ] Bar graph: Monthly income vs. expenses

### 💡 UI & Frontend
- [ ] Responsive layout
- [ ] Navigation bar
- [ ] Flash messages

### 🚀 Stretch Goals
- [ ] Budget limits & alerts
- [ ] CSV export with filters

## Setup
This project requires running both a frontend and backend server. You'll need two terminal windows open to run both simultaneously.

### Frontend Setup
1. Navigate to the client directory and install dependencies:
    ```
    cd client
    npm install
    ```

1. Start the Next.js development server:
    ```
    npm run dev
    ```
    > This will launch the frontend at http://localhost:3000 by default.

    > Note: If the backend server isn't running on port 8000, update `API_URL` in `/client/.env`.

### Backend Setup
1. Navigate to the server directory:
    ```
    cd server
    ```

1. Setup venv
    For Mac/Linux:
    ```
    python3 -m venv venv
    ```
    
    For Windows:
    ```
    python -m venv venv
    ```

1. Activate the Python virtual environment:

    For Mac:
    ```
    source venv/bin/activate
    ```

    For Windows:
    ```
    venv\Scripts\activate
    ```

1. Install dependencies
    ```
    pip install -r requirements.txt
    ```

1. Start the Django development server:
    ```
    python src/manage.py runserver
    ```
    > This will start the backend API server at http://localhost:8000.
