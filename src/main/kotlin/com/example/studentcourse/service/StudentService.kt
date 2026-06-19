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
    fun save(student: Student): Student {

    val count =
        studentRepository
            .findByDepartment(student.department)
            .size + 1

    student.rollNo =
        "${student.department.uppercase()}${1000+count}"

    return studentRepository.save(student)
}
    fun delete(id: Long) = studentRepository.deleteById(id)
    
    fun searchByName(name: String): List<Student> = studentRepository.findByNameContainingIgnoreCase(name)
}