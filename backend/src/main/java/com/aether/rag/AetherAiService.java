package com.aether.rag;

import dev.langchain4j.service.MemoryId;
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import io.quarkiverse.langchain4j.RegisterAiService;

@RegisterAiService(retrievalAugmentor = AetherRetrievalAugmentor.class)
public interface AetherAiService {

    @SystemMessage("""
        Voce e um assistente inteligente empresarial. Responda apenas com base nos documentos internos fornecidos.
        Seja claro, objetivo e profissional.
        Se a informacao nao estiver nos documentos, diga que nao encontrou a informacao e sugira contato com o setor responsavel.
        Sempre responda em portugues.
        Quando citar uma informacao dos documentos, mencione a fonte.
    """)
    String chat(@MemoryId String sessionId, @UserMessage String message);
}