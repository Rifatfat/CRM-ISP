# PRD — Customer Relationship Management (CRM) System for ISP

---

## 1. Overview

Sistem CRM berbasis web untuk ISP yang digunakan untuk mengelola pelanggan, subscription, billing, dan ticketing secara terpusat.

### Problem

* Pengelolaan pelanggan manual
* Billing tidak otomatis
* Sulit tracking status pelanggan
* Ticket tidak terorganisir

### Goals

* Centralized data
* Automated billing
* Improve efficiency
* Better customer service

---

## 2. Requirements

### Platform

* Web-based

### User Roles

* Admin
* Finance
* Technician
* Customer

### Constraints

* Sistem simulasi (no real payment gateway)
* Notifikasi simulasi

---

## 3. User Persona

### Admin

* Manage system & customer data

### Finance

* Generate invoice
* Track payment
* Handle overdue

### Technician

* Handle tickets
* Resolve issues

### Customer

* Pay bills
* Report issues

---

## 4. Core Features

1. Authentication & Role Management
2. Subscription Lifecycle Management
3. Billing & Invoice Generator
4. Notification System
5. Trouble Ticketing System

---

## 5. User Flow

1. Login
2. Dashboard
3. Manage customer
4. Generate invoice
5. Payment processing
6. Ticket handling
7. Update subscription status

---

## 6. Database Schema

### users

* id (PK)
* email (unique)
* password_hash
* role (admin, finance, technician)
* created_at

### customers

* id
* name
* email
* address
* status (active, suspended)
* created_at

### subscriptions

* id
* customer_id (FK)
* plan
* price
* status (active, grace_period, suspended)
* start_date
* end_date

### invoices

* id
* customer_id (FK)
* amount
* status (unpaid, paid, overdue)
* due_date
* created_at
* UNIQUE (customer_id, due_date)

### payments

* id
* invoice_id (FK)
* amount
* method
* paid_at

### tickets

* id
* customer_id (FK)
* issue
* status (open, assigned, resolved)
* assigned_to (FK users.id)
* created_at

### notifications

* id
* user_id (FK)
* message
* type
* created_at

---

## 7. API Specification

### AUTH

POST /api/auth/login

request:
{
"email": "string",
"password": "string"
}

response:
{
"token": "jwt",
"role": "admin"
}

---

### CUSTOMER

GET /api/customers
POST /api/customers

POST request:
{
"name": "string",
"email": "string",
"address": "string"
}

---

### SUBSCRIPTION

POST /api/subscriptions

---

### INVOICE

GET /api/invoices
POST /api/invoices/generate

request:
{
"customer_id": 1,
"month": "2026-04"
}

---

### PAYMENT

POST /api/payments

request:
{
"invoice_id": 1,
"amount": 300000,
"method": "transfer"
}

---

### TICKET

POST /api/tickets
PATCH /api/tickets/{id}

---

### NOTIFICATION

GET /api/notifications

---

## 8. KPI / Success Metrics

* User ≤ 50,000
* Uptime ≥ 99%
* API response < 500ms
* Invoice accuracy ≥ 99%
* Ticket resolution < 24h

---

## 9. Business Rules

### Billing

* Invoice dibuat tiap bulan
* 1 customer hanya 1 invoice per periode

### Payment

* Payment valid → invoice = paid

### Subscription

* > 30 hari unpaid → grace_period
* > 60 hari unpaid → suspended

### Ticket

* Harus assigned sebelum resolved

---

## 10. State Machine

### Subscription

active → grace_period → suspended

### Invoice

unpaid → paid
unpaid → overdue

### Ticket

open → assigned → resolved

---

## 11. Edge Cases

* Late payment → auto reminder + suspend
* Duplicate invoice → prevent via unique constraint
* Unhandled ticket → auto escalation

---

## 12. Error Handling

* 400 → bad request
* 401 → unauthorized
* 404 → not found
* 409 → duplicate
* 500 → server error

---

## 13. Non-Functional Requirements

### Security

* JWT auth
* bcrypt password
* role-based access

### Performance

* < 500ms response
* pagination
* DB indexing

### Scalability

* modular architecture
* ready for cache & queue

---

## 14. Architecture

Frontend → Backend → Database (MySQL)

---

## 15. Folder Structure

/app
/controllers
/services
/models
/routes
/middlewares

---
