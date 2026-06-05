# Architecture.md

## Project Overview

Project name: **Klinik Makmur Jaya – Web-Based Medicine E-Commerce System**

This project is a web application for managing medicine sales at Klinik Makmur Jaya. The application supports online medicine purchasing, offline cashier transactions, medicine stock management, prescription verification, sales reports, notifications, audit logging, and error monitoring.

The project is built using a fixed stack:

- **Backend:** Laravel
- **Frontend:** React
- **Bridge:** Inertia.js
- **Database:** MySQL
- **Authentication and Authorization:** Laravel authentication, middleware, and Spatie Laravel Permission
- **Queue:** Laravel database queue
- **Realtime:** Laravel Reverb / Laravel Broadcasting
- **PDF Export:** DomPDF
- **Excel/CSV Import:** Maatwebsite Excel
- **Charts:** Chart.js or React chart wrapper
- **File Storage:** Laravel Storage

The system is a prototype for certification/project demonstration, not a full production clinic system.

---

## Main Goals

The application must provide:

1. Multi-role authentication for Admin, Apoteker, Kasir, and Pasien/Pelanggan.
2. Medicine catalog with search, filter, product detail, image preview, and stock visibility.
3. Online purchasing flow using cart, checkout, Midtrans payment gateway integration, and prescription upload.
4. Offline cashier transaction flow (POS) integrated with the same stock system.
5. Medicine stock management using FIFO logic based on medicine batch expiration date.
6. Prescription verification by Apoteker for medicines that require a prescription.
7. Dashboard for sales, stock, revenue, critical stock, expiring medicine, and order monitoring.
8. Notifications for order status, critical stock, expiring medicine, and application errors.
9. Reports with SQL-based summaries, background PDF/Excel exports, and import capabilities.
10. Audit log and error log for system traceability.
11. Queue/background job implementation for import, report generation, stock update, and Midtrans webhook notifications.

---

## User Roles

The application only uses these four main actors.

| Role | Main Access |
|---|---|
| Admin | Manage users, roles, medicines, categories, suppliers, customers, reports, audit logs, error logs, and system configuration. |
| Apoteker | Manage medicine stock, medicine batches, prescription verification, order processing, critical stock notifications, and expiring medicines. |
| Kasir | Process offline sales transactions, view stock availability, print transaction summary, and update offline payment status. |
| Pasien/Pelanggan | Register, login, view catalog, search medicine, manage cart, checkout, upload prescription, and monitor order status. |

---

## High-Level Architecture

Use a Laravel monolith with React pages through Inertia.js.

```text
Browser
  |
  | HTTP request
  v
Laravel Routes
  |
  v
Controller Layer
  |
  |-- Form Request Validation
  |-- Authorization / Middleware
  |-- Service Classes
  |-- Eloquent Models
  |
  v
Database / Storage / Queue / Broadcasting
  |
  v
Inertia Response
  |
  v
React Pages and Components
```

### Architecture Rules

- Laravel is the source of truth for routing, validation, authorization, business logic, database operations, and queue jobs.
- React is responsible for UI rendering, forms, tables, modals, charts, and user interactions.
- Inertia.js is used to connect Laravel routes to React pages without creating a separate REST API for every page.
- Use API routes only when needed for asynchronous actions, autocomplete, realtime polling fallback, or external-style endpoints.
- Keep business logic out of React components. Put it in Laravel services, actions, jobs, policies, and models.

---

## Recommended Folder Structure

### Laravel Backend

```text
app/
├── Actions/
│   ├── Orders/
│   ├── Stock/
│   ├── Reports/
│   └── Prescriptions/
├── Enums/
├── Events/
├── Exceptions/
├── Http/
│   ├── Controllers/
│   │   ├── Admin/
│   │   ├── Apoteker/
│   │   ├── Cashier/
│   │   ├── Customer/
│   │   └── Auth/
│   ├── Middleware/
│   ├── Requests/
│   └── Resources/
├── Jobs/
├── Listeners/
├── Models/
├── Notifications/
├── Policies/
├── Services/
│   ├── CartService.php
│   ├── CheckoutService.php
│   ├── StockService.php
│   ├── PrescriptionService.php
│   ├── ReportService.php
│   └── AuditLogService.php
└── Support/
```

