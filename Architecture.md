# Architecture.md

## Project Overview

Project name: **Klinik Makmur Jaya - Web-Based Medicine E-Commerce System**

This project is a Laravel monolith with React pages rendered through Inertia.js. It supports medicine catalog browsing, customer checkout, prescription upload and verification, offline cashier/POS transactions, stock and batch management, Midtrans payment handling, admin reporting, notifications, audit logs, and error logs.

This document reflects the implementation currently present in the repository as of **2026-06-05**. Items marked as partial or planned should not be treated as completed features.

## Current Stack

| Area | Current Implementation |
|---|---|
| Backend | Laravel `^13.7`, PHP `^8.3` |
| Frontend | React `^19.2`, TypeScript, Inertia.js `^3.0` |
| Styling | Tailwind CSS `^4` |
| Auth/RBAC | Laravel session auth, email verification, Spatie Laravel Permission |
| Database | Local `.env` uses MySQL; `.env.example` defaults to SQLite |
| Session/Cache/Queue | Database-backed session, cache, and queue |
| Payments | Midtrans service + webhook endpoint |
| PDF | `barryvdh/laravel-dompdf` |
| Excel/CSV | `maatwebsite/excel` |
| Notifications | Laravel database/mail notification classes plus backend broadcast event |
| Realtime | Laravel Reverb + Laravel Echo on private notification channels, with polling fallback |

## Implementation Status

### Implemented

- Multi-role authentication for `admin`, `apoteker`, `kasir`, and `pasien`.
- Customer registration, login, logout, email verification, and session keep-alive route.
- Role-based route groups using Spatie role middleware.
- Admin dashboard, master data pages, order list/export, audit log, and error log pages.
- Medicine, category, supplier, and user management.
- Customer dashboard, catalog, catalog autocomplete, cart, checkout, order list, order detail, and pay action.
- Prescription upload during checkout when prescription-only medicines are present.
- Apoteker dashboard, batch entry, stock movement view, prescription queue, prescription history, prescription verification, and order readiness flow.
- Cashier dashboard, POS cart flow, POS checkout, and online payment monitoring page.
- FIFO stock deduction through `StockService` using `medicine_batches.remaining_quantity` ordered by `expired_at`.
- Online order creation through `CheckoutService`.
- Offline POS order creation and immediate stock deduction through `CheckoutService::processOfflineCheckout`.
- Midtrans payment service, webhook controller, and background webhook processing job.
- Report export controllers and jobs for PDF/Excel generation.
- Medicine import job.
- Critical stock and expiring medicine check jobs.
- Audit logging middleware/service and error logging through exception reporting.
- Laravel database notifications and notification classes for order, stock, expiry, job status, and application error events.

### Partially Implemented

- **Dashboard realtime behavior:** notification badges are refreshed by Reverb events and polling fallback, while most dashboard metrics are still refreshed through normal Inertia reload/navigation.
- **Reports:** order export/report background jobs exist, but the broader report catalog is implemented around order/sales reporting rather than every report type originally proposed.
- **Validation layer:** controllers and services validate important flows, but there are no dedicated Form Request classes in the current repo.

### Not Currently Implemented

- Separate `api.php` route file for application features.
- Dedicated `customers`, `prescriptions`, `payments`, `offline_sales`, `offline_sale_items`, `medicine_images`, or `system_configs` tables.
- Separate `PrescriptionService`, `ReportService`, or `ErrorLogService` classes.
- Chart.js integration.

## High-Level Architecture

```text
Browser
  |
  | HTTP / Inertia request
  v
Laravel web routes
  |
  v
Middleware
  |-- auth
  |-- verified
  |-- role middleware
  |-- CSRF protection
  |-- security headers
  |-- audit activity middleware
  v
Controllers
  |
  |-- services
  |-- models
  |-- jobs
  |-- notifications
  v
Database / Storage / Queue / Mail / Broadcast log
  |
  v
Inertia response
  |
  v
React + TypeScript pages
```

## Backend Structure

Current backend structure:

```text
app/
├── Events/
│   └── NotificationCreated.php
├── Exports/
│   └── OrdersExport.php
├── Http/
│   ├── Controllers/
│   │   ├── Admin/
│   │   ├── Apoteker/
│   │   ├── Auth/
│   │   ├── Cashier/
│   │   ├── Customer/
│   │   ├── MidtransWebhookController.php
│   │   └── NotificationController.php
│   └── Middleware/
├── Imports/
│   └── MedicinesImport.php
├── Jobs/
├── Models/
├── Notifications/
└── Services/
```

