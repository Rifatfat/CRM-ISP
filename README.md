# CRM ISP Frontend

A web-based Customer Relationship Management (CRM) system for Internet Service Providers (ISP). This project focuses on managing customers, subscriptions, billing, and support tickets using a multi-role system.

## Overview

This application is designed to simulate a real-world CRM system with multiple user roles and operational workflows. The system uses mocked data and is intended for frontend development and system design exploration.

## Features

* Authentication (mocked)
* Multi-role system:

  * Admin
  * Finance
  * Technician
  * Customer
* Role-based dashboard
* Customer management
* Subscription tracking
* Invoice and payment management
* Ticketing system
* Notification system (simulated)

## Tech Stack

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* shadcn/ui
* react-hook-form
* zod
* Vitest
* Playwright

## Project Structure

```
src/
  app/            # Routing (App Router)
  components/     # UI components
  services/       # Mock service layer
  types/          # Type definitions
  lib/            # Utilities
```

## Installation

```
npm install
npm run dev
```

Open in browser:

```
http://localhost:3000
```

## Notes

* This project uses mocked data and does not include backend integration.
* Designed to simulate real CRM workflows.
* Suitable for further development into a fullstack system.

## Future Improvements

* Backend integration (REST API / Laravel)
* Real database implementation
* Authentication with JWT
* Notification system (email / push)
* Performance optimization

## Author

Rifat
Informatics Student
