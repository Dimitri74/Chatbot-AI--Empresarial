package com.aether.controller;

import com.aether.model.ChatRequest;
import com.aether.model.ChatResponse;
import com.aether.service.ChatService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.Map;

@Path("/api/chat")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Chat", description = "Endpoints do assistente de chat")
public class ChatController {

    @Inject
    ChatService chatService;

    @POST
    @Operation(summary = "Envia uma mensagem para o assistente")
    public Response chat(@Valid ChatRequest request) {
        try {
            ChatResponse response = chatService.chat(request.message, request.sessionId);
            return Response.ok(response).build();
        } catch (SecurityException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }
}