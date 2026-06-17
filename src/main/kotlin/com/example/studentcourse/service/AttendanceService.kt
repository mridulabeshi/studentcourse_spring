package com.example.studentcourse.service

import com.example.studentcourse.dto.AttendanceRequest
import com.example.studentcourse.model.Attendance
import com.example.studentcourse.repository.AttendanceRepository
import com.example.studentcourse.repository.EnrollmentRepository
import org.springframework.stereotype.Service

@Service
class AttendanceService(

    private val attendanceRepository: AttendanceRepository,

    private val enrollmentRepository: EnrollmentRepository

) {

    fun markAttendance(
        request: AttendanceRequest
    ): Attendance {

        val enrollment =
            enrollmentRepository.findById(
                request.enrollmentId
            ).orElseThrow()

        return attendanceRepository.save(
            Attendance(
                enrollment = enrollment,
                present = request.present
            )
        )
    }

    fun getAttendance(
        enrollmentId: Long
    ) =
        attendanceRepository.findByEnrollmentId(
            enrollmentId
        )

    fun getPresentCount(
        enrollmentId: Long
    ) =
        attendanceRepository
            .countByEnrollmentIdAndPresentTrue(
                enrollmentId
            )
}