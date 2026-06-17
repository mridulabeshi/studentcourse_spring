package com.example.studentcourse.repository

import com.example.studentcourse.model.Attendance
import org.springframework.data.jpa.repository.JpaRepository

interface AttendanceRepository :
    JpaRepository<Attendance, Long> {

    fun findByEnrollmentId(
        enrollmentId: Long
    ): List<Attendance>

    fun countByEnrollmentIdAndPresentTrue(
        enrollmentId: Long
    ): Long
}