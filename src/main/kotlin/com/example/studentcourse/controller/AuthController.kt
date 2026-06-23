package com.example.studentcourse.controller

import com.example.studentcourse.dto.LoginRequest
import com.example.studentcourse.dto.LoginResponse
import com.example.studentcourse.service.AuthService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/auth")
class AuthController(

    private val authService: AuthService

) {

    @PostMapping("/login")
    fun login(
        @RequestBody request: LoginRequest
    ): LoginResponse {

        return authService.login(
            request
        )
    }
}