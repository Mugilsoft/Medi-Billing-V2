using MediBilling.Api.Domain;
using MediBilling.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace MediBilling.Api.Data;

public class AppDbContext : DbContext
{
    private readonly ICurrentUserService? _currentUserService;

    public AppDbContext(DbContextOptions<AppDbContext> options, ICurrentUserService? currentUserService = null) : base(options)
    {
        _currentUserService = currentUserService;
    }

    public DbSet<Branch> Branches => Set<Branch>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();

    public DbSet<Medicine> Medicines => Set<Medicine>();
    public DbSet<StockBatch> StockBatches => Set<StockBatch>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();

    public DbSet<Doctor> Doctors => Set<Doctor>();
    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<Prescription> Prescriptions => Set<Prescription>();
    public DbSet<PrescriptionItem> PrescriptionItems => Set<PrescriptionItem>();

    public DbSet<SaleInvoice> SaleInvoices => Set<SaleInvoice>();
    public DbSet<SaleInvoiceItem> SaleInvoiceItems => Set<SaleInvoiceItem>();
    public DbSet<Purchase> Purchases => Set<Purchase>();
    public DbSet<PurchaseItem> PurchaseItems => Set<PurchaseItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<UserRole>()
            .HasKey(ur => new { ur.UserId, ur.RoleId });

        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.User)
            .WithMany(u => u.UserRoles)
            .HasForeignKey(ur => ur.UserId);

        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.Role)
            .WithMany(r => r.UserRoles)
            .HasForeignKey(ur => ur.RoleId);

        // Global Query Filters for Multi-Branch Isolation
        var currentBranchId = _currentUserService?.BranchId ?? 0;
        var isAdmin = _currentUserService?.IsAdmin ?? false;

        if (!isAdmin && currentBranchId > 0)
        {
            modelBuilder.Entity<StockBatch>().HasQueryFilter(x => x.BranchId == currentBranchId);
            modelBuilder.Entity<SaleInvoice>().HasQueryFilter(x => x.BranchId == currentBranchId);
            modelBuilder.Entity<Purchase>().HasQueryFilter(x => x.BranchId == currentBranchId);
            modelBuilder.Entity<User>().HasQueryFilter(x => x.BranchId == currentBranchId);
            modelBuilder.Entity<Supplier>().HasQueryFilter(x => x.BranchId == null || x.BranchId == currentBranchId);
        }

        // Seed basic data: one branch, one admin role, one admin user
        modelBuilder.Entity<Branch>().HasData(new Branch
        {
            Id = 1,
            Code = "MAIN",
            Name = "Main Branch",
            City = "Head Office",
            IsActive = true
        });

        modelBuilder.Entity<Role>().HasData(new Role
        {
            Id = 1,
            Name = "Admin",
            Description = "System administrator"
        });

        modelBuilder.Entity<User>().HasData(new User
        {
            Id = 1,
            Username = "admin",
            // NOTE: plain text for now; replace with hashed password in production
            PasswordHash = "admin123",
            FullName = "System Administrator",
            Email = "admin@example.com",
            IsActive = true,
            BranchId = 1
        });

        modelBuilder.Entity<UserRole>().HasData(new UserRole
        {
            UserId = 1,
            RoleId = 1
        });

        modelBuilder.Entity<SaleInvoiceItem>()
            .HasOne(sii => sii.StockBatch)
            .WithMany()
            .HasForeignKey(sii => sii.StockBatchId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<PurchaseItem>()
            .HasOne(pi => pi.Branch)
            .WithMany()
            .HasForeignKey(pi => pi.BranchId)
            .OnDelete(DeleteBehavior.NoAction);

        // Performance Indexes
        modelBuilder.Entity<Medicine>().HasIndex(m => m.Name);
        modelBuilder.Entity<Medicine>().HasIndex(m => m.Code).IsUnique();
        modelBuilder.Entity<StockBatch>().HasIndex(sb => sb.MedicineId);
        modelBuilder.Entity<StockBatch>().HasIndex(sb => sb.ExpiryDate);
        modelBuilder.Entity<SaleInvoice>().HasIndex(si => si.InvoiceNumber).IsUnique();
        modelBuilder.Entity<SaleInvoice>().HasIndex(si => si.InvoiceDate);
        modelBuilder.Entity<Purchase>().HasIndex(p => p.InvoiceNumber);
        modelBuilder.Entity<User>().HasIndex(u => u.Username).IsUnique();
    }
}