### React Frontend

```text
resources/js/
├── Components/
│   ├── Common/
│   ├── Forms/
│   ├── Tables/
│   ├── Charts/
│   ├── Layouts/
│   └── Notifications/
├── Pages/
│   ├── Admin/
│   ├── Pharmacist/
│   ├── Cashier/
│   ├── Customer/
│   ├── Auth/
│   └── Dashboard/
├── Hooks/
├── Lib/
├── Types/
└── app.jsx
```

### Routes

```text
routes/
├── web.php
├── api.php
├── auth.php
└── channels.php
```

Use route groups by role:

```php
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    // Admin routes
});

Route::middleware(['auth', 'role:apoteker'])->prefix('pharmacist')->name('pharmacist.')->group(function () {
    // Apoteker routes
});

Route::middleware(['auth', 'role:kasir'])->prefix('kasir')->name('kasir.')->group(function () {
    // Kasir routes
});

Route::middleware(['auth', 'role:pasien'])->prefix('customer')->name('customer.')->group(function () {
    // Customer routes
});
```

---

## Core Modules

### 1. Authentication and Authorization

Required features:

- Login
- Logout
- Customer registration
- Email verification if implemented
- Password hashing using Laravel default hashing
- Role-based middleware
- Permission-based access using Spatie Laravel Permission
- Session timeout
- Audit logging for important user actions

Main roles:

- `admin`
- `apoteker`
- `kasir`
- `pasien`

Recommended permissions:

```text
manage-users
manage-roles
manage-medicines
manage-categories
manage-suppliers
manage-customers
manage-stock
verify-prescriptions
process-online-orders
process-offline-sales
view-reports
export-reports
view-audit-logs
view-error-logs
manage-system-config
```

---

### 2. Medicine Catalog

Used by Pasien/Pelanggan.

Features:

- List medicines
- Search by name/code
- Filter by category
- Sort by price/name/stock
- View medicine detail
- Show image preview
- Show stock availability
- Show whether prescription is required

Frontend pages:

```text
resources/js/Pages/Customer/Catalog/Index.jsx
resources/js/Pages/Customer/Catalog/Show.jsx
```

Backend controllers:

```text
app/Http/Controllers/Customer/CatalogController.php
```

---

### 3. Cart and Checkout

Used by Pasien/Pelanggan.

Features:

- Add medicine to cart
- Update quantity
- Remove item
- Calculate subtotal and total
- Validate stock before checkout
- Require prescription upload if cart contains prescription-only medicine
- Create order
- Integrate with Midtrans payment gateway
- Send notification to customer and apoteker

Important rule:

- Cart validation must happen again during checkout. Do not rely only on frontend validation.

Recommended service:

```text
app/Services/CartService.php
app/Services/CheckoutService.php
```

---

### 4. Prescription Verification

Used by Apoteker.

Features:

- View orders requiring prescription verification
- View uploaded prescription file
- Approve prescription
- Reject prescription with reason
- Continue order processing if approved
- Notify customer about verification result

Prescription status:

```text
pending
approved
rejected
```

Order status related to prescription:

```text
waiting_prescription_verification
prescription_rejected
processing
```

---

### 5. Stock and Batch Management

Used by Admin and Apoteker.

Main concept:

- Medicine stock is stored per batch.
- Each batch has quantity and expiration date.
- Stock deduction must use FIFO by earliest expiration date.

Important tables:

- `medicines`
- `medicine_batches`
- `stock_movements`

FIFO logic:

1. Get medicine batches with available quantity.
2. Sort by earliest expiration date.
3. Deduct from the earliest batch first.
4. Continue to the next batch until requested quantity is fulfilled.
5. Create stock movement records for traceability.
6. Run inside database transaction.

Recommended service:

```text
app/Services/StockService.php
```

Important rule:

- Any stock deduction must use `StockService`.
- Do not deduct stock directly inside controllers.

---

### 6. Offline Cashier Transaction

Used by Kasir.

Features:

- Search medicine by name or code
- Add medicine to offline transaction
- Validate stock
- Calculate total
- Complete direct payment
- Deduct stock using FIFO
- Create sales transaction
- Update dashboard data

