package com.example.studentcourse.service

import com.example.studentcourse.repository.StudentRepository
import com.example.studentcourse.model.Student
import org.springframework.stereotype.Service

@Service
class StudentService(
    private val studentRepository: StudentRepository
){
    fun getAllStudents() : List<Student> = studentRepository.findAll()
    fun getStudentById(id: Long): Student = studentRepository.findById(id).orElseThrow { RuntimeException("Student not found") }
    fun save(student: Student): Student = studentRepository.save(student)
    fun delete(id: Long) = studentRepository.deleteById(id)
    
    fun searchByName(name: String): List<Student> = studentRepository.findByNameContainingIgnoreCase(name)
}