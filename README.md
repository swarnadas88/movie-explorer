# 🎬 Movie Explorer – JWT Authentication & Role-Based Access Control

## 📌 Project Overview

**Movie Explorer** is a web-based movie management application built using **Flask, PostgreSQL, JavaScript, HTML, and CSS**.

The application allows users to view movies and perform operations such as **adding, updating, and deleting movies** based on their assigned roles.

The project implements **JWT (JSON Web Token) authentication** to securely identify logged-in users when they access protected APIs. After successful login, the Flask backend generates a JWT containing the user's unique database ID. The client sends this token with subsequent API requests, and Flask verifies the token before allowing access to protected operations.

The application also implements **Role-Based Access Control (RBAC)**, where users are assigned roles such as `INSERT`, `UPDATE`, and `DELETE`. The API checks the authenticated user's roles before allowing specific operations.

---

## 🎯 Main Objectives

The main objectives of this project are:

- Implement secure user login using JWT authentication.
- Identify the logged-in user using the JWT identity.
- Protect APIs using JWT verification.
- Implement role-based authorization.
- Allow users to perform operations based on their assigned roles.
- Reject unauthorized operations.
- Connect the frontend with Flask REST APIs.
- Store application data using PostgreSQL.
- Test authentication and authorization using Postman.

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| Python | Backend programming |
| Flask | REST API development |
| Flask-JWT-Extended | JWT authentication |
| PostgreSQL | Database |
| psycopg2 | PostgreSQL connectivity |
| JavaScript | Frontend and API communication |
| HTML | User interface |
| CSS | Styling |
| Postman | API testing |
| JWT | Authentication |

---

# 🏗️ System Architecture

The overall application flow is:

```text
User
 ↓
Login Page
 ↓
Flask Login API
 ↓
PostgreSQL Users Table
 ↓
Username + Password Verification
 ↓
JWT Token Generated
 ↓
Token Stored by Client
 ↓
API Request with Bearer Token
 ↓
JWT Verification
 ↓
Identify Logged-in User
 ↓
Check User Roles
 ↓
Allow / Deny Operation
 ↓
PostgreSQL