Frontend pages:

```text
resources/js/Pages/Cashier/Pos/Index.jsx
resources/js/Pages/Cashier/Dashboard.jsx
```

Backend controllers:

```text
app/Http/Controllers/Cashier/PosController.php
```

---

### 7. Order Management

Used by Admin and Apoteker.

Order statuses:

```text
waiting_payment
waiting_prescription_verification
paid
processing
ready_to_pickup
completed
cancelled
prescription_rejected
```

Payment statuses:

```text
unpaid
paid
failed
refunded
```

Order rules:

- Order is created after checkout.
- If order contains prescription-only medicine, status becomes `waiting_prescription_verification`.
- If no prescription is required, status becomes `waiting_payment` and processed via Midtrans, or `paid` for POS offline transactions.
- Stock is deducted only when order is approved and ready to be processed.
- All order status changes must be logged.

---

### 8. Dashboard and Reports

Used by Admin, Apoteker, and Kasir depending on role.

Dashboard widgets:

- Total daily sales
- Total monthly sales
- Total revenue
- Critical stock count
- Expiring medicine count
- New online orders
- Pending prescription verification
- Recent transactions
- Error summary

Reports:

- Sales report
- Best-selling medicines
- Expiring medicines
- Stock movement report
- Transaction recap

Export:

- PDF using DomPDF (includes background queue jobs)
- Excel/CSV import/export using Maatwebsite Excel (includes background queue jobs)

Recommended service:

```text
app/Services/ReportService.php
```

---

### 9. Notifications and Alerts

Notification types:

- Critical stock alert
- Expiring medicine alert
- New order notification
- Prescription verification result
- Order status update
- Application error notification

Notification channels:

- Database notification
- Email notification if configured
- Realtime broadcast if implemented

Use Laravel notifications:

```text
app/Notifications/
```

Use Laravel events for realtime updates:

```text
app/Events/
```

---

### 10. Queue and Background Jobs

Use Laravel database queue.

Queue jobs:

- Import medicine CSV/Excel
- Generate large sales report
- Send notifications
- Process Midtrans webhook notifications
- Update stock after order processing
- Check expiring medicine
- Check critical stock

Important rule:

- Long-running processes must not run directly inside HTTP request if they can block the UI.

Commands:

```bash
php artisan queue:work
```

---

### 11. Audit Log and Error Log

Audit log records user activity.

Recommended audit fields:

```text
id
user_id
action
module
description
ip_address
user_agent
created_at
```

Examples:

- User logged in
- Admin created medicine
- Apoteker approved prescription
- Kasir completed offline transaction
- Stock deducted
- Report exported

Error log records application errors.

Recommended error fields:

```text
id
severity
message
file
line
trace_summary
user_id
url
method
created_at
```

Severity:

```text
info
warning
critical
```

---

## Suggested Database Tables

Use these table names consistently.

```text
users
roles
permissions
model_has_roles
model_has_permissions
role_has_permissions
categories
suppliers
medicines
medicine_images
medicine_batches
stock_movements
customers
prescriptions
orders
order_items
payments
offline_sales
offline_sale_items
notifications
audit_logs
error_logs
system_configs
jobs
failed_jobs
```

### Key Table Notes

#### users

Stores all authenticated users, including admin, apoteker, kasir, and pasien.

#### medicines

Stores medicine master data.

Important fields:

```text
id
category_id
supplier_id
code
name
description
composition
dosage
side_effects
price
minimum_stock
requires_prescription
is_active
created_at
updated_at
```

#### medicine_batches

Stores stock per batch.

Important fields:

```text
id
medicine_id
batch_number
quantity
remaining_quantity
expired_at
purchase_price
received_at
created_at
updated_at
```

#### stock_movements

Stores every stock in/out movement.

Important fields:

```text
id
medicine_id
medicine_batch_id
movement_type
quantity
reference_type
reference_id
notes
created_by
created_at
```

#### orders

Stores online customer orders.

Important fields:

```text
id
user_id
order_number
total_amount
order_status
payment_status
prescription_status
notes
created_at
updated_at
```

#### order_items

Stores order details.

