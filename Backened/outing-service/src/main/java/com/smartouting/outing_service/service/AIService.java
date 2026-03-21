package com.smartouting.outing_service.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartouting.outing_service.dto.AIAnalysisResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.regex.Pattern;

@Service
public class AIService {

    private static final Logger log = LoggerFactory.getLogger(AIService.class);

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String BASE_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/";

    private static final String[] MODELS = {
            "gemini-2.5-flash",
            "gemini-2.0-flash-lite",
            "gemini-1.5-flash"

    };

    public AIAnalysisResult analyzeRequest(String reason) {
        if (reason == null || reason.isBlank()) {
            return new AIAnalysisResult("INSUFFICIENT_INFO", 5, 10,
                    List.of("Empty or missing reason"), "REJECT", "No reason provided.");
        }

        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            for (String model : MODELS) {
                try {
                    log.info("Trying Gemini model: {}", model);
                    AIAnalysisResult result = callGemini(reason, model);
                    if (result != null) {
                        log.info("AI Analysis (Gemini/{}): {} | Score: {} | Rec: {}",
                                model, result.getCategory(), result.getUrgencyScore(), result.getRecommendation());
                        return result;
                    }
                } catch (HttpClientErrorException.TooManyRequests e) {
                    log.warn("Model {} rate limited (429), trying next...", model);
                    try { Thread.sleep(2000); } catch (InterruptedException ignored) {}
                } catch (HttpClientErrorException e) {
                    log.warn("Model {} error {}, trying next...", model, e.getStatusCode());
                } catch (Exception e) {
                    log.warn("Model {} failed: {}", model, e.getMessage());
                }
            }
            log.warn("All Gemini models failed, using rule-based engine");
        } else {
            log.info("No Gemini API key, using rule-based engine");
        }

