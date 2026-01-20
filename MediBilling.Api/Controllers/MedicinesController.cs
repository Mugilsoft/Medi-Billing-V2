using MediBilling.Api.Data;
using MediBilling.Api.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MediBilling.Api.DTOs;


namespace MediBilling.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MedicinesController : ControllerBase
{
    private readonly AppDbContext _db;

    public MedicinesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MedicineDto>>> GetAll()
    {
        var medicines = await _db.Medicines
            .Where(m => m.IsActive)
            .OrderBy(m => m.Name)
            .Select(m => new MedicineDto
            {
                Id = m.Id,
                Code = m.Code,
                Name = m.Name,
                GenericName = m.GenericName,
                Manufacturer = m.Manufacturer,
                Unit = m.Unit,
                GstPercentage = m.GstPercentage,
                IsActive = m.IsActive
            })
            .ToListAsync();

        return Ok(medicines);
    }


    [HttpGet("{id}")]
    public async Task<ActionResult<Medicine>> GetById(int id)
    {
        var medicine = await _db.Medicines.FindAsync(id);

        if (medicine == null)
        {
            return NotFound();
        }

        return Ok(medicine);
    }

    [HttpPost]
    public async Task<ActionResult<Medicine>> Create([FromBody] Medicine medicine)
    {
        if (string.IsNullOrWhiteSpace(medicine.Code) || string.IsNullOrWhiteSpace(medicine.Name))
        {
            return BadRequest("Code and Name are required.");
        }

        // Check for duplicate code
        var exists = await _db.Medicines.AnyAsync(m => m.Code == medicine.Code);
        if (exists)
        {
            return BadRequest($"Medicine with code '{medicine.Code}' already exists.");
        }

        medicine.IsActive = true;
        _db.Medicines.Add(medicine);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = medicine.Id }, medicine);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Medicine medicine)
    {
        if (id != medicine.Id)
        {
            return BadRequest("ID mismatch.");
        }

        var existing = await _db.Medicines.FindAsync(id);
        if (existing == null)
        {
            return NotFound();
        }

        // Check for duplicate code (excluding current medicine)
        var duplicateCode = await _db.Medicines
            .AnyAsync(m => m.Code == medicine.Code && m.Id != id);
        if (duplicateCode)
        {
            return BadRequest($"Medicine with code '{medicine.Code}' already exists.");
        }

        existing.Code = medicine.Code;
        existing.Name = medicine.Name;
        existing.GenericName = medicine.GenericName;
        existing.Manufacturer = medicine.Manufacturer;
        existing.Unit = medicine.Unit;
        existing.GstPercentage = medicine.GstPercentage;
        existing.IsActive = medicine.IsActive;

        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var medicine = await _db.Medicines.FindAsync(id);
        if (medicine == null)
        {
            return NotFound();
        }

        // Soft delete - just mark as inactive
        medicine.IsActive = false;
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
