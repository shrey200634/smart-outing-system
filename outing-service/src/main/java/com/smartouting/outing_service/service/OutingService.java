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

    @Autowired
    private OutingRepository outingRepository;

    @Autowired
    private AIService aiService;

    @Autowired
    private EmailService emailService;

    // 1. APPLY (Student sends RequestDTO, we return ResponseDTO)
    private static final int MAX_LATE_ALLOWED = 3;

    @Transactional
    public OutingResponseDTO applyForOuting(OutingRequestDTO request) {

        long lateCount =outingRepository.countByStudentIdAndStatus(request.getStudentId() , "OVERDUE");

        // BAN
        if (lateCount >= MAX_LATE_ALLOWED) {
            throw new StudentBannedException(
                    "Access Denied : you have " + lateCount + "overdue Outing . " +
                            "Please meet the wardern to clear your blacklist ststus . "
            );
        }


            List<Outing> activeOutings = outingRepository.findByStudentId(request.getStudentId());
            boolean isAlreadyOut = activeOutings.stream()
                    .anyMatch(o -> "OUT".equals(o.getStatus()) || "APPROVED".equals(o.getStatus()));

            if (isAlreadyOut) {
                throw new RuntimeException("You already have an active or approved outing request.");
            }



        // A. Convert DTO to Entity
        Outing outing = new Outing();
        outing.setStudentId(request.getStudentId());
        outing.setStudentName(request.getStudentName());
        outing.setParentEmail(request.getParentEmail());
        outing.setReason(request.getReason());
        outing.setDestination(request.getDestination());
        outing.setOutDate(request.getOutDate());
        outing.setReturnDate(request.getReturnDate());
        outing.setStatus("PENDING");

        // B. 🧠 CALL THE NEW AI BRAIN
        // We send the "Reason" to the AI, and get back a full Analysis Result
        com.smartouting.outing_service.dto.AIAnalysisResult aiResult = aiService.analyzeRequest(request.getReason());

        // C. Map AI Results to Database Entity
        outing.setAiFlag(aiResult.getCategory());       // e.g., "MEDICAL_EMERGENCY"
        outing.setUrgencyScore(aiResult.getUrgencyScore()); // e.g., 95

        // Optional: You can save the explanation if you add a field for it later
        // outing.setAiExplanation(aiResult.getExplanation());

        // D. Save to DB
        Outing savedOuting = outingRepository.save(outing);

        // E. Convert back to DTO
        return mapToResponse(savedOuting);
    }





    // 2. APPROVE (Warden)
    public OutingResponseDTO approveOuting(Long id, String comment) throws Exception {
        Outing outing = outingRepository.findById(id)
                .orElseThrow(() -> new ResourseNotFoundException("Outing with ID " + id + " not found"));

        outing.setStatus("APPROVED");
        outing.setWardenComment(comment);

        // Generate QR Code
        String qrData = "ID:" + outing.getId() + "-STATUS:APPROVED-" + outing.getStudentId();
        outing.setQrCodeUrl(QrCodeUtil.generateQR(qrData, 200, 200));

        Outing savedOuting = outingRepository.save(outing);
        return mapToResponse(savedOuting);
    }

    // 3. SCAN (Guard)
    public OutingResponseDTO verifyAndMarkOut(Long id) {
        Outing outing = outingRepository.findById(id)
                .orElseThrow(() -> new ResourseNotFoundException("Outing with ID " + id + " not found"));

        if ("APPROVED".equals(outing.getStatus())) {
            outing.setStatus("OUT");
            outing.setOutDate(LocalDateTime.now());

            emailService.sendOutingAlert(
                    outing.getParentEmail(),
                    outing.getStudentName(),
                    outing.getReason()
            );
            return mapToResponse(outingRepository.save(outing));
        } else {
            throw new ResourseNotFoundException("Student is NOT approved to leave!");
        }
    }

    // --- HELPER METHODS ---

    // Maps Entity -> Response DTO
    private OutingResponseDTO mapToResponse(Outing outing) {
        return new OutingResponseDTO(
                outing.getId(),
                outing.getStudentId(),
                outing.getStudentName(),
                outing.getReason(),
                outing.getDestination(),
                outing.getStatus(),
                outing.getAiFlag(),
                outing.getUrgencyScore(),
                outing.getWardenComment(),
                outing.getQrCodeUrl(),
                outing.getOutDate(),
                outing.getReturnDate()
        );
    }


    // get all outing for wardern
    public List<Outing> getAllOuting(){
        return outingRepository.findAll();

    }
   // get single outing by id
    public Outing getOutingById(Long  id){
        return outingRepository.findById(id)
                .orElseThrow(()->new ResourseNotFoundException("outing not found with id :" +id));
    }


    // Phase 2: Get ALL requests for a specific student
    public List<Outing> getOutingsByStudentId(String studentId) {
        List<Outing> history = outingRepository.findByStudentId(studentId);
        if(history.isEmpty()) {
            System.out.println("No history found for student: " + studentId);
        }

        return history;
    }

}