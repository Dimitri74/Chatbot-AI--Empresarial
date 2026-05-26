package com.aether.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ChatRequest {

    @NotBlank(message = "A mensagem nao pode estar vazia")
    @Size(max = 2000, message = "Mensagem muito longa (max 2000 caracteres)")
    public String message;

    public String sessionId;
}