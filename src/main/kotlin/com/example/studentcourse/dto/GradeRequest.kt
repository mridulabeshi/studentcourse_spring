package com.example.studentcourse.dto

data class GradeRequest(

    val enrollmentId: Long,

    val grade: String,

    val semester: String
)
