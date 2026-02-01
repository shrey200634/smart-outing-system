package com.smartouting.outing_service.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OutingResponseDTO {
    private Long id;
    private String studentName;
    private String status;       // PENDING, APPROVED, OUT
    private String aiFlag;       // ⚠️ MEDICAL
    private int urgencyScore;    // 98
    private String wardenComment;
    private String qrCodeUrl;
    private LocalDateTime outDate;
    private LocalDateTime returnDate;
}