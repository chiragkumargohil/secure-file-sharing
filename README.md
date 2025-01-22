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

#### **User Table**
- **Fields**:  
  - `id`: Primary key, auto-incremented.  
  - `email`: Unique email address of the user.  
  - `username`: Username chosen by the user.  
  - `first_name`: First name of the user.  
  - `last_name`: Last name of the user.  
  - `selected_drive`: Tracks the user’s currently active drive.

---

#### **File Table**
- **Fields**:  
  - `id`: Primary key, auto-incremented.  
  - `owner`: Foreign key linking to the `User` table (represents the file owner).  
  - `filename`: Name of the uploaded file.  
  - `file`: Encrypted file data stored in private storage.  
  - `mime_type`: MIME type of the file (e.g., `application/pdf`).  
  - `size`: Size of the file in bytes.  
  - `created_at`: Timestamp for file creation.  
  - `updated_at`: Timestamp for the last update.  
  - `encryption_key`: Binary field storing the encryption key (AES-256).  
  - `encryption_iv`: Binary field storing the initialization vector for encryption.  
  - `encryption_tag`: Binary field storing the GCM tag for verification.  
  - `added_by`: Foreign key linking to the `User` table, tracking who added the file (optional).

---

#### **SharedFile Table**
- **Fields**:  
  - `id`: Primary key, auto-incremented.  
  - `file`: Foreign key linking to the `File` table.  
  - `sender_user`: Foreign key linking to the `User` table (represents the user sharing the file).  
  - `receiver_email`: Email of the user with whom the file is shared.  
  - `access_type`: Access permission type (`view`, `download`, `edit`).  
  - `message`: Optional message shared along with the file.  
  - `created_at`: Timestamp for when the file was shared.  
  - `updated_at`: Timestamp for the last update.  
  - `shared_by`: Foreign key linking to the `User` table, tracking who shared the file (optional).

---

#### **PublicFile Table**
- **Fields**:  
  - `id`: Primary key, auto-incremented.  
  - `uuid`: Unique identifier for the public file link.  
  - `file`: One-to-one relationship with the `File` table.  
  - `is_active`: Boolean field indicating whether the link is active.  
  - `expiration_date`: Date and time when the public link expires (optional).  
  - `created_at`: Timestamp for link creation.  
  - `updated_at`: Timestamp for the last update.  
  - `shared_by`: Foreign key linking to the `User` table, tracking who created the public link (optional).

---

#### **DriveAccess Table**
- **Fields**:  
  - `id`: Primary key, auto-incremented.  
  - `owner`: Foreign key linking to the `User` table (represents the owner of the drive).  
  - `receiver_email`: Email of the user who is granted access to the drive.  
  - `role`: Role assigned to the receiver (`admin`, `editor`, `viewer`).  
  - `created_at`: Timestamp for when the access was granted.  
  - `updated_at`: Timestamp for the last update.  
  - `added_by`: Foreign key linking to the `User` table, tracking who added the drive access (optional).

### **Logic**

1. **Drive Access Logic:**  
   - Each user is allowed to create their own drive.  
   - The `DriveAccess` table uses a combination of `receiver_email` and `owner` fields to manage drive access.  
   - This design allows the owner to invite other users by their email, even if the invited users are not yet registered in the system.  
   - When the invited user registers, they automatically gain access to the drive based on the existing `DriveAccess` entry and invited user can also have user's own drive.

2. **File Sharing Logic:**  
   - The `SharedFile` table allows sharing files using the `receiver_email` field.  
   - This means files can be shared with users who are not yet registered in the system.  
   - Once the receiver registers, they can see the files shared with them using their email.  
   - This approach ensures that file sharing is seamless and does not depend on the receiver being an existing user of the system or the drive.

3. **Role-Based Access Control:**  
   - In the `DriveAccess` table, the `role` field (`admin`, `editor`, `viewer`) defines the type of permissions granted to a user for a particular drive.  
   - Similarly, in the `SharedFile` table, the `access_type` field (`view`, `download`, `edit`) defines the level of access granted for a specific file.

4. **Public File Sharing Logic:**  
   - The `PublicFile` table generates a unique `uuid` for each public link.  
   - Public links can be dynamically generated and shared, with an optional expiration date to ensure time-limited access.  
   - The `is_active` field ensures control over whether a public link is currently usable.  

This combination of logic ensures flexibility, scalability, and seamless collaboration between registered and unregistered users.

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
   - Frontend: `http://localhost:5173`  

---

### 5. Testing the Application
- Open the frontend URL in your browser to test the UI.  
- Use the backend URL to test API endpoints with tools like Postman.  
