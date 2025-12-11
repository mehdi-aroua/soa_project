package com.university.course;

import javax.xml.ws.Endpoint;

public class CoursePublisher {
    public static void main(String[] args) {
        System.out.println("Course SOAP Service running...");
        Endpoint.publish("http://0.0.0.0:8200/course-service", new CourseService());
    }
}