Current services:

```text
AuditLogService
CartService
CheckoutService
MidtransPaymentService
NotificationDispatchService
OrderService
StockService
```

Current jobs:

```text
CheckCriticalStockJob
CheckExpiringMedicineJob
GenerateSalesReportExcelJob
GenerateSalesReportPdfJob
ImportMedicinesJob
ProcessMidtransNotificationJob
```

## Frontend Structure

Current frontend structure:

```text
resources/js/
├── Layouts/
│   └── AppLayout.tsx
├── components/
│   └── FileUploadField.tsx
├── lib/
├── pages/
│   ├── Admin/
│   ├── Auth/
│   ├── Cashier/
│   ├── Customer/
│   ├── Pharmacist/
│   └── welcome.tsx
├── types/
├── utils/
└── app.tsx
```

The UI uses TypeScript/React pages grouped by role. Laravel remains the source of truth for routing, access control, persistence, and business logic.

## Routes

All application routes are currently defined in `routes/web.php`, with broadcast channel authorization in `routes/channels.php`.

### Public and Auth Routes

- `/` redirects authenticated users to the appropriate role dashboard and guests to login.
- `/login`, `/register`, `/logout`
- `/email/verify`, `/email/verify/{id}/{hash}`, `/email/verification-notification`
- `/session/keep-alive`
- `/notifications/read-all`
- `/payments/midtrans/notification` for Midtrans webhook notifications.

### Admin Routes

Prefix: `/admin`

- Dashboard
- Category CRUD
- Supplier CRUD
- Medicine CRUD and import
- User CRUD
- Order list
- Order export/download/status endpoints
- Audit log page
- Error log page

### Apoteker Routes

Prefix: `/pharmacist`

- Dashboard
- Batch index/store
- Stock movement index
- Order index
- Bulk ready and mark ready actions
- Prescription queue, verification, and history

### Cashier Routes

Prefix: `/cashier`

- Dashboard
- POS index/add/update/clear/checkout
- Payment monitoring page

### Customer Routes

Prefix: `/customer`

- Dashboard
- Catalog index/autocomplete/show
- Cart index/add/update/remove
- Checkout index/store
- Orders index/show/pay

## Database Tables

Tables currently represented by migrations:

```text
users
password_reset_tokens
sessions
cache
cache_locks
jobs
job_batches
failed_jobs
roles
permissions
model_has_roles
model_has_permissions
role_has_permissions
categories
suppliers
medicines
medicine_batches
stock_movements
orders
order_items
audit_logs
error_logs
notifications
report_jobs
```

The system currently stores both online orders and POS orders in the `orders` table. POS orders use an order number prefix such as `POS-`; online orders use `ORD-`.

## Core Domain Modules

### Authentication and Authorization

- Laravel session authentication is used.
- Customers can register.
- Email verification is required for customer routes.
- Roles are handled with Spatie Laravel Permission.
- Route middleware restricts each role area.
- Important user activity is captured by `AuditUserActivity` and `AuditLogService`.

Main roles:

```text
admin
apoteker
kasir
pasien
```

### Medicine Catalog

Customer catalog functionality is implemented through:

```text
app/Http/Controllers/Customer/CatalogController.php
resources/js/pages/Customer/Catalog/Index.tsx
resources/js/pages/Customer/Catalog/Show.tsx
```

Supported behavior includes listing, search/autocomplete, filtering/sorting through controller data, medicine detail, stock visibility, and prescription requirement visibility.

### Cart and Checkout

Implemented through:

```text
app/Services/CartService.php
app/Services/CheckoutService.php
app/Http/Controllers/Customer/CartController.php
app/Http/Controllers/Customer/CheckoutController.php
```

Checkout validates cart contents, verifies stock using `StockService`, requires prescription image for prescription-only medicines, creates `orders` and `order_items`, clears the cart, and notifies Apoteker when prescription verification is needed.

### Prescription Verification

Implemented through:

```text
app/Http/Controllers/Apoteker/PrescriptionController.php
app/Services/OrderService.php
resources/js/pages/Pharmacist/Prescriptions/Index.tsx
resources/js/pages/Pharmacist/Prescriptions/History.tsx
```

Apoteker can approve or reject prescriptions. Approval moves the order toward payment; rejection sets `prescription_rejected` and stores the rejection reason in order notes.

