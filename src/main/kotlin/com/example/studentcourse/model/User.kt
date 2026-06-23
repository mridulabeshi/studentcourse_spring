package com.example.studentcourse.model

import jakarta.persistence.*

@Entity
@Table(name = "users")
data class User(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(unique = true)
    var username: String = "",

    var password: String = "",

    var role: String = ""
)