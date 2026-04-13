package com.devscribe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DevscribeApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(DevscribeApiApplication.class, args);
    }

}
