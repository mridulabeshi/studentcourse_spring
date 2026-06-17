package com.example.studentcourse.controller

import com.example.studentcourse.service.ReportService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/reports")
class ReportController(

    private val reportService: ReportService

) {

    @GetMapping("/dashboard")
    fun dashboard() =
        reportService.getDashboardStats()

    @GetMapping("/top-courses")
    fun topCourses() =
        reportService.getTopCourses()

    @GetMapping("/attendance/{enrollmentId}")
    fun attendanceReport(
        @PathVariable enrollmentId: Long
    ) =
        reportService.getAttendancePercentage(
            enrollmentId
        )

    @GetMapping("/performance/{studentId}")
    fun studentPerformance(
        @PathVariable studentId: Long
    ) =
        reportService.getStudentPerformance(
            studentId
        )
}