Important fields:

```text
id
order_id
medicine_id
quantity
price
subtotal
created_at
updated_at
```

---

## Business Rules

### Stock Rules

- Stock must be calculated from `medicine_batches.remaining_quantity`.
- Stock deduction must use FIFO based on `expired_at` ascending.
- Stock cannot become negative.
- Stock deduction must be wrapped inside database transaction.
- Every stock change must create a `stock_movements` record.
- Critical stock alert is triggered when total stock is below `medicines.minimum_stock`.

### Prescription Rules

- Medicine with `requires_prescription = true` requires prescription upload during checkout.
- Prescription must be verified by Apoteker.
- Rejected prescription stops order processing.
- Approved prescription allows order to continue.

### Order Rules

- Customer can only access their own orders.
- Apoteker can process online orders.
- Admin can view all orders and reports.
- Status changes must be recorded in audit log.

### Payment Rules

- Terintegrasi dengan payment gateway Midtrans untuk pesanan online.
- Sistem menggunakan webhook notification untuk menerima update status dari Midtrans (`/payments/midtrans/notification`).
- Pembayaran offline menggunakan Point of Sales (POS) oleh kasir dengan status pembayaran instan.
- Payment status must be stored separately from order status.

### Security Rules

- Use Laravel validation for all inputs.
- Use CSRF protection for web forms.
- Use authorization checks in controllers or policies.
- Never trust role checks from frontend only.
- Use Eloquent or query builder parameter binding to prevent SQL injection.
- Escape rendered user content in React.
- Uploaded files must be validated by type and size.

---

## Page Structure

### Admin Pages

```text
/admin/dashboard
/admin/users
/admin/roles
/admin/medicines
/admin/categories
/admin/suppliers
/admin/customers
/admin/orders
/admin/reports
/admin/audit-logs
/admin/error-logs
/admin/settings
```

### Apoteker Pages

```text
/pharmacist/dashboard
/pharmacist/movements
/pharmacist/batches
/pharmacist/prescriptions
/pharmacist/orders
/pharmacist/prescription-history
```

### Kasir Pages

```text
/cashier/dashboard
/cashier/pos
/cashier/payments
```

### Customer Pages

```text
/
/catalog
/catalog/{medicine}
/cart
/checkout
/orders
/orders/{order}
/profile
```

---

## Controller Guidelines

Controllers should be thin.

Controller responsibilities:

- Receive request
- Call Form Request validation
- Check authorization
- Call service/action
- Return Inertia response or redirect

Controllers should not contain:

- FIFO stock logic
- Complex SQL report logic
- Import processing logic
- Notification orchestration
- Long-running tasks

Put these in services, actions, or jobs.

---

## Service Guidelines

Use service classes for business logic.

Recommended services:

```text
CartService
CheckoutService
StockService
PrescriptionService
OrderService
ReportService
NotificationService
AuditLogService
ErrorLogService
```

Example service method names:

```php
StockService::getAvailableStock($medicineId)
StockService::deductUsingFifo($medicineId, $quantity, $reference)
CheckoutService::checkout(User $user, array $payload)
PrescriptionService::approve(Prescription $prescription, User $apoteker)
ReportService::getSalesSummary(array $filters)
AuditLogService::record(User $user, string $action, string $module, string $description)
```

---

## React Guidelines

React components should be UI-focused.

Rules:

- Use Inertia forms for page-level form submissions.
- Keep reusable components in `resources/js/Components`.
- Keep pages grouped by role.
- Avoid placing business rules only in React.
- Use frontend validation only for user experience; backend validation remains mandatory.
- Use clear names for props and components.

Recommended components:

```text
DataTable
SearchInput
FilterBar
StatusBadge
Modal
ConfirmDialog
MedicineCard
MedicineForm
OrderStatusBadge
ChartCard
NotificationDropdown
FileUploadInput
```

---

## Validation Rules

Use Form Request classes.

Examples:

```text
StoreMedicineRequest
UpdateMedicineRequest
StoreCategoryRequest
StoreSupplierRequest
CheckoutRequest
UploadPrescriptionRequest
StoreOfflineSaleRequest
ImportMedicineRequest
UpdateOrderStatusRequest
VerifyPrescriptionRequest
```

