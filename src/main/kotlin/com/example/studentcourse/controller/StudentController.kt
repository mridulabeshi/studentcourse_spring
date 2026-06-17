package com.example.studentcourse.controller

import com.example.studentcourse.model.Student
import com.example.studentcourse.service.StudentService
import org.springframework.web.bind.annotation.*


@RestController
@RequestMapping("/students")
class StudentController(
    private val studentService: StudentService
) {
    
    @GetMapping
    fun getAll() = studentService.getAllStudents()
    
    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long) = studentService.getStudentById(id)
    
    @PostMapping
    fun create(@RequestBody student: Student) = studentService.save(student)
    
    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @RequestBody student: Student): Student {
        val existing = studentService.getStudentById(id)
        val updated = existing.copy(name = student.name, email = student.email)
        return studentService.save(updated)
    }
    
    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long) = studentService.delete(id)
    
    @GetMapping("/search")
    fun search( @RequestParam name: String): List<Student> {
        return studentService.searchByName(name)
    }

}