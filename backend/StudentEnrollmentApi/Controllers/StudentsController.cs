using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentEnrollmentApi.Data;
using StudentEnrollmentApi.Models;

namespace StudentEnrollmentApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class StudentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StudentsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,User")]
        public async Task<ActionResult<IEnumerable<Student>>> GetStudents()
        {
            var username = User.Identity?.Name;
            var isAdmin = User.IsInRole("Admin");
            if (isAdmin)
            {
                return await _context.Students.ToListAsync();
            }
            else
            {
                return await _context.Students.Where(s => s.RollNumber == username).ToListAsync();
            }
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,User")]
        public async Task<ActionResult<Student>> GetStudent(int id)
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null) return NotFound();

            var username = User.Identity?.Name;
            var isAdmin = User.IsInRole("Admin");
            if (!isAdmin && student.RollNumber != username)
            {
                return Forbid();
            }
            return student;
        }

        [HttpPost]
        [Authorize(Roles = "Admin,User")]
        public async Task<ActionResult<Student>> PostStudent(StudentCreateDto dto)
        {
            try
            {
                var username = User.Identity?.Name;
                var isAdmin = User.IsInRole("Admin");
                string rollNumber = (isAdmin ? dto.RollNumber : username) ?? string.Empty;

                if (string.IsNullOrEmpty(rollNumber))
                {
                    return BadRequest(new { error = "Roll Number is required." });
                }

                if (await _context.Students.AnyAsync(s => s.RollNumber == rollNumber))
                {
                    return BadRequest(new { error = "A student profile with this Roll Number already exists." });
                }

                var student = new Student
                {
                    RollNumber = rollNumber,
                    FirstName = dto.FirstName,
                    LastName = dto.LastName,
                    Email = dto.Email,
                    Phone = dto.Phone,
                    DateOfBirth = dto.DateOfBirth,
                    EnrollmentDate = DateTime.Now
                };

                _context.Students.Add(student);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetStudent), new { id = student.StudentId }, student);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message, inner = ex.InnerException?.Message, stack = ex.StackTrace });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutStudent(int id, StudentCreateDto dto)
        {
            try
            {
                var student = await _context.Students.FindAsync(id);
                if (student == null) return NotFound();

                student.FirstName = dto.FirstName;
                student.LastName = dto.LastName;
                student.Email = dto.Email;
                student.Phone = dto.Phone;
                student.DateOfBirth = dto.DateOfBirth;

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message, inner = ex.InnerException?.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteStudent(int id)
        {
            try
            {
                var student = await _context.Students.FindAsync(id);
                if (student == null) return NotFound();
                _context.Students.Remove(student);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message, inner = ex.InnerException?.Message });
            }
        }
    }
}
