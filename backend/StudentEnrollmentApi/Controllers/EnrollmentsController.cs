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
    public class EnrollmentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EnrollmentsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,User")]
        public async Task<ActionResult<IEnumerable<Enrollment>>> GetEnrollments()
        {
            var username = User.Identity?.Name;
            var isAdmin = User.IsInRole("Admin");
            if (isAdmin)
            {
                return await _context.Enrollments.ToListAsync();
            }
            else
            {
                return await _context.Enrollments
                    .Include(e => e.Student)
                    .Where(e => e.Student.RollNumber == username)
                    .ToListAsync();
            }
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,User")]
        public async Task<ActionResult<Enrollment>> GetEnrollment(int id)
        {
            var enrollment = await _context.Enrollments
                .Include(e => e.Student)
                .FirstOrDefaultAsync(e => e.EnrollmentId == id);

            if (enrollment == null) return NotFound();

            var username = User.Identity?.Name;
            var isAdmin = User.IsInRole("Admin");
            if (!isAdmin && enrollment.Student.RollNumber != username)
            {
                return Forbid();
            }
            return enrollment;
        }

        [HttpPost]
        [Authorize(Roles = "Admin,User")]
        public async Task<ActionResult<Enrollment>> PostEnrollment(EnrollmentCreateDto dto)
        {
            try
            {
                var username = User.Identity?.Name;
                var isAdmin = User.IsInRole("Admin");
                int studentId;

                if (isAdmin)
                {
                    studentId = dto.StudentId;
                }
                else
                {
                    var student = await _context.Students.FirstOrDefaultAsync(s => s.RollNumber == username);
                    if (student == null)
                    {
                        return BadRequest(new { error = "Please complete your student profile before enrolling in courses." });
                    }
                    studentId = student.StudentId;
                }

                // Check if already enrolled in this course
                if (await _context.Enrollments.AnyAsync(e => e.StudentId == studentId && e.CourseId == dto.CourseId))
                {
                    return BadRequest(new { error = "You are already enrolled in this course." });
                }

                // Check course capacity
                var course = await _context.Courses.FindAsync(dto.CourseId);
                if (course == null) return NotFound(new { error = "Course not found." });

                var enrollmentCount = await _context.Enrollments.CountAsync(e => e.CourseId == dto.CourseId && e.Status == "Active");
                if (enrollmentCount >= course.MaxCapacity)
                {
                    return BadRequest(new { error = "This course has reached its maximum capacity." });
                }

                var enrollment = new Enrollment
                {
                    StudentId = studentId,
                    CourseId = dto.CourseId,
                    Grade = isAdmin ? dto.Grade : "", // Students cannot assign grades to themselves
                    Status = "Active",
                    EnrollmentDate = DateTime.Now
                };

                _context.Enrollments.Add(enrollment);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetEnrollment), new { id = enrollment.EnrollmentId }, enrollment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message, inner = ex.InnerException?.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutEnrollment(int id, EnrollmentCreateDto dto)
        {
            try
            {
                var enrollment = await _context.Enrollments.FindAsync(id);
                if (enrollment == null) return NotFound();

                enrollment.StudentId = dto.StudentId;
                enrollment.CourseId = dto.CourseId;
                enrollment.Grade = dto.Grade;
                enrollment.Status = dto.Status;

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
        public async Task<IActionResult> DeleteEnrollment(int id)
        {
            try
            {
                var enrollment = await _context.Enrollments.FindAsync(id);
                if (enrollment == null) return NotFound();
                _context.Enrollments.Remove(enrollment);
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
