package com.example.studentcourse.dto

data class LoginResponse(

    val token: String,

    val role: String,

    val studentId: Long? = null,

    val teacherId: Long? = null
)