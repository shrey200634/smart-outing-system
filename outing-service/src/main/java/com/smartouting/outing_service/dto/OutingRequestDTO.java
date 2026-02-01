package com.smartouting.outing_service.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OutingRequestDTO {

    @NotBlank(message = "Student ID is mandatory")
    private String studentId;

    @NotBlank(message = "Student Name is mandatory")
    private String studentName;

    @NotBlank(message = "Reason cannot be empty")
    private String reason;

    @NotBlank(message = "Destination cannot be empty")
    private String destination;

    @NotNull(message = "Out date is required")
    @Future(message = "Out date must be in the future")
    private LocalDateTime outDate;

    @NotNull(message = "Return date is required")
    @Future(message = "Return date must be in the future")
    private LocalDateTime returnDate;
}