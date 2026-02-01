package com.smartouting.outing_service.controller;

import com.smartouting.outing_service.dto.OutingRequestDTO;
import com.smartouting.outing_service.dto.OutingResponseDTO;
import com.smartouting.outing_service.service.OutingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/outing")
public class OutingController {

    @Autowired
    private OutingService service;

    // 1. Apply (DTO version)
    @PostMapping("/apply")
    public OutingResponseDTO apply(@RequestBody @Valid OutingRequestDTO request) {
        return service.applyForOuting(request);
    }

    // 2. Approve
    @PutMapping("/approve/{id}")
    public OutingResponseDTO approve(@PathVariable Long id, @RequestParam String comment) throws Exception {
        return service.approveOuting(id, comment);
    }

    // 3. Scan
    @PutMapping("/scan/{id}")
    public OutingResponseDTO scanQr(@PathVariable Long id) {
        return service.verifyAndMarkOut(id);
    }
}