# Medi Billing System

**Full-Stack Billing & Inventory Management System**  
Built with **Angular 17** (UI) and **.NET Core 9.0** (Web API).

---

## Features

### API (MediBilling.Api)
- User authentication & role management (Admin, Pharmacist)
- Manage branches, suppliers, medicines, stock, purchases, sales, reports
- Prescription handling and purchase/sales tracking
- SQL Server database with Entity Framework Core
- JWT-based authentication
- Secure and scalable architecture

### UI (medi-billing-ui)
- Angular 17 front-end
- Admin dashboard & management panels
- CRUD operations for branches, users, stock, medicines, purchases, sales
- Responsive design
- Angular services with HttpClient for API integration
- Role-based route guards

---

## Getting Started

### Prerequisites
- [Node.js 20+](https://nodejs.org/)
- [Angular CLI](https://angular.io/cli)
- [.NET 9.0 SDK](https://dotnet.microsoft.com/download)
- SQL Server / LocalDB

### Setup API
```bash
cd MediBilling.Api
dotnet restore
dotnet ef database update
dotnet run