        return analyzeWithRules(reason);
    }

    private AIAnalysisResult callGemini(String reason, String model) throws Exception {
        String prompt = buildPrompt(reason);
        String url = BASE_URL + model + ":generateContent?key=" + geminiApiKey;

        Map<String, Object> textPart = Map.of("text", prompt);
        Map<String, Object> contentPart = Map.of("parts", List.of(textPart));
        Map<String, Object> generationConfig = Map.of("temperature", 0.1, "maxOutputTokens", 300);

        // Build request — disable thinking for 2.5 models
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(contentPart));
        requestBody.put("generationConfig", generationConfig);
        if (model.contains("2.5")) {
            requestBody.put("generationConfig", Map.of(
                    "temperature", 0.1,
                    "maxOutputTokens", 300,
                    "thinkingConfig", Map.of("thinkingBudget", 0)
            ));
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.POST, new HttpEntity<>(requestBody, headers), String.class
        );

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            log.info("Gemini raw response length: {}", response.getBody().length());
            return parseGeminiResponse(response.getBody(), model);
        }
        return null;
    }

    private String buildPrompt(String reason) {
        return "You are an AI for a campus outing system. Analyze this student outing request.\n\n" +
                "Reason: \"" + reason + "\"\n\n" +
                "Return ONLY valid JSON (no markdown, no backticks):\n" +
                "{\"category\":\"MEDICAL_EMERGENCY|MEDICAL|HEALTH|FAMILY_EMERGENCY|FAMILY|ACADEMIC_PRIORITY|ACADEMIC|PERSONAL_LEISURE|SUSPICIOUS|UNCATEGORIZED\"," +
                "\"urgencyScore\":0-100,\"confidenceLevel\":0-100," +
                "\"riskFlags\":[],\"recommendation\":\"APPROVE|MANUAL_REVIEW|LOW_PRIORITY|REJECT\"," +
                "\"explanation\":\"brief reason\"}\n\n" +
                "Rules: Medical emergency(accident,surgery,ICU)=75-100,APPROVE. " +
                "Medical(LFT,blood test,doctor,X-ray,MRI,checkup)=35-60,MANUAL_REVIEW. " +
                "Family emergency(death,funeral)=65-90,APPROVE. " +
                "Academic(exam,interview,placement)=40-65,MANUAL_REVIEW. " +
                "Personal(shopping,movie,party)=5-25,LOW_PRIORITY. " +
                "Suspicious(bunk,escape,fake)=0-10,REJECT. JSON only:";
    }

    private AIAnalysisResult parseGeminiResponse(String responseBody, String model) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);

        // Try all parts in all candidates to find text with JSON
        String text = "";
        JsonNode candidates = root.path("candidates");
        for (JsonNode candidate : candidates) {
            JsonNode parts = candidate.path("content").path("parts");
            for (JsonNode part : parts) {
                String t = part.path("text").asText("");
                if (t.contains("{") && t.contains("}")) {
                    text = t;
                    break;
                }
            }
            if (!text.isEmpty()) break;
        }

        if (text.isEmpty()) return null;

        // Clean markdown fences
        text = text.trim();
        if (text.startsWith("```json")) text = text.substring(7);
        if (text.startsWith("```")) text = text.substring(3);
        if (text.endsWith("```")) text = text.substring(0, text.length() - 3);
        text = text.trim();

        // Extract JSON object
        int s = text.indexOf('{'), e = text.lastIndexOf('}');
        if (s >= 0 && e > s) text = text.substring(s, e + 1);

        JsonNode json = objectMapper.readTree(text);

        List<String> riskFlags = new ArrayList<>();
        JsonNode flagsNode = json.path("riskFlags");
        if (flagsNode.isArray()) for (JsonNode f : flagsNode) { String v = f.asText(""); if (!v.isBlank()) riskFlags.add(v); }

        return new AIAnalysisResult(
                json.path("category").asText("UNCATEGORIZED"),
                Math.max(0, Math.min(100, json.path("urgencyScore").asInt(20))),
                Math.max(0, Math.min(100, json.path("confidenceLevel").asInt(50))),
                riskFlags,
                json.path("recommendation").asText("MANUAL_REVIEW"),
                "[Gemini/" + model + "] " + json.path("explanation").asText("Analyzed by AI")
        );
    }

    // ═══════════════════════════════════════════════════════════
    // RULE-BASED FALLBACK
    // ═══════════════════════════════════════════════════════════

    private static final Map<String, Integer> MEDICAL_TIER1 = new LinkedHashMap<>();
    static {
        MEDICAL_TIER1.put("ambulance", 30); MEDICAL_TIER1.put("emergency", 25);
        MEDICAL_TIER1.put("accident", 25); MEDICAL_TIER1.put("unconscious", 30);
        MEDICAL_TIER1.put("bleeding", 22); MEDICAL_TIER1.put("fracture", 20);
        MEDICAL_TIER1.put("broken bone", 22); MEDICAL_TIER1.put("heart attack", 30);
        MEDICAL_TIER1.put("chest pain", 25); MEDICAL_TIER1.put("severe pain", 22);
        MEDICAL_TIER1.put("surgery", 22); MEDICAL_TIER1.put("operation", 20);
        MEDICAL_TIER1.put("icu", 28); MEDICAL_TIER1.put("critical", 25);
        MEDICAL_TIER1.put("seizure", 25); MEDICAL_TIER1.put("stroke", 28);
        MEDICAL_TIER1.put("poisoning", 25); MEDICAL_TIER1.put("choking", 25);
        MEDICAL_TIER1.put("collapsed", 25); MEDICAL_TIER1.put("fainted", 20);
    }

    private static final Map<String, Integer> MEDICAL_TIER2 = new LinkedHashMap<>();
    static {
        MEDICAL_TIER2.put("hospital", 15); MEDICAL_TIER2.put("doctor", 12);
        MEDICAL_TIER2.put("clinic", 12); MEDICAL_TIER2.put("fever", 10);
        MEDICAL_TIER2.put("sick", 8); MEDICAL_TIER2.put("vomiting", 12);
        MEDICAL_TIER2.put("vomit", 12); MEDICAL_TIER2.put("pain", 8);
        MEDICAL_TIER2.put("injury", 12); MEDICAL_TIER2.put("medicine", 10);
        MEDICAL_TIER2.put("prescription", 10); MEDICAL_TIER2.put("specialist", 12);
        MEDICAL_TIER2.put("dental", 10); MEDICAL_TIER2.put("dentist", 10);
        MEDICAL_TIER2.put("checkup", 6); MEDICAL_TIER2.put("appointment", 6);
        MEDICAL_TIER2.put("x-ray", 12); MEDICAL_TIER2.put("mri", 12);
        MEDICAL_TIER2.put("blood test", 10); MEDICAL_TIER2.put("treatment", 10);
        MEDICAL_TIER2.put("medication", 10); MEDICAL_TIER2.put("nausea", 8);
        MEDICAL_TIER2.put("dizziness", 10); MEDICAL_TIER2.put("infection", 10);
        MEDICAL_TIER2.put("wound", 12); MEDICAL_TIER2.put("therapy", 8);
        MEDICAL_TIER2.put("allergy", 8); MEDICAL_TIER2.put("diagnosis", 10);
        MEDICAL_TIER2.put("blood", 10); MEDICAL_TIER2.put("lft", 12);
        MEDICAL_TIER2.put("cbc", 12); MEDICAL_TIER2.put("ecg", 12);
        MEDICAL_TIER2.put("ultrasound", 12); MEDICAL_TIER2.put("scan", 10);
        MEDICAL_TIER2.put("report", 6); MEDICAL_TIER2.put("pathology", 12);
    }

    private static final Map<String, Integer> ACADEMIC_KEYWORDS = new LinkedHashMap<>();
    static {
        ACADEMIC_KEYWORDS.put("final exam", 20); ACADEMIC_KEYWORDS.put("board exam", 20);
        ACADEMIC_KEYWORDS.put("entrance exam", 18); ACADEMIC_KEYWORDS.put("competitive exam", 18);
        ACADEMIC_KEYWORDS.put("exam", 12); ACADEMIC_KEYWORDS.put("interview", 15);
        ACADEMIC_KEYWORDS.put("job interview", 18); ACADEMIC_KEYWORDS.put("placement", 15);
        ACADEMIC_KEYWORDS.put("hackathon", 12); ACADEMIC_KEYWORDS.put("competition", 10);
        ACADEMIC_KEYWORDS.put("seminar", 8); ACADEMIC_KEYWORDS.put("conference", 10);
        ACADEMIC_KEYWORDS.put("presentation", 10); ACADEMIC_KEYWORDS.put("viva", 12);
        ACADEMIC_KEYWORDS.put("thesis", 10); ACADEMIC_KEYWORDS.put("internship", 10);
        ACADEMIC_KEYWORDS.put("certification", 10); ACADEMIC_KEYWORDS.put("project submission", 12);
        ACADEMIC_KEYWORDS.put("library", 5); ACADEMIC_KEYWORDS.put("class", 5);
    }

    private static final Map<String, Integer> FAMILY_URGENT = new LinkedHashMap<>();
    static {
        FAMILY_URGENT.put("death", 25); FAMILY_URGENT.put("funeral", 22);
        FAMILY_URGENT.put("passed away", 25); FAMILY_URGENT.put("demise", 22);
        FAMILY_URGENT.put("bereavement", 20); FAMILY_URGENT.put("family emergency", 22);
        FAMILY_URGENT.put("parent sick", 18); FAMILY_URGENT.put("mother sick", 18);
        FAMILY_URGENT.put("father sick", 18); FAMILY_URGENT.put("sibling sick", 15);
        FAMILY_URGENT.put("relative sick", 12); FAMILY_URGENT.put("wedding", 8);
    }

    private static final Map<String, Integer> PERSONAL_LEISURE = new LinkedHashMap<>();
    static {
        PERSONAL_LEISURE.put("movie", 2); PERSONAL_LEISURE.put("cinema", 2);
        PERSONAL_LEISURE.put("shopping", 2); PERSONAL_LEISURE.put("mall", 2);
        PERSONAL_LEISURE.put("party", 2); PERSONAL_LEISURE.put("trip", 3);
        PERSONAL_LEISURE.put("picnic", 2); PERSONAL_LEISURE.put("gym", 3);
        PERSONAL_LEISURE.put("restaurant", 2); PERSONAL_LEISURE.put("food", 2);
        PERSONAL_LEISURE.put("friends", 2); PERSONAL_LEISURE.put("hangout", 2);
        PERSONAL_LEISURE.put("festival", 4); PERSONAL_LEISURE.put("concert", 4);
        PERSONAL_LEISURE.put("fun", 1); PERSONAL_LEISURE.put("game", 2);
        PERSONAL_LEISURE.put("outing", 2); PERSONAL_LEISURE.put("date", 2);
    }

    private static final Map<String, Integer> SEVERITY_AMPLIFIERS = new LinkedHashMap<>();
    static {
        SEVERITY_AMPLIFIERS.put("very severe", 20); SEVERITY_AMPLIFIERS.put("extremely severe", 22);
        SEVERITY_AMPLIFIERS.put("severe", 15); SEVERITY_AMPLIFIERS.put("serious", 12);
        SEVERITY_AMPLIFIERS.put("urgent", 12); SEVERITY_AMPLIFIERS.put("immediate", 14);
        SEVERITY_AMPLIFIERS.put("unbearable", 15); SEVERITY_AMPLIFIERS.put("excruciating", 18);
        SEVERITY_AMPLIFIERS.put("high fever", 14); SEVERITY_AMPLIFIERS.put("cannot walk", 16);
        SEVERITY_AMPLIFIERS.put("cannot stand", 14); SEVERITY_AMPLIFIERS.put("critical condition", 20);
    }

    private static final Map<String, Integer> CONTEXT_REDUCERS = new LinkedHashMap<>();
    static {
        CONTEXT_REDUCERS.put("routine", -10); CONTEXT_REDUCERS.put("regular", -8);
        CONTEXT_REDUCERS.put("scheduled", -6); CONTEXT_REDUCERS.put("normal", -8);
        CONTEXT_REDUCERS.put("minor", -10); CONTEXT_REDUCERS.put("not serious", -15);
        CONTEXT_REDUCERS.put("not urgent", -20); CONTEXT_REDUCERS.put("can wait", -15);
        CONTEXT_REDUCERS.put("casual", -10); CONTEXT_REDUCERS.put("leisure", -12);
        CONTEXT_REDUCERS.put("just a", -5); CONTEXT_REDUCERS.put("only a", -5);
    }

    private static final Set<String> SUSPICIOUS_WORDS = new HashSet<>(Arrays.asList(
            "fake", "dummy", "blah", "xxx", "qwerty", "kill", "attack",
            "fight", "violent", "harm", "drugs", "alcohol", "illegal",
            "smuggle", "escape", "runaway", "bunk"
    ));

    private static final Set<String> CREDIBLE_LOCATIONS = new HashSet<>(Arrays.asList(
            "hospital", "clinic", "aiims", "apollo", "fortis",
            "railway station", "airport", "court", "police station",
            "government office", "bank", "embassy"
    ));

    private AIAnalysisResult analyzeWithRules(String reason) {
        String text = reason.toLowerCase().trim();
        List<String> flags = new ArrayList<>();

        int medT1 = weightedMatch(text, MEDICAL_TIER1);
        int medT2 = weightedMatch(text, MEDICAL_TIER2);
        int acad = weightedMatch(text, ACADEMIC_KEYWORDS);
        int fam = weightedMatch(text, FAMILY_URGENT);
        int leis = weightedMatch(text, PERSONAL_LEISURE);

        // Medical context overrides academic (e.g. "LFT test" is medical, not academic)
        if (medT2 > 0 && acad > 0) acad = Math.max(0, acad - medT2);

        String category; int baseScore;
        if (medT1 >= 20) { category = "MEDICAL_EMERGENCY"; baseScore = 60 + Math.min(medT1, 30); }
        else if (medT1 > 0 || medT2 >= 15) { category = "MEDICAL"; baseScore = 40 + Math.min(medT1 + medT2, 25); }
        else if (medT2 > 0) { category = "HEALTH"; baseScore = 30 + Math.min(medT2, 15); }
        else if (fam >= 20) { category = "FAMILY_EMERGENCY"; baseScore = 55 + Math.min(fam, 20); }
        else if (fam > 0) { category = "FAMILY"; baseScore = 35 + Math.min(fam, 20); }
        else if (acad >= 15) { category = "ACADEMIC_PRIORITY"; baseScore = 40 + Math.min(acad, 20); }
        else if (acad > 0) { category = "ACADEMIC"; baseScore = 25 + Math.min(acad, 20); }
        else if (leis > 0) { category = "PERSONAL_LEISURE"; baseScore = 10 + Math.min(leis, 15); }
        else { category = "UNCATEGORIZED"; baseScore = 15; }

        int severityBoost = Math.min(weightedMatch(text, SEVERITY_AMPLIFIERS), 25);
        int contextPenalty = weightedMatch(text, CONTEXT_REDUCERS);
        int wordCount = text.split("\\s+").length;
        int qualityBonus = 0;
        if (wordCount >= 10) qualityBonus += 5;
        if (wordCount >= 20) qualityBonus += 3;
        if (containsAny(text, CREDIBLE_LOCATIONS)) qualityBonus += 4;

        int riskPenalty = 0;
        for (String sw : SUSPICIOUS_WORDS) {
            if (text.contains(sw)) { flags.add("Suspicious: \"" + sw + "\""); riskPenalty += 20; }
        }
        if (wordCount < 3) { flags.add("Too vague"); riskPenalty += 10; }
        if ((category.startsWith("MEDICAL") || category.startsWith("HEALTH")) && leis > 0) {
            flags.add("Mixed medical+leisure"); riskPenalty += 8;
        }
        if (Pattern.compile("(.)\\1{3,}").matcher(text).find()) {
            flags.add("Possible gibberish"); riskPenalty += 12;
        }

        int urgency = Math.max(0, Math.min(100, baseScore + severityBoost + contextPenalty + qualityBonus - riskPenalty));
        int confidence = 50;
        if (!category.equals("UNCATEGORIZED")) confidence += 20;
        if (wordCount >= 8) confidence += 10;
        if (severityBoost > 0) confidence += 8;
        if (!flags.isEmpty()) confidence -= 10;
        confidence = Math.max(10, Math.min(99, confidence));

        String recommendation;
        if (riskPenalty >= 20) recommendation = "REJECT";
        else if (urgency >= 75 && flags.isEmpty()) recommendation = "APPROVE";
        else if (urgency >= 40) recommendation = "MANUAL_REVIEW";
        else recommendation = "LOW_PRIORITY";

        String explanation = "[Rule-Based] " + category + " | " + urgency + "/100 | " + confidence + "% conf"
                + (flags.isEmpty() ? "" : " | " + String.join("; ", flags));

        return new AIAnalysisResult(category, urgency, confidence, flags, recommendation, explanation);
    }

    private int weightedMatch(String text, Map<String, Integer> kwMap) {
        int total = 0;
        for (Map.Entry<String, Integer> e : kwMap.entrySet()) if (text.contains(e.getKey())) total += e.getValue();
        return total;
    }

    private boolean containsAny(String text, Collection<String> keywords) {
        return keywords.stream().anyMatch(text::contains);
    }
}