### Stock and Batch Management

Implemented through:

```text
app/Services/StockService.php
app/Http/Controllers/Apoteker/MedicineBatchController.php
app/Http/Controllers/Apoteker/StockMovementController.php
```

Stock is tracked per batch in `medicine_batches`. Stock deduction uses FIFO by `expired_at`, locks matching batch rows, prevents negative stock, and writes `stock_movements` records.

### Offline Cashier/POS

Implemented through:

```text
app/Http/Controllers/Cashier/PosController.php
app/Services/CheckoutService.php
resources/js/pages/Cashier/POS/Index.tsx
```

POS checkout creates a paid and completed `orders` record with a `POS-` order number, creates order items, and deducts stock immediately.

### Online Order and Payment Flow

Implemented through:

```text
app/Services/OrderService.php
app/Services/MidtransPaymentService.php
app/Http/Controllers/Customer/OrderController.php
app/Http/Controllers/MidtransWebhookController.php
app/Jobs/ProcessMidtransNotificationJob.php
```

Online orders use Midtrans fields on the `orders` table. Webhook processing validates the Midtrans order number and gross amount, updates payment status, deducts stock on new paid notifications, and moves paid orders to processing.

### Admin Reporting and Export

Implemented through:

```text
app/Http/Controllers/Admin/ReportController.php
app/Http/Controllers/Admin/OrderController.php
app/Exports/OrdersExport.php
app/Jobs/GenerateSalesReportExcelJob.php
app/Jobs/GenerateSalesReportPdfJob.php
app/Models/ReportJob.php
```

Admin can view dashboard metrics, export order data, generate PDF/Excel reports in the background, poll report job status, and download generated reports.

### Notifications and Alerts

Notification classes exist under `app/Notifications/` for:

- Application errors.
- Critical stock.
- Expiring batches.
- New prescription orders.
- New processing orders.
- Order status updates.
- System job status.

`NotificationDispatchService` deduplicates database notifications by `dedupe_key` and emits the `NotificationCreated` backend event when `toDatabase` is available.

### Audit and Error Logging

Audit logging is implemented through:

```text
app/Services/AuditLogService.php
app/Http/Middleware/AuditUserActivity.php
app/Models/AuditLog.php
```

Error logging is implemented through:

```text
app/Models/ErrorLog.php
app/Notifications/AppErrorNotification.php
bootstrap/app.php exception reporting hook
```

Important exceptions are captured by the application exception configuration and can be surfaced to Admin through logs/notifications.

## Status Values

Order statuses currently used in services/controllers include:

```text
waiting_prescription_verification
waiting_payment
paid
processing
ready_to_pickup
completed
cancelled
prescription_rejected
```

Payment statuses currently used include:

```text
unpaid
pending
paid
failed
```

Prescription statuses currently used include:

```text
pending
approved
rejected
```

## Business Rules

### Stock Rules

- Stock is calculated from `medicine_batches.remaining_quantity`.
- Stock deduction must go through `StockService`.
- FIFO uses the earliest `expired_at` batch first.
- Stock deduction is wrapped in a database transaction.
- Matching batch rows are locked during deduction.
- Stock cannot be deducted beyond available quantity.
- Every stock deduction creates `stock_movements` rows.
- Critical stock checks are dispatched after stock changes.

### Prescription Rules

- Medicines marked as requiring prescription need a prescription image during checkout.
- Orders containing prescription-only medicines start as `waiting_prescription_verification`.
- Apoteker approval changes the order to `waiting_payment`.
- Apoteker rejection changes the order to `prescription_rejected` and stores the reason in notes.

### Payment Rules

- Online orders are configured for Midtrans.
- Midtrans webhook endpoint: `/payments/midtrans/notification`.
- Webhook processing validates order number and gross amount.
- Paid online orders deduct stock and move to `processing`.
- Failed/expired/cancelled Midtrans notifications mark unpaid orders as failed/cancelled.
- POS orders are paid immediately and completed in the same transaction.

### Security Rules

- Web routes use CSRF protection except the Midtrans webhook endpoint.
- Role access is enforced on Laravel routes.
- Customer routes require authenticated and verified users.
- File upload flows should validate type and size before storing.
- Frontend checks are only user experience helpers; server-side checks remain required.

## Realtime Status

Current realtime-related implementation:

