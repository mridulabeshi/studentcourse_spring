package com.example.studentcourse.security

import com.example.studentcourse.service.JwtService
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtAuthenticationFilter(

    private val jwtService: JwtService

) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {

        val authHeader =
            request.getHeader("Authorization")

        if (
            authHeader == null ||
            !authHeader.startsWith("Bearer ")
        ) {

            filterChain.doFilter(
                request,
                response
            )
            return
        }

        val token =
            authHeader.substring(7)

        try {

            val username =
                jwtService.extractUsername(
                    token
                )

            val role =
                jwtService.extractRole(
                    token
                )

            val auth =
                UsernamePasswordAuthenticationToken(
                    username,
                    null,
                    listOf(
                        SimpleGrantedAuthority(
                            "ROLE_$role"
                        )
                    )
                )

            SecurityContextHolder
                .getContext()
                .authentication = auth

        } catch (e: Exception) {

            response.status = 401
            return
        }

        filterChain.doFilter(
            request,
            response
        )
    }
}