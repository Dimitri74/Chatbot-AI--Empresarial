package com.aether.service;

import com.aether.model.ChatResponse;
import com.aether.rag.AetherAiService;
import com.aether.security.InputSanitizer;
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

    @Inject
    InputSanitizer inputSanitizer;

    public ChatResponse chat(String message, String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            sessionId = UUID.randomUUID().toString();
        }

        String sanitized = inputSanitizer.sanitize(message);

        // Log apenas metadados, nunca o conteudo da mensagem
        LOG.debugf("Chat request [session=%s, length=%d chars]", sessionId, sanitized.length());

        String answer = aiService.chat(sessionId, sanitized);

        // TODO: extrair sources do contexto RAG (implementar na proxima iteracao)
        return new ChatResponse(answer, sessionId, List.of());
    }
}