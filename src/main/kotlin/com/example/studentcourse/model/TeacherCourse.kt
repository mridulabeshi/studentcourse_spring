package com.example.studentcourse.model

import jakarta.persistence.*

@Entity 
@Table(name = "teacher_courses") 
data class TeacherCourse( 
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    val id: Long = 0, 
    
    @ManyToOne 
    @JoinColumn(name = "teacher_id") 
    var teacher: Teacher? = null, 
        
    @ManyToOne 
    @JoinColumn(name = "course_id") 
    var course: Course? = null )