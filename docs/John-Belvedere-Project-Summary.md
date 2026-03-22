# John Belvedere Ordering System

Project Summary and Workflow Document

Prepared for: Business Owner
Prepared on: 2026-03-22

## 1. Project Overview

This project is a dine-in digital ordering platform for John Belvedere. Customers can browse the menu, create an account, place orders, choose payment method, and track order progress. Restaurant staff can manage menu items, monitor live orders, update payment status, download vouchers, review daily reports, and receive on-site order alerts.

The system is split into two applications:

- Frontend: React + Vite customer/admin interface
- Backend: Node.js + Express + MongoDB API

The platform has also been prepared for deployment with:

- Frontend on Netlify
- Backend on Railway
- Cloudinary for image hosting
- Stripe Checkout in test mode

## 2. Main Modules Implemented

### Customer Side

- Menu browsing with category filtering
- Add to cart flow
- Visible add-to-cart notification feedback
- Customer registration and login
- Customer account dashboard
- Live order history and current order tracking
- Counter checkout flow
- Stripe Checkout flow in test mode
- Voucher download for customer orders

### Admin Side

- Admin login with approved phone-number based access
- Admin dashboard for live order management
- Order status update controls
- Payment status update controls
- In-site new order notification system
- New order sound alert for admins
- Menu management page
- User management page
- Daily order and income reporting page
- Voucher download for admin orders

### Backend/API Side

- Auth and protected routes
- Cookie-based session handling
- Menu CRUD endpoints
- Order creation and update endpoints
- Daily report endpoint
- Stripe Checkout session creation endpoint
- Stripe webhook handler for payment confirmation
- Environment validation for critical server configuration

## 3. Completed Workflow

### Customer Ordering Workflow

1. Customer opens the menu page.
2. Customer browses menu categories and items.
3. Customer clicks Add to cart.
4. The system gives visible feedback that the item was added.
5. Customer reviews cart contents.
6. Customer chooses either:
   - Cash at counter
   - Stripe payment
7. If counter is selected:
   - Order is created immediately
   - Payment status remains unpaid
8. If Stripe is selected:
   - Order is created first
   - Customer is redirected to Stripe Checkout
   - After successful payment, the order is marked paid
9. Customer returns to the success page.
10. Customer can later view the order in their dashboard and download a voucher.

### Admin Operations Workflow

1. Admin logs in through the restricted admin access page.
2. Admin opens the live dashboard.
3. New incoming orders appear automatically during polling refresh.
4. Admin receives:
   - In-site visual alert
   - Toast notification
   - Sound alert
5. Admin updates:
   - Kitchen/order status
   - Payment status
6. Admin can manage menu items and upload images through Cloudinary.
7. Admin can review all users.
8. Admin can open the Daily Reports page to check:
   - Number of orders
   - Number of paid orders
   - Number of unpaid orders
   - Recognized income
   - Payment mix
9. Admin can download vouchers for record keeping.

## 4. Payment Workflow

### Counter Payment

- Customer places order
- Order is created with payment status unpaid
- Staff can later mark it paid from admin dashboard
- Paid orders are counted in business reporting only after payment status is updated

### Stripe Payment

- Customer selects Stripe payment
- Backend creates the order first
- Backend creates Stripe Checkout Session
- Customer pays on Stripe Checkout page
- Stripe redirects customer to success page
- Stripe webhook confirms successful payment
- Backend marks the related order as paid automatically
- Paid Stripe orders appear correctly in admin reporting

## 5. Reporting Logic

The reporting page has been designed so that only paid orders contribute to recognized income. This is important for business accuracy.

Included in income:

- Orders with paymentStatus = paid

Excluded from income until payment is confirmed:

- Counter orders still marked unpaid
- Any unpaid order

This ensures daily figures are aligned with actual received payments.

## 6. Deployment Status

### Frontend

- Prepared for Netlify deployment
- SPA redirect support added
- Production API environment variable structure prepared

### Backend

- Prepared for Railway deployment
- CORS configured for deployed frontend origin
- Auth cookie configuration adapted for production
- Startup environment validation added

## 7. Integrations Implemented

- MongoDB database
- Cloudinary image uploads for menu items
- Stripe Checkout in test mode
- Stripe webhook-based payment confirmation

## 8. Business Value Delivered

The project now provides a real operational base for a restaurant ordering flow instead of a demo-only interface. It supports actual order intake, menu administration, reporting visibility, and modern payment workflow preparation.

Key value delivered:

- Reduced manual ordering friction for dine-in customers
- Faster operational visibility for restaurant staff
- Cleaner distinction between paid and unpaid revenue
- Admin control over menu, orders, and users
- Downloadable order vouchers for records
- Foundation for future production payment launch

## 9. Current Notes / Test-Phase State

- Stripe is integrated in test mode
- Email sending can be enabled later if required
- A custom branded mail domain can be added later if business access is provided
- Browser audio policies may require one admin interaction before sound alerts are audible

## 10. Recommended Next Steps

### Immediate

- Verify Stripe webhook behavior on deployed production environment
- Confirm paid status updates after real test transactions
- Confirm admin alert behavior during live order placement

### Short-Term

- Add branded email domain access if the business provides DNS control
- Replace any remaining test-mode messaging where needed
- Perform final owner acceptance testing

### Commercial Handover

This system is already at a stage where it can be presented as a delivered product with:

- Completed customer ordering flow
- Completed admin operations flow
- Completed reporting logic
- Completed Stripe test integration
- Deployed frontend/backend structure

This document can be used as a handover summary and as supporting material for payment collection or milestone confirmation with the owner.

## 11. Summary

The John Belvedere ordering platform now includes customer ordering, admin management, Stripe payment flow in test mode, reporting, voucher download, menu maintenance, and operational alerts. The site has moved beyond a static interface and now functions as a working restaurant ordering system with live operational features and deployment readiness.
