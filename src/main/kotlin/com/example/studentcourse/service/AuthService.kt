package com.example.studentcourse.service

import com.example.studentcourse.dto.LoginRequest
import com.example.studentcourse.dto.LoginResponse
import com.example.studentcourse.repository.StudentRepository
import com.example.studentcourse.repository.TeacherRepository
import com.example.studentcourse.repository.UserRepository
import com.example.studentcourse.security.JwtService
import org.springframework.stereotype.Service

@Service
class AuthService(

    private val userRepository: UserRepository,

    private val studentRepository: StudentRepository,

    private val teacherRepository: TeacherRepository,

    private val jwtService: JwtService

) {

    fun login(
        request: LoginRequest
    ): LoginResponse {

        val user =
            userRepository.findByUsername(
                request.username
            )
                ?: throw RuntimeException(
                    "User not found"
                )

        if(user.password != request.password) {

            throw RuntimeException(
                "Invalid password"
            )
        }

        val token =
            jwtService.generateToken(
                user.username,
                user.role
            )

        return when(user.role) {

            "STUDENT" -> {
                val student = studentRepository.findByRollNo(request.username)  // find by rollNo
                LoginResponse(
                    token = token,
                    role = user.role,
                    studentId = student?.id
                )
            }

           "TEACHER" -> {
                val teacher = teacherRepository.findByEmployeeCode(request.username)
                LoginResponse(
                    token = token,
                    role = user.role,
                    teacherId = teacher?.id
                )
            }

            else -> {

                LoginResponse(
                    token = token,
                    role = user.role
                )
            }
        }
    }
}