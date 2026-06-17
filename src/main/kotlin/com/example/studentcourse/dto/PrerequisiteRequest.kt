package com.example.studentcourse.dto

data class PrerequisiteRequest(
    val courseId: Long,
    val prerequisiteCourseId: Long
)
