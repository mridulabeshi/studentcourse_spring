package com.example.studentcourse.controller

import com.example.studentcourse.dto.AttendanceRequest
import com.example.studentcourse.service.AttendanceService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/attendance")
class AttendanceController(

    private val attendanceService: AttendanceService

) {

    @PostMapping
    fun markAttendance(
        @RequestBody request: AttendanceRequest
    ) =
        attendanceService.markAttendance(request)

    @GetMapping("/{enrollmentId}")
    fun getAttendance(
        @PathVariable enrollmentId: Long
    ) =
        attendanceService.getAttendance(
            enrollmentId
        )

    @GetMapping("/{enrollmentId}/present-count")
    fun getPresentCount(
        @PathVariable enrollmentId: Long
    ) =
        attendanceService.getPresentCount(
            enrollmentId
        )
}