```text
app/Events/NotificationCreated.php
routes/channels.php
bootstrap/app.php ->withBroadcasting(...)
config/broadcasting.php reverb connection
config/reverb.php
resources/js/echo.ts
resources/js/Layouts/AppLayout.tsx private channel subscription
composer dev runs php artisan reverb:start
```

Current private channel:

```text
user-notifications.{userId}
```

Current event alias:

```text
notification.created
```

Reverb is implemented for application notifications:

- `laravel/reverb` is installed through Composer.
- `config/broadcasting.php` defines the `reverb` broadcast connection.
- Local `.env` and `.env.example` use `BROADCAST_CONNECTION=reverb`.
- `package.json` includes `laravel-echo` and `pusher-js`.
- `resources/js/app.tsx` imports `resources/js/echo.ts`.
- `AppLayout` subscribes to `user-notifications.{userId}` through Echo's private channel API.
- Incoming `notification.created` events trigger a toast and refresh the shared `notifications` and `navNotifications` Inertia props.

Polling remains active as a fallback so notifications still update if the WebSocket server is unavailable.

## Queue and Background Jobs

The project uses the database queue. Local `.env` sets:

```text
QUEUE_CONNECTION=database
```

Queue command:

```bash
php artisan queue:work
```

Current background jobs cover import, report generation, stock checks, expiring batch checks, and Midtrans webhook processing.

## Current Page Map

### Admin

```text
/admin/dashboard
/admin/categories
/admin/suppliers
/admin/medicines
/admin/users
/admin/orders
/admin/audit-logs
/admin/error-logs
```

### Apoteker

```text
/pharmacist/dashboard
/pharmacist/batches
/pharmacist/movements
/pharmacist/orders
/pharmacist/prescriptions
/pharmacist/prescription-history
```

### Cashier

```text
/cashier/dashboard
/cashier/pos
/cashier/payments
```

### Customer

```text
/customer/dashboard
/customer/catalog
/customer/catalog/{medicine}
/customer/cart
/customer/checkout
/customer/orders
/customer/orders/{order_number}
```

## Development Workflow

Useful local commands:

```bash
composer install
npm install
php artisan migrate
composer dev
php artisan queue:work
npm run build
composer test
```

The `composer dev` script currently starts Laravel serve, queue listener, Reverb, Pail logs, and Vite.

## Testing Scope

Minimum manual/regression checks for the current implementation:

- Login/logout by role.
- Customer registration and email verification.
- Admin medicine/category/supplier/user CRUD.
- Medicine import.
- Customer catalog search/detail.
- Customer cart and checkout with and without prescription-only medicines.
- Apoteker prescription approval/rejection.
- Midtrans payment action and webhook handling.
- Cashier POS checkout.
- FIFO stock deduction and stock movement creation.
- Critical stock and expiring medicine jobs.
- Admin order export and background report generation.
- Audit log creation.
- Error log creation.
- Notification creation and mark-all-read.

## AI Agent Instructions

When modifying or generating code for this project, follow these rules:

1. Use Laravel + React + Inertia architecture.
2. Keep role names consistent: `admin`, `apoteker`, `kasir`, `pasien`.
3. Keep actor names consistent: Admin, Apoteker, Kasir, Pasien/Pelanggan.
4. Put business logic in Laravel services/jobs/models, not in React components.
5. Prefer existing services before adding new abstractions.
6. Use `StockService` for all stock calculations and FIFO deductions.
7. Use database transactions for checkout, POS sales, payment completion, prescription verification, and stock updates.
8. Do not allow stock to become negative.
9. Record important actions in audit logs.
10. Record important exceptions in error logs.
11. Use queue jobs for import, report generation, Midtrans webhook work, and long-running tasks.
12. Use Laravel Storage for uploaded files.
13. Validate uploaded prescription and medicine files.
14. Use clear Indonesian labels in the UI because this project is for Klinik Makmur Jaya.
15. Use English for code identifiers unless the existing code already uses Indonesian identifiers.
16. Keep database table names in English and snake_case.
17. Keep Reverb documentation aligned with the actual backend config, Reverb server script, frontend Echo initialization, and UI subscriptions.
18. Keep code simple enough for project demonstration and certification assessment.

## Out of Scope

Do not implement these unless explicitly requested:

- Native mobile application.
- Real courier integration.
- OCR prescription reading.
- Machine learning prescription validation.
- Full electronic medical record integration.
- Third-party professional security audit.
- Cloud-native microservices architecture.
