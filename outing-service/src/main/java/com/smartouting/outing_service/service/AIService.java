package com.smartouting.outing_service.service;


import com.smartouting.outing_service.dto.AIAnalysisResult;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class AIService {

    // 🧠 THE KNOWLEDGE BASE (No API Key needed!)
    private static final List<String> MEDICAL_KEYWORDS = Arrays.asList(
            "fever", "pain", "hospital", "doctor", "emergency", "blood", "vomit", "sick", "medicine", "fracture"
    );
    private static final List<String> ACADEMIC_KEYWORDS = Arrays.asList(
            "exam", "test", "library", "project", "class", "lab", "interview", "hackathon", "presentation"
    );
    private static final List<String> PERSONAL_KEYWORDS = Arrays.asList(
            "movie", "shopping", "party", "friend", "trip", "food", "gym", "date", "wedding"
    );

    public AIAnalysisResult analyzeRequest(String reason) {
        String text = reason.toLowerCase();

        // Default Values
        String category = "UNCATEGORIZED";
        int urgency = 30;
        List<String> flags = new ArrayList<>();

        // 1. INTELLIGENT CATEGORIZATION
        if (containsAny(text, MEDICAL_KEYWORDS)) {
            category = "MEDICAL_EMERGENCY";
            urgency = 85;
            // Boost score for critical words
            if (text.contains("severe") || text.contains("critical") || text.contains("ambulance")) {
                urgency = 98;
            }
        } else if (containsAny(text, ACADEMIC_KEYWORDS)) {
            category = "ACADEMIC";
            urgency = 50;
            if (text.contains("final") || text.contains("exam")) {
                urgency = 75; // Exams are more urgent than studying
            }
        } else if (containsAny(text, PERSONAL_KEYWORDS)) {
            category = "PERSONAL_LEISURE";
            urgency = 20;
        }

        // 2. RISK DETECTION (The Security Guard)
        if (text.length() < 5) flags.add("Description too short");
        if (text.contains("fake") || text.contains("dummy")) flags.add("Suspicious keyword detected");
        // Simple Sentiment Check
        if (text.contains("kill") || text.contains("attack")) flags.add("Threatening language detected");

        // 3. CONFIDENCE CALCULATION (Simulated)
        int confidence = 60;
        if (text.split(" ").length > 3) confidence += 20; // More words = higher confidence
        if (!category.equals("UNCATEGORIZED")) confidence += 15; // Known category = higher confidence

        // 4. RECOMMENDATION ENGINE
        String recommendation = "MANUAL_REVIEW"; // Default safe option
        if (urgency >= 80 && flags.isEmpty()) recommendation = "APPROVE";
        if (urgency < 30) recommendation = "REJECT"; // Optional: Auto-reject weak reasons

        String explanation = "Classified as " + category + " with urgency score " + urgency + "/100.";

        return new AIAnalysisResult(category, urgency, confidence, flags, recommendation, explanation);
    }

    // Helper method to check keywords
    private boolean containsAny(String text, List<String> keywords) {
        return keywords.stream().anyMatch(text::contains);
    }
}