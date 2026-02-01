package com.smartouting.outing_service.service;

import com.smartouting.outing_service.dto.OutingRequestDTO;
import com.smartouting.outing_service.dto.OutingResponseDTO;
import com.smartouting.outing_service.exception.ResourseNotFoundException; // New Exception
import com.smartouting.outing_service.model.Outing;
import com.smartouting.outing_service.repository.OutingRepository;
import com.smartouting.outing_service.util.QrCodeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class OutingService {

    @Autowired
    private OutingRepository outingRepository;

    // 1. Student Applies (Accepts DTO, Returns DTO)
    public OutingResponseDTO applyForOuting(OutingRequestDTO request) {
        // Convert DTO to Entity (Manual Mapper)
        Outing outing = new Outing();
        outing.setStudentId(request.getStudentId());
        outing.setStudentName(request.getStudentName());
        outing.setReason(request.getReason());
        outing.setDestination(request.getDestination());
        outing.setOutDate(request.getOutDate());
        outing.setReturnDate(request.getReturnDate());
        outing.setStatus("PENDING");

        // Run AI Analysis
        analyzeRequest(outing);

        // Save
        Outing savedOuting = outingRepository.save(outing);

        // Convert Entity back to Response DTO
        return mapToResponse(savedOuting);
    }

    // Helper: Maps Entity -> DTO
    private OutingResponseDTO mapToResponse(Outing outing) {
        OutingResponseDTO response = new OutingResponseDTO();
        response.setId(outing.getId());
        response.setStudentName(outing.getStudentName());
        response.setStatus(outing.getStatus());
        response.setAiFlag(outing.getAiFlag());
        response.setUrgencyScore(outing.getUrgencyScore());
        response.setWardenComment(outing.getWardernComment());
        response.setQrCodeUrl(outing.getQrCodeUrl());
        response.setOutDate(outing.getOutDate());
        response.setReturnDate(outing.getReturnDate());
        return response;
    }

    // ... Keep your existing analyzeRequest, approveOuting, verifyAndMarkOut methods ...
    // Note: You should update approveOuting and verifyAndMarkOut to return OutingResponseDTO too!
    // Example for approve:

    public OutingResponseDTO approveOuting(Long id, String comment) throws Exception {
        Outing outing = outingRepository.findById(id)
                .orElseThrow(() -> new ResourseNotFoundException("Outing with ID " + id + " not found"));

        outing.setStatus("APPROVED");
        outing.setWardenComment(comment);

        // QR Generation Logic
        String qrData = "ID:" + outing.getId() + "-STATUS:APPROVED-" + outing.getStudentId();
        String qrBase64 = QrCodeUtil.generateQR(qrData, 200, 200);
        outing.setQrCodeUrl(qrBase64);

        Outing saved = outingRepository.save(outing);
        return mapToResponse(saved);
    }

    public OutingResponseDTO verifyAndMarkOut(Long id) {
        Outing outing = outingRepository.findById(id)
                .orElseThrow(() -> new ResourseNotFoundException("Outing not found"));

        if ("APPROVED".equals(outing.getStatus())) {
            outing.setStatus("OUT");
            outing.setOutDate(LocalDateTime.now());
            Outing saved = outingRepository.save(outing);
            return mapToResponse(saved);
        } else {
            throw new RuntimeException("Student is NOT approved to leave!");
        }
    }

    // ... Paste your analyzeRequest method here ...
    private void analyzeRequest(Outing outing) {
        String reason = outing.getReason().toLowerCase();

        if (reason.contains("doctor") || reason.contains("hospital") || reason.contains("fever") || reason.contains("emergency")) {
            outing.setAiFlag("⚠️ MEDICAL EMERGENCY");
            outing.setUrgencyScore(98);
        }
        else if (reason.contains("exam") || reason.contains("book") || reason.contains("project")) {
            outing.setAiFlag("📚 ACADEMIC");
            outing.setUrgencyScore(70);
        }
        else {
            outing.setAiFlag("ℹ️ RECREATION");
            outing.setUrgencyScore(15);
        }
    }
}