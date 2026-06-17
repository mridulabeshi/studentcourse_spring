package com.example.studentcourse.service

import com.example.studentcourse.dto.AttendanceReport
import com.example.studentcourse.dto.CourseEnrollmentCount
import com.example.studentcourse.dto.DashboardStats
import com.example.studentcourse.dto.StudentPerformance
import com.example.studentcourse.repository.AttendanceRepository
import com.example.studentcourse.repository.CourseRepository
import com.example.studentcourse.repository.EnrollmentRepository
import com.example.studentcourse.repository.GradeRepository
import com.example.studentcourse.repository.StudentRepository
import org.springframework.stereotype.Service

@Service
class ReportService(

    private val studentRepository: StudentRepository,

    private val courseRepository: CourseRepository,

    private val enrollmentRepository: EnrollmentRepository,

    private val attendanceRepository: AttendanceRepository,

    private val gradeRepository: GradeRepository

) {

    fun getDashboardStats(): DashboardStats {

        return DashboardStats(
            students = studentRepository.count(),
            courses = courseRepository.count(),
            enrollments = enrollmentRepository.count()
        )
    }

    fun getTopCourses(): List<CourseEnrollmentCount> {

        val enrollments = enrollmentRepository.findAll()

        return enrollments
            .groupBy { it.course?.title ?: "Unknown" }
            .map {
                CourseEnrollmentCount(
                    courseTitle = it.key,
                    totalEnrollments = it.value.size.toLong()
                )
            }
            .sortedByDescending {
                it.totalEnrollments
            }
    }

    fun getAttendancePercentage(
        enrollmentId: Long
    ): AttendanceReport {

        val attendanceList =
            attendanceRepository.findByEnrollmentId(
                enrollmentId
            )

        val totalClasses =
            attendanceList.size

        val presentClasses =
            attendanceList.count {
                it.present
            }

        val percentage =
            if (totalClasses == 0)
                0.0
            else
                (presentClasses.toDouble() / totalClasses) * 100

        return AttendanceReport(
            enrollmentId = enrollmentId,
            percentage = percentage
        )
    }

    fun getStudentPerformance(
        studentId: Long
    ): StudentPerformance {

        val grades =
            gradeRepository
                .findByEnrollmentStudentId(
                    studentId
                )

        if (grades.isEmpty()) {
            return StudentPerformance(
                studentId = studentId,
                averageScore = 0.0
            )
        }

        val avg =
            grades.map {

                when (it.grade.uppercase()) {

                    "A+" -> 10
                    "A" -> 9
                    "B+" -> 8
                    "B" -> 7
                    "C" -> 6
                    "D" -> 5

                    else -> 0
                }

            }.average()

        return StudentPerformance(
            studentId = studentId,
            averageScore = avg
        )
    }
}