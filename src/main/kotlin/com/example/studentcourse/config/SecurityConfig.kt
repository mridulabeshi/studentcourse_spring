package com.example.studentcourse.config

import com.example.studentcourse.security.JwtAuthenticationFilter
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
class SecurityConfig(

    private val jwtFilter: JwtAuthenticationFilter

) {

    @Bean
    fun securityFilterChain(
        http: HttpSecurity
    ): SecurityFilterChain {

        http
            .cors { it.configurationSource(corsConfigurationSource()) }

            .csrf { it.disable() }

            .sessionManagement {
                it.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            }

            .authorizeHttpRequests {

                // Allow all CORS preflight requests — browser sends OPTIONS with no token
                it.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

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

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val config = CorsConfiguration()

        // Your Vite dev server
        config.allowedOrigins = listOf("http://localhost:5173")

        // All methods including OPTIONS for preflight
        config.allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")

        // Allow Authorization header and content-type
        config.allowedHeaders = listOf("*")

        // Allow cookies / credentials
        config.allowCredentials = true

        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", config)
        return source
    }
}