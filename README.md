# 🚀 SmartOuting - Digital Gate Pass System

A modern, microservices-based gate pass management system for university campuses. Automates student outing approvals with AI-based urgency detection, QR code verification, real-time parent notifications, and automated tracking.

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#️-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#️-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Usage Guide](#-usage-guide)
- [Security](#-security)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### For Students
- **Quick Application**: Apply for outing passes with destination, reason, and time details
- **AI Analysis**: Automatic urgency detection based on reason (medical emergency, routine, etc.)
- **QR Code Pass**: Receive scannable QR code upon approval
- **Request History**: View all past and current outing requests
- **Real-time Status**: Track approval status (Pending → Approved → Out → Returned)

### For Wardens
- **Smart Dashboard**: View all pending requests sorted by urgency
- **AI Insights**: See urgency scores and flags for quick decision-making
- **Bulk Actions**: Approve/reject multiple requests
- **Student History**: Check individual student's outing patterns
- **Ban Management**: Automatically block students with 3+ overdue returns

### For Guards
- **QR Scanner**: Camera-based QR code scanning (no manual typing needed)
- **Quick Verification**: Instant student details display
- **One-Click Actions**: Mark students OUT (exit) or IN (return)
- **Recent Activity**: See last 10 scans for audit trail

### Automated Features
- **Parent Email Alerts**: Automatic email when student exits campus
- **Overdue Tracking**: Cron job checks for late returns every minute
- **Auto-Blacklisting**: Students with 3 overdue returns get blocked
- **Time-based Notifications**: Reminders before expected return time

---

## 🏗️ Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│   API Gateway       │  Port 8989
│   (Entry Point)     │
└──────┬──────────────┘
       │
       ├──────────────────┬──────────────────┬────────────────┐
       ▼                  ▼                  ▼                ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Service    │  │  Identity   │  │  Outing     │  │  Frontend   │
│  Registry   │  │  Service    │  │  Service    │  │  (React)    │
│  (Eureka)   │  │  (Auth)     │  │  (Core)     │  │             │
│  Port 8761  │  │  Port 8081  │  │  Port 8082  │  │  Port 5173  │
└─────────────┘  └──────┬──────┘  └──────┬──────┘  └─────────────┘
                        │                 │
                        ▼                 ▼
                   ┌─────────────────────────┐
                   │      MySQL Database     │
                   │       Port 3306         │
                   └─────────────────────────┘
```

### Services

1. **Service Registry (Eureka)** - Service discovery and health monitoring
2. **API Gateway** - Request routing, load balancing, rate limiting
3. **Identity Service** - JWT authentication, user management, RBAC
4. **Outing Service** - Business logic, QR generation, email notifications
5. **Frontend** - React SPA with role-based UI

---

## 💻 Tech Stack

### Backend
- **Language**: Java 17
- **Framework**: Spring Boot 3.2.x
- **Microservices**: Spring Cloud (Netflix Eureka, Gateway)
- **Security**: Spring Security 6, JWT
- **Database**: MySQL 8.0
- **ORM**: Spring Data JPA (Hibernate)
- **Build Tool**: Gradle 8.x

### Frontend
- **Framework**: React 19.2.4
- **Build Tool**: Vite 8.0
- **QR Scanner**: html5-qrcode 2.3.8
- **HTTP Client**: Fetch API
- **Styling**: Inline CSS (custom design system)

### Libraries & Tools
- **QR Generation**: ZXing (Zebra Crossing)
- **Email**: Spring Mail (SMTP)
- **Scheduling**: Spring Task Scheduler
- **Data Validation**: Jakarta Validation
- **Boilerplate Reduction**: Lombok

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Java Development Kit (JDK) 17 or higher**
  ```bash
  java -version
  ```

- **MySQL Server 8.0+**
  ```bash
  mysql --version
  ```

- **Node.js 18+ and npm**
  ```bash
  node -v
  npm -v
  ```

- **Git**
  ```bash
  git --version
  ```

- **Gmail Account** with App Password enabled (for email notifications)

---

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/shrey200634/SmartOuting.git
cd SmartOuting
```

### 2. Database Setup

```sql
-- Connect to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE outing_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (optional but recommended)
CREATE USER 'smartouting'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON outing_db.* TO 'smartouting'@'localhost';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### 3. Backend Configuration

Create `application.yml` files in each service (see [Configuration](#️-configuration) section below).

**Important**: Never commit `application.yml` to Git. Add to `.gitignore`:

```gitignore
**/application.yml
**/application.properties
**/application-*.yml
```

### 4. Frontend Setup

```bash
cd frontend
npm install
```

---

## ⚙️ Configuration

### Service Registry (`service-registry/src/main/resources/application.properties`)

```properties
# Server Configuration
server.port=8761
spring.application.name=service-registry

# Eureka Configuration
eureka.client.register-with-eureka=false
eureka.client.fetch-registry=false
eureka.server.enable-self-preservation=false
```

### API Gateway (`api-gateway/src/main/resources/application.yml`)

```yaml
server:
  port: 8989

spring:
  application:
    name: api-gateway
  cloud:
    gateway:
      routes:
        - id: identity-service
          uri: lb://identity-service
          predicates:
            - Path=/auth/**
        - id: outing-service
          uri: lb://outing-service
          predicates:
            - Path=/outing/**

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
```

### Identity Service (`identity-service/src/main/resources/application.properties`)

```properties
# Server Configuration
server.port=8081
spring.application.name=identity-service

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/outing_db
spring.datasource.username=YOUR_DB_USERNAME
spring.datasource.password=YOUR_DB_PASSWORD
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# Eureka Configuration
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
```

### Outing Service (`outing-service/src/main/resources/application.yml`)

```yaml
server:
  port: 8082

spring:
  application:
    name: outing-service
  
  datasource:
    url: jdbc:mysql://localhost:3306/outing_db
    username: YOUR_DB_USERNAME
    password: YOUR_DB_PASSWORD
    driver-class-name: com.mysql.cj.jdbc.Driver
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect
  
  mail:
    host: smtp.gmail.com
    port: 587
    username: YOUR_EMAIL@gmail.com
    password: YOUR_16_CHAR_APP_PASSWORD
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
```

**Get Gmail App Password:**
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Generate App Password (select "Mail" and "Other")
4. Copy the 16-character password (no spaces)

---

## 🚀 Running the Application

### Backend Services

**Important**: Start services in this exact order and wait for each to fully start before proceeding to the next.

#### 1. Start Service Registry (Eureka)

```bash
cd service-registry
./gradlew bootRun
```

Wait for: `Started ServiceRegistryApplication` (port 8761)  
Verify: http://localhost:8761

#### 2. Start API Gateway

```bash
cd api-gateway
./gradlew bootRun
```

Wait for: `Started ApiGatewayApplication` (port 8989)

#### 3. Start Identity Service

```bash
cd identity-service
./gradlew bootRun
```

Wait for: `Started IdentityServiceApplication` (port 8081)

#### 4. Start Outing Service

```bash
cd outing-service
./gradlew bootRun
```

Wait for: `Started OutingServiceApplication` (port 8082)

### Frontend

```bash
cd frontend
npm run dev
```

Open: http://localhost:5173

---

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "STUDENT"
}
```

**Response:**
```json
{
  "message": "User registered successfully"
}
```

#### Login
```http
POST /auth/token
Content-Type: application/json

{
  "username": "john_doe",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "name": "john_doe",
  "role": "STUDENT"
}
```

### Outing Endpoints

All endpoints require JWT token in header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Apply for Outing
```http
POST /outing/apply
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "studentId": "ST12345",
  "studentName": "John Doe",
  "parentEmail": "parent@example.com",
  "reason": "Going to hospital for checkup",
  "destination": "City Hospital",
  "outDate": "2024-03-20T10:00:00",
  "returnDate": "2024-03-20T18:00:00"
}
```

#### Get Student History
```http
GET /outing/student/ST12345
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Approve Outing (Warden)
```http
PUT /outing/approve/42?comment=Approved for medical reasons
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Scan Out (Guard)
```http
PUT /outing/scan/42
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Scan In (Guard)
```http
PUT /outing/return/42
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📱 Usage Guide

### For Students

1. **Register Account**
   - Click "Create Account"
   - Enter details with role "STUDENT"
   - Login with credentials

2. **Apply for Outing**
   - Click "Apply for Outing"
   - Fill in destination, reason, dates
   - Submit (AI analyzes urgency)

3. **Get QR Code**
   - Wait for warden approval
   - Go to "My Requests" tab
   - QR code appears on approved request
   - Show QR at gate

### For Wardens

1. **Login as Warden**
   - Use credentials with "WARDEN" role

2. **Review Requests**
   - See all pending requests
   - AI flags show urgency (🔴 Medical, 🟡 Urgent, 🟢 Routine)
   - View student history

3. **Approve/Reject**
   - Click on request to review
   - Add comment (optional)
   - Click "Approve" or "Reject"

### For Guards

1. **Login as Guard**
   - Use credentials with "GUARD" role

2. **Scan QR Code**
   - Click "📷 Scan QR Code"
   - Point camera at student's QR
   - System auto-extracts ID

3. **Mark Student Out**
   - Verify details displayed
   - Click "Mark OUT"
   - Parent email sent automatically

4. **Mark Student Return**
   - Scan QR again when student returns
   - Click "Mark IN"
   - Status updated to RETURNED

---

## 🔒 Security

### Authentication
- JWT-based stateless authentication
- Tokens expire after 24 hours
- Password hashing with BCrypt
- Role-based access control (RBAC)

### Authorization
- **STUDENT**: Can apply, view own history
- **WARDEN**: Can approve/reject, view all requests
- **GUARD**: Can scan QR, mark OUT/IN (IP whitelisted)

### Data Protection
- SQL injection prevention (JPA/Hibernate)
- XSS protection (input sanitization)
- CORS configuration (specific origins only)
- HTTPS recommended for production

### Best Practices
- Never commit `application.yml` to Git
- Use environment variables for sensitive data
- Rotate JWT secret regularly
- Enable MySQL SSL in production
- Use Gmail App Password (not account password)

---

## 🐛 Troubleshooting

### Backend Won't Start

**Issue**: `Port already in use`
```bash
# Find process using port
lsof -i :8761  # or 8081, 8082, 8989
# Kill process
kill -9 PID
```

**Issue**: `Connection refused` to MySQL
- Check MySQL is running: `sudo systemctl status mysql`
- Verify credentials in `application.yml`
- Ensure database `outing_db` exists

### Frontend Issues

**Issue**: `Module not found: html5-qrcode`
```bash
cd frontend
npm install html5-qrcode
```

**Issue**: Camera not working
- Use HTTPS (required for camera access)
- For local testing: Use `ngrok http 5173`
- Check browser permissions

### QR Code Not Displaying

**Issue**: Broken image icon
- Verify backend fix applied (data URI prefix)
- Check browser console for errors
- Try hard refresh (Ctrl+F5)

---

## 👨‍💻 Author

**Shrey Dave**  
B.Tech in Cloud Computing and Automation

---

## 📄 License

This project is licensed under the MIT License.

---

**Made with ❤️ for university campus security**
