package com.aether.model;

import java.time.Instant;
import java.util.List;

public class ChatResponse {

    public String answer;
    public String sessionId;
    public List<SourceReference> sources;
    public Instant timestamp;

    public ChatResponse() {}

    public ChatResponse(String answer, String sessionId, List<SourceReference> sources) {
        this.answer = answer;
        this.sessionId = sessionId;
        this.sources = sources;
        this.timestamp = Instant.now();
    }

    public record SourceReference(String documentName, String excerpt, double score) {}
}