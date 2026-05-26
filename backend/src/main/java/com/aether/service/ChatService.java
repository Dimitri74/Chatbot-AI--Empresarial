package com.aether.service;

import com.aether.model.ChatResponse;
import com.aether.rag.AetherAiService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class ChatService {

    private static final Logger LOG = Logger.getLogger(ChatService.class);

    @Inject
    AetherAiService aiService;

    public ChatResponse chat(String message, String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            sessionId = UUID.randomUUID().toString();
        }

        LOG.debugf("Chat [session=%s]: %s", sessionId, message);

        String answer = aiService.chat(sessionId, message);

        // TODO: extrair sources do contexto RAG (implementar na proxima iteracao)
        return new ChatResponse(answer, sessionId, List.of());
    }
}