Validation must cover:

- Required fields
- Data type
- Numeric range
- File type and size
- Unique medicine code
- Existing foreign keys
- Quantity must be positive
- Stock availability during checkout/sale

---

## Authorization Rules

Use middleware, policies, and permissions.

Layering:

1. Route middleware checks authentication and role.
2. Controller or policy checks permission/action.
3. Service validates ownership or business constraint.

Example:

- Pasien can only view their own orders.
- Apoteker can verify prescriptions.
- Kasir can create offline sales.
- Admin can access reports and logs.

---

## Realtime Design

Use Laravel Broadcasting with Reverb.

Realtime events:

```text
OrderCreated
OrderStatusUpdated
StockCritical
MedicineExpiringSoon
ApplicationErrorOccurred
```

Fallback:

- If realtime is not active in the demo environment, use polling from React every few seconds for dashboard widgets and notifications.

---

## Import and Export Design

### Import Medicine

Use Maatwebsite Excel.

Import flow:

1. Admin uploads CSV/Excel file.
2. Laravel validates file type and size.
3. Import job is dispatched to queue.
4. Each row is validated.
5. Valid rows are inserted or updated.
6. Invalid rows are logged.
7. Admin receives import result notification.

### Export Report

Use DomPDF for PDF export.

Export flow:

1. Admin selects report filter.
2. System queries report data.
3. System renders PDF view.
4. PDF is downloaded or stored.

---

## Error Handling

Use standard Laravel exception handling.

Additional rule:

- Important exceptions must be recorded in `error_logs`.
- Critical errors must notify Admin.
- User-facing messages must be clear but not expose stack trace.

Example user-facing error:

```text
Stok obat tidak mencukupi untuk memproses transaksi.
```

Avoid exposing:

```text
SQLSTATE error, stack trace, file path, internal server config
```

---

## Development Workflow

Use Git.

Recommended branches:

```text
main
develop
feature/auth
feature/catalog
feature/cart-checkout
feature/stock-fifo
feature/cashier-sale
feature/reports
feature/notifications
feature/import-export
```

Commit style:

```text
feat: add medicine catalog page
fix: prevent negative stock on checkout
refactor: move fifo logic to stock service
docs: update architecture documentation
```

---

## Testing Scope

Minimum tests/manual checks:

- Login by role
- Admin medicine CRUD
- Apoteker prescription verification
- Customer cart and checkout
- Kasir offline transaction
- FIFO stock deduction
- Critical stock alert
- Expiring medicine alert
- PDF report export
- CSV/Excel import
- Audit log creation
- Error log recording

---

## AI Agent Instructions

When modifying or generating code for this project, follow these rules:

1. Use Laravel + React + Inertia architecture.
2. Do not replace the chosen stack with another framework.
3. Do not suggest alternative tools unless explicitly asked.
4. Keep role names consistent: `admin`, `apoteker`, `kasir`, `pasien`.
5. Keep actor names consistent: Admin, Apoteker, Kasir, Pasien/Pelanggan.
6. Put business logic in Laravel services/actions/jobs, not in React components.
7. Use Form Request classes for validation.
8. Use middleware/policies/permissions for access control.
9. Use `StockService` for all stock calculations and FIFO deductions.
10. Use database transactions for checkout, offline sales, prescription approval that affects order status, and stock updates.
11. Do not allow stock to become negative.
12. Record important actions in audit log.
13. Record important exceptions in error log.
14. Use queue jobs for import, report generation, notifications, and long-running tasks.
15. Use Laravel Storage for uploaded files.
16. Validate uploaded prescription and medicine image files.
17. Use clear Indonesian labels in the UI because this project is for Klinik Makmur Jaya.
18. Use English for code identifiers unless the existing codebase already uses Indonesian identifiers.
19. Keep database table names in English and snake_case.
20. Keep code simple enough for project demonstration and certification assessment.

---

## Out of Scope

Do not implement these unless explicitly requested:

- Native mobile application
- Real courier integration
- OCR prescription reading
- Machine learning prescription validation
- Full electronic medical record integration
- Third-party professional security audit
- Cloud-native microservices architecture
