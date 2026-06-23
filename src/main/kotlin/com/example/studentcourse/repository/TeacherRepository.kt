package com.example.studentcourse.repository

import com.example.studentcourse.model.Teacher
import org.springframework.data.jpa.repository.JpaRepository

interface TeacherRepository :
    JpaRepository<Teacher, Long> {

    fun findByUserId(userId: Long): Teacher?
    fun findByEmployeeCode(employeeCode: String): Teacher?
}