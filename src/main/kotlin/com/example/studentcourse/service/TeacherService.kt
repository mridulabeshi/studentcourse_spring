package com.example.studentcourse.service

import com.example.studentcourse.model.Teacher
import com.example.studentcourse.repository.TeacherRepository
import org.springframework.stereotype.Service

@Service
class TeacherService(

    private val teacherRepository: TeacherRepository

) {

    fun getAll(): List<Teacher> =
        teacherRepository.findAll()

    fun getById(
        id: Long
    ): Teacher =
        teacherRepository.findById(id)
            .orElseThrow {
                RuntimeException(
                    "Teacher not found"
                )
            }

    fun create(
        teacher: Teacher
    ): Teacher =
        teacherRepository.save(teacher)

    fun update(
        id: Long,
        updatedTeacher: Teacher
    ): Teacher {

        val teacher =
            getById(id)

        teacher.employeeCode =
            updatedTeacher.employeeCode

        teacher.name =
            updatedTeacher.name

        teacher.user =
            updatedTeacher.user

        return teacherRepository.save(
            teacher
        )
    }

    fun delete(
        id: Long
    ) {

        if(
            !teacherRepository.existsById(id)
        ) {
            throw RuntimeException(
                "Teacher not found"
            )
        }

        teacherRepository.deleteById(id)
    }
}