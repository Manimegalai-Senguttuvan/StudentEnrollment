namespace StudentEnrollmentApi.Models
{
    public class Enrollment
    {
        public int EnrollmentId { get; set; }
        public int StudentId { get; set; }
        public int CourseId { get; set; }
        public DateTime EnrollmentDate { get; set; } = DateTime.Now;
        public string Grade { get; set; } = string.Empty;
        public string Status { get; set; } = "Active";

        public Student Student { get; set; } = null!;
        public Course Course { get; set; } = null!;
    }
}
