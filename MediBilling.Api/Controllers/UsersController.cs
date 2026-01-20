using MediBilling.Api.Data;
using MediBilling.Api.Domain;
using MediBilling.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MediBilling.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;

    public UsersController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAll()
    {
        var users = await _db.Users
            .Include(u => u.Branch)
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .Select(u => new UserDto(
                u.Id,
                u.Username,
                u.FullName,
                u.Email,
                u.Phone,
                u.IsActive,
                u.BranchId,
                u.Branch != null ? u.Branch.Name : string.Empty,
                u.UserRoles.Select(ur => ur.Role!.Name)
            ))
            .ToListAsync();

        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetById(int id)
    {
        var user = await _db.Users
            .Include(u => u.Branch)
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            return NotFound();
        }

        var dto = new UserDto(
            user.Id,
            user.Username,
            user.FullName,
            user.Email,
            user.Phone,
            user.IsActive,
            user.BranchId,
            user.Branch != null ? user.Branch.Name : string.Empty,
            user.UserRoles.Select(ur => ur.Role!.Name)
        );

        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> Create([FromBody] CreateUserDto request)
    {
        if (await _db.Users.AnyAsync(u => u.Username == request.Username))
        {
            return BadRequest("Username already exists.");
        }

        var user = new User
        {
            Username = request.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = request.FullName,

            Email = request.Email,
            Phone = request.Phone,
            BranchId = request.BranchId,
            IsActive = true
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        foreach (var roleId in request.RoleIds)
        {
            _db.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = roleId });
        }

        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = user.Id }, await GetById(user.Id));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateUserDto request)
    {
        var user = await _db.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            return NotFound();
        }

        user.FullName = request.FullName;
        user.Email = request.Email;
        user.Phone = request.Phone;
        user.BranchId = request.BranchId;
        user.IsActive = request.IsActive;

        // Update roles
        var currentRoles = await _db.UserRoles.Where(ur => ur.UserId == id).ToListAsync();
        _db.UserRoles.RemoveRange(currentRoles);

        foreach (var roleId in request.RoleIds)
        {
            _db.UserRoles.Add(new UserRole { UserId = id, RoleId = roleId });
        }

        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound();
        }

        user.IsActive = false;
        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("roles")]
    public async Task<ActionResult<IEnumerable<Role>>> GetRoles()
    {
        return Ok(await _db.Roles.ToListAsync());
    }
}
