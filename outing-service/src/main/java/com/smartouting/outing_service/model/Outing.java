package com.smartouting.outing_service.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class Outing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id ;
    private String studentId;
    private String studentName;

    private String reason ;
    private String destination ;

    private LocalDateTime outDate ;   // when they want to go
    private LocalDateTime returnDate;  // when they will come back

    private String status ="PENDING";

    private String wardernComment ; // if reject why ?

    // QR code (only generate after approval
    @Column(length=1000)
    private String qrCodeUrl;


}
