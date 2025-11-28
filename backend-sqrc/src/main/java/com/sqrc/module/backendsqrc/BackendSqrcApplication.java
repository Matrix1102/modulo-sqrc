package com.sqrc.module.backendsqrc;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BackendSqrcApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendSqrcApplication.class, args);
    }

}
