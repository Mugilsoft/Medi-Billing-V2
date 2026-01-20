using MediBilling.Api.Data;
using MediBilling.Api.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MediBilling.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BranchesController : ControllerBase
{
    private readonly AppDbContext _db;

    public BranchesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Branch>>> GetAll()
    {
        var branches = await _db.Branches
            .Where(b => b.IsActive)
            .OrderBy(b => b.Name)
            .ToListAsync();

        return Ok(branches);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Branch>> GetById(int id)
    {
        var branch = await _db.Branches.FindAsync(id);

        if (branch == null)
        {
            return NotFound();
        }

        return Ok(branch);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Branch>> Create([FromBody] Branch branch)
    {
        if (string.IsNullOrWhiteSpace(branch.Code) || string.IsNullOrWhiteSpace(branch.Name))
        {
            return BadRequest("Code and Name are required.");
        }

        // Check for duplicate code
        var exists = await _db.Branches.AnyAsync(b => b.Code == branch.Code);
        if (exists)
        {
            return BadRequest($"Branch with code '{branch.Code}' already exists.");
        }

        branch.IsActive = true;
        _db.Branches.Add(branch);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = branch.Id }, branch);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] Branch branch)
    {
        if (id != branch.Id)
        {
            return BadRequest("ID mismatch.");
        }

        var existing = await _db.Branches.FindAsync(id);
        if (existing == null)
        {
            return NotFound();
        }

        // Check for duplicate code (excluding current branch)
        var duplicateCode = await _db.Branches
            .AnyAsync(b => b.Code == branch.Code && b.Id != id);
        if (duplicateCode)
        {
            return BadRequest($"Branch with code '{branch.Code}' already exists.");
        }

        existing.Code = branch.Code;
        existing.Name = branch.Name;
        existing.AddressLine1 = branch.AddressLine1;
        existing.AddressLine2 = branch.AddressLine2;
        existing.City = branch.City;
        existing.State = branch.State;
        existing.Country = branch.Country;
        existing.PostalCode = branch.PostalCode;
        existing.Phone = branch.Phone;
        existing.IsActive = branch.IsActive;

        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var branch = await _db.Branches.FindAsync(id);
        if (branch == null)
        {
            return NotFound();
        }

        // Soft delete - just mark as inactive
        branch.IsActive = false;
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
