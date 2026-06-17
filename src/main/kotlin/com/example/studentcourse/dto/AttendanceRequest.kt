package com.example.studentcourse.dto

data class AttendanceRequest(

    val enrollmentId: Long,

    val present: Boolean
)