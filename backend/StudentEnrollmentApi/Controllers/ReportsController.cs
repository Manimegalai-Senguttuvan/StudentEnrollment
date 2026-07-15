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
    public class ReportsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReportsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("student-enrollments")]
        [Authorize(Roles = "Admin,User")]
        public async Task<ActionResult<IEnumerable<StudentEnrollmentDto>>> GetStudentEnrollments()
        {
            var username = User.Identity?.Name;
            var isAdmin = User.IsInRole("Admin");

            var query = from e in _context.Enrollments
                        join s in _context.Students on e.StudentId equals s.StudentId
                        join c in _context.Courses on e.CourseId equals c.CourseId
                        where isAdmin || s.RollNumber == username
                        select new StudentEnrollmentDto
                        {
                            EnrollmentId = e.EnrollmentId,
                            EnrollmentDate = e.EnrollmentDate,
                            Grade = e.Grade,
                            Status = e.Status,
                            StudentId = s.StudentId,
                            StudentFirstName = s.FirstName,
                            StudentLastName = s.LastName,
                            StudentEmail = s.Email,
                            CourseId = c.CourseId,
                            CourseName = c.CourseName,
                            CourseCode = c.CourseCode,
                            Credits = c.Credits,
                            Instructor = c.Instructor
                        };

            return await query.ToListAsync();
        }

        [HttpGet("student-enrollments/{studentId}")]
        [Authorize(Roles = "Admin,User")]
        public async Task<ActionResult<IEnumerable<StudentEnrollmentDto>>> GetStudentEnrollmentsByStudent(int studentId)
        {
            var username = User.Identity?.Name;
            var isAdmin = User.IsInRole("Admin");

            var query = from e in _context.Enrollments
                        join s in _context.Students on e.StudentId equals s.StudentId
                        join c in _context.Courses on e.CourseId equals c.CourseId
                        where s.StudentId == studentId && (isAdmin || s.RollNumber == username)
                        select new StudentEnrollmentDto
                        {
                            EnrollmentId = e.EnrollmentId,
                            EnrollmentDate = e.EnrollmentDate,
                            Grade = e.Grade,
                            Status = e.Status,
                            StudentId = s.StudentId,
                            StudentFirstName = s.FirstName,
                            StudentLastName = s.LastName,
                            StudentEmail = s.Email,
                            CourseId = c.CourseId,
                            CourseName = c.CourseName,
                            CourseCode = c.CourseCode,
                            Credits = c.Credits,
                            Instructor = c.Instructor
                        };

            return await query.ToListAsync();
        }

        [HttpGet("course-enrollments/{courseId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<StudentEnrollmentDto>>> GetCourseEnrollments(int courseId)
        {
            var query = from e in _context.Enrollments
                        join s in _context.Students on e.StudentId equals s.StudentId
                        join c in _context.Courses on e.CourseId equals c.CourseId
                        where c.CourseId == courseId
                        select new StudentEnrollmentDto
                        {
                            EnrollmentId = e.EnrollmentId,
                            EnrollmentDate = e.EnrollmentDate,
                            Grade = e.Grade,
                            Status = e.Status,
                            StudentId = s.StudentId,
                            StudentFirstName = s.FirstName,
                            StudentLastName = s.LastName,
                            StudentEmail = s.Email,
                            CourseId = c.CourseId,
                            CourseName = c.CourseName,
                            CourseCode = c.CourseCode,
                            Credits = c.Credits,
                            Instructor = c.Instructor
                        };

            return await query.ToListAsync();
        }
    }
}
