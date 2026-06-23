package com.example.studentcourse.security

import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.stereotype.Service
import java.util.*

@Service
class JwtService {

    private val secret = "mysecretkeymysecretkeymysecretkey12345"

    private val key = Keys.hmacShaKeyFor( secret.toByteArray())

    fun generateToken(username: String, role: String): String {
        return Jwts.builder()
            .subject(username)
            .claim("role", role)
            .issuedAt(Date())
            .expiration(Date(System.currentTimeMillis()+ 86400000))
            .signWith(key)
            .compact()
    }
    
    fun extractRole(token: String): String {
        return Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .payload
            .get("role",String::class.java)
    }
    
    fun extractUsername(token: String): String {
        return Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .payload
            .subject
    }
}