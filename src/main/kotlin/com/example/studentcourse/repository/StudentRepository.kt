package com.example.studentcourse.repository

import com.example.studentcourse.model.Student
import org.springframework.data.jpa.repository.JpaRepository

interface StudentRepository : JpaRepository<Student, Long>{
    fun findByNameContainingIgnoreCase(name:String):List<Student>
    fun findByDepartment(department: String): List<Student>
    fun findByRollNo(rollNo: String): Student?
    fun findByUserId(userId: Long): Student?
}