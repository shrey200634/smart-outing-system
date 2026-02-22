# 🚀 Smart Outing Pass System

A robust, microservices-based digital gate pass backend designed to automate and secure the student outing process for university campuses. This system replaces slow, manual paperwork with an intelligent workflow featuring AI-based urgency detection, real-time parent notifications, secure QR code verification, and automated disciplinary actions.

---

## 🏗️ Architecture Overview

The system is built using a **Microservices Architecture** to ensure scalability, fault tolerance, and clear separation of concerns.

* **API Gateway (Port 8989):** The single entry point for all client requests. It intelligently routes traffic to the appropriate underlying microservice.
* **Netflix Eureka Naming Server (Port 8761):** Acts as the service registry. All microservices register here, allowing dynamic discovery without hardcoded IP addresses.
* **Identity Service (Port 8081):** Manages user registration, authentication, and Role-Based Access Control (RBAC) using JWT.
* **Outing Service (Port 8082):** Contains the core business logic, including application processing, AI analysis, QR generation, email alerts, and the disciplinary scheduler.

---

## ✨ Key Features

### 🛡️ 1. Security & Identity
* **Stateless Authentication:** Secure login and session management using **JSON Web Tokens (JWT)**.
* **Role-Based Access Control:** Distinct privileges for `STUDENT`, `WARDEN`, and `GUARD`.
* **Guard Zone (IP Whitelisting):** The QR scanning endpoint is protected by an Interceptor that blocks requests unless they originate from the physical Main Gate's IP address.

### 🧠 2. Intelligent Processing
* **AI Urgency Detection:** A heuristic algorithm scans the student's reason for leave. High-priority keywords (e.g., "hospital", "doctor") automatically flag the request as a `MEDICAL_EMERGENCY` with an urgency score to prioritize Warden approval.

### 📲 3. Digital Verification
* **QR Code Generation:** Approved requests automatically generate a cryptographically unique QR code (via ZXing) to prevent forged paper passes.

### 📨 4. Real-Time Automation
* **Parent Email Alerts:** The exact moment a Guard scans a student out, an asynchronous background thread uses `JavaMailSender` to email the parents, ensuring safety and transparency.
* **The "Time Warden" Scheduler:** A `@Scheduled` cron job runs every minute to track overdue students.
* **Automated Blacklisting:** Students who accrue 3 `OVERDUE` records are automatically blocked by the system from making future requests until cleared by a Warden.

---

## 💻 Tech Stack

* **Language:** Java 17
* **Framework:** Spring Boot 3.x
* **Microservices:** Spring Cloud (Netflix Eureka, API Gateway), OpenFeign
* **Security:** Spring Security 6, JWT (io.jsonwebtoken)
* **Database:** MySQL 8.0, Spring Data JPA (Hibernate)
* **Tools & Libraries:** * `ZXing` (QR Codes)
    * `spring-boot-starter-mail` (SMTP Emails)
    * `Lombok` (Boilerplate reduction)
* **Build Tool:** Gradle

---

## 🚀 Getting Started

### Prerequisites
* Java 17 installed
* MySQL installed and running on default port `3306`
* A Gmail account with an App Password (for email alerts)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/shrey200634/Smart-outing-system.git](https://github.com/shrey200634/Smart-outing-system.git)
    ```

2.  **Database Configuration:**
    * Create a database in MySQL: `CREATE DATABASE outing_db;`
    * Update `application.yml` in both services with your MySQL credentials.

3.  **Email Configuration:**
    * In the Outing Service `application.yml`, add your Gmail and 16-character App Password under `spring.mail`.

4.  **Run the Services (In this specific order):**
    * ▶️ Run `EurekaServerApplication`
    * ▶️ Run `ApiGatewayApplication`
    * ▶️ Run `IdentityServiceApplication`
    * ▶️ Run `OutingServiceApplication`

---

## 📡 Core API Endpoints (Via Gateway: 8989)

### Authentication (Identity Service)
| Method | Endpoint         | Description             | Access |
| :----- | :--------------- | :---------------------- | :----- |
| `POST` | `/auth/register` | Register a new user     | Public |
| `POST` | `/auth/token`    | Login and get JWT Token | Public |
| `GET`  | `/auth/validate` | Validate a token        | Public |

### Outing Management (Outing Service)
| Method | Endpoint               | Description                     | Access                   |
| :----- | :--------------------- | :------------------------------ | :----------------------- |
| `POST` | `/outing/apply`        | Apply for a gate pass           | `STUDENT`                |
| `GET`  | `/outing/student/{id}` | Get outing history for a student| `STUDENT` / `WARDEN`     |
| `PUT`  | `/outing/approve/{id}` | Approve/Reject an application   | `WARDEN`                 |
| `PUT`  | `/outing/scan/{id}`    | Scan QR and trigger email alert | `GUARD` (Whitelisted IP) |

*Note: All secure endpoints require the HTTP Header: `Authorization: Bearer <your_jwt_token>`*

---

## 👨‍💻 Author
**Shrey Dave** *B.Tech in Cloud Computing and Automation*

---