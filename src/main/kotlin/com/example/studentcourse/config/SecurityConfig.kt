package com.example.studentcourse.config

import com.example.studentcourse.security.JwtAuthenticationFilter
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter

@Configuration
class SecurityConfig(

    private val jwtFilter: JwtAuthenticationFilter

) {

    @Bean
    fun securityFilterChain(
        http: HttpSecurity
    ): SecurityFilterChain {

        http
            .csrf { it.disable() }

            .sessionManagement {
                it.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            }

            .authorizeHttpRequests {

                it.requestMatchers(
                    "/auth/**"
                ).permitAll()

                it.requestMatchers(
                    "/admin/**"
                ).hasRole("ADMIN")

                it.requestMatchers(
                    "/teacher/**"
                ).hasRole("TEACHER")

                it.requestMatchers(
                    "/student/**"
                ).hasRole("STUDENT")

                it.anyRequest()
                    .authenticated()
            }

            .addFilterBefore(
                jwtFilter,
                UsernamePasswordAuthenticationFilter::class.java
            )

        return http.build()
    }
}