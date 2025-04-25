# cmsc126-LE2

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Python (v3.8 or higher)
- pip

The frontend is built with Next.js and the backend uses Django.

## Setup
This project requires running both a frontend and backend server. You'll need two terminal windows open to run both simultaneously.

### Frontend Setup
- Navigate to the client directory and install dependencies:
    ```
    cd client
    npm install
    ```

- Start the Next.js development server:
    ```
    npm run dev
    ```
    > This will launch the frontend at http://localhost:3000 by default.

    > Note: If the backend server isn't running on port 8000, update `API_URL` in `/client/.env`.

### Backend Setup
- Navigate to the server directory:
    ```
    cd server
    ```

- Activate the Python virtual environment:

    For Mac:
    ```
    source venv/bin/activate
    ```

    For Windows:
    ```
    venv\Scripts\activate
    ```

- Start the Django development server:
    ```
    python src/manage.py runserver
    ```
    > This will start the backend API server at http://localhost:8000.