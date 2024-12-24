# Secure File Sharing Web App

## Project Overview
A secure web application for file sharing with advanced encryption, multi-factor authentication, and granular access controls.

---

## Tech Stack
- **Frontend**: React.js with Redux  
- **Backend**: Python Django  
- **Database**: SQLite  
- **Authentication**: Django REST Framework  
- **Containerization**: Docker  

---

## Key Features
- Multi-Factor Authentication (MFA)
- Role-Based Access Control (RBAC)
- File Encryption
- Expirable Sharing Links
- Secure File Transfer
---

## Learnings
- Django REST Framework for API development.
- Leveraged Docker and Docker Compose for containerization.
- Implemented multi-factor authentication with TOTP and email verification.
   - Note: MFA is not enabled by default and MFA won't work if EMAIL_HOST_USER is not set.
- Implemented role-based access control for different user roles.
- Implemented file encryption and decryption

## Prerequisites
- Python 3.9+  
- Node.js 16+  
- Docker  
- Docker Compose  

---

## Folder Structure

### Backend
- Contains Django backend files, including modules for user management, file handling, and public file links.  
- Key directories:  
  - **`files/`**: Application logic modules for file handling.
  - **`middleware/`**: Custom middleware like token validation, role accessibility.
  - **`private_storage/`**: File storing bucket.
  - **`public_files/`**: Application logic modules for public file links.
  - **`users/`**: Application logic modules for user and drive access management.
  - **`shared_files/`**: Application logic modules for shared files.  

### Frontend
- Contains React.js frontend files structured for modularity.  
- Key directories:  
  - **`components/`**: Reusable React components.  
  - **`redux/`**: State management files.  
  - **`pages/`**: Application pages.  

---

## Database Schema

### User
- Stores user information, including email, MFA settings.  
- Custom methods for string representation and fields for MFA-related data.  

### File
- Stores file metadata, including the owner, filename, MIME type, size, and timestamps.  
- Links each file to its owner using a foreign key.  

### Public File
- Tracks public file sharing details, including a UUID, expiration status, and timestamps.  
- Generates public links dynamically and validates link expiration.

### Shared File
- Tracks shared file details, including a owner, file, receiver email, and access type.
- Links each shared file to its owner and file using foreign keys.

---

## Installation Steps

### 1. Clone the Repository
```bash
git https://github.com/chiragkumargohil/secure-file-sharing
cd secure-file-sharing
```

---

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up the `.env` file:
   - Create a `.env` file in the `backend` directory.
   - Add required settings (e.g., email config, secret keys).  

5. Run database migrations:
   ```bash
   python manage.py migrate
   ```
6. Start the development server:
   ```bash
   python manage.py runserver
   ```

---

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the `.env` file:
   - Create a `.env` file in the `frontend` directory.
   - Add required settings (e.g., backend API URLs).  

4. Start the development server:
   ```bash
   npm run dev
   ```

---

### 4. Running with Docker
1. Build and start the containers:
   ```bash
   docker-compose up --build
   ```
2. Access the application:
   - Backend: `http://127.0.0.1:8000`  
   - Frontend: `http://localhost:3000`  

---

### 5. Testing the Application
- Open the frontend URL in your browser to test the UI.  
- Use the backend URL to test API endpoints with tools like Postman.  