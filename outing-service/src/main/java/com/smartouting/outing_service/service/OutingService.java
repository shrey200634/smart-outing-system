package com.smartouting.outing_service.service;

import com.smartouting.outing_service.dto.OutingRequestDTO;
import com.smartouting.outing_service.dto.OutingResponseDTO;
import com.smartouting.outing_service.exception.ResourseNotFoundException;
import com.smartouting.outing_service.exception.StudentBannedException;
import com.smartouting.outing_service.model.Outing;
import com.smartouting.outing_service.repository.OutingRepository;
import com.smartouting.outing_service.util.QrCodeUtil;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OutingService {

    @Autowired private OutingRepository outingRepository;
    @Autowired private AIService aiService;
    @Autowired private EmailService emailService;

    private static final int MAX_LATE_ALLOWED = 3;

    @Transactional
    public OutingResponseDTO applyForOuting(OutingRequestDTO request) {
        long lateCount = outingRepository.countByStudentIdAndStatus(request.getStudentId(), "OVERDUE");
        if (lateCount >= MAX_LATE_ALLOWED)
            throw new StudentBannedException("Access Denied: you have " + lateCount + " overdue outings. Please meet the warden.");

        List<Outing> activeOutings = outingRepository.findByStudentId(request.getStudentId());
        boolean isAlreadyOut = activeOutings.stream().anyMatch(o -> "OUT".equals(o.getStatus()) || "APPROVED".equals(o.getStatus()));
        if (isAlreadyOut) throw new RuntimeException("You already have an active or approved outing request.");

        Outing outing = new Outing();
        outing.setStudentId(request.getStudentId());
        outing.setStudentName(request.getStudentName());
        outing.setParentEmail(request.getParentEmail());
        outing.setReason(request.getReason());
        outing.setDestination(request.getDestination());
        outing.setOutDate(request.getOutDate());
        outing.setReturnDate(request.getReturnDate());
        outing.setStatus("PENDING");

        com.smartouting.outing_service.dto.AIAnalysisResult aiResult = aiService.analyzeRequest(request.getReason());
        outing.setAiFlag(aiResult.getCategory());
        outing.setUrgencyScore(aiResult.getUrgencyScore());

        return mapToResponse(outingRepository.save(outing));
    }

    public OutingResponseDTO approveOuting(Long id, String comment) throws Exception {
        Outing outing = outingRepository.findById(id).orElseThrow(() -> new ResourseNotFoundException("Outing " + id + " not found"));
        outing.setStatus("APPROVED");
        outing.setWardenComment(comment);
        outing.setQrCodeUrl(QrCodeUtil.generateQR("ID:" + outing.getId() + "-STATUS:APPROVED-" + outing.getStudentId(), 200, 200));
        return mapToResponse(outingRepository.save(outing));
    }

    // Guard scans student OUT (leaving campus)
    public OutingResponseDTO verifyAndMarkOut(Long id) {
        Outing outing = outingRepository.findById(id).orElseThrow(() -> new ResourseNotFoundException("Outing " + id + " not found"));
        if ("APPROVED".equals(outing.getStatus())) {
            outing.setStatus("OUT");
            outing.setOutDate(LocalDateTime.now());
            emailService.sendOutingAlert(outing.getParentEmail(), outing.getStudentName(), outing.getReason());
            return mapToResponse(outingRepository.save(outing));
        }
        throw new ResourseNotFoundException("Student is NOT approved to leave! Current status: " + outing.getStatus());
    }

    // FIX: Guard scans student IN (returning to campus)
    public OutingResponseDTO verifyAndMarkReturn(Long id) {
        Outing outing = outingRepository.findById(id).orElseThrow(() -> new ResourseNotFoundException("Outing " + id + " not found"));
        if ("OUT".equals(outing.getStatus()) || "OVERDUE".equals(outing.getStatus())) {
            outing.setStatus("RETURNED");
            if (outing.getWardenComment() != null && outing.getWardenComment().startsWith("System Auto-Flag"))
                outing.setWardenComment("Returned at " + LocalDateTime.now());
            return mapToResponse(outingRepository.save(outing));
        }
        throw new ResourseNotFoundException("Cannot mark return. Status is '" + outing.getStatus() + "'. Only OUT or OVERDUE students can return.");
    }

    private OutingResponseDTO mapToResponse(Outing outing) {
        return new OutingResponseDTO(outing.getId(), outing.getStudentId(), outing.getStudentName(),
                outing.getReason(), outing.getDestination(), outing.getStatus(), outing.getAiFlag(),
                outing.getUrgencyScore(), outing.getWardenComment(), outing.getQrCodeUrl(),
                outing.getOutDate(), outing.getReturnDate());
    }


    // help to get the list when wardern want to see the request like pending , return , alln requests ....
    // used in wardern dashboard

    public List<Outing> getAllOuting() {
        return outingRepository.findAll();
    }
    public Outing getOutingById(Long id) {
        return outingRepository.findById(id).orElseThrow(() -> new ResourseNotFoundException("Not found: " + id));
    }
    public List<Outing> getOutingsByStudentId(String studentId) {
        return outingRepository.findByStudentId(studentId);
    }
}