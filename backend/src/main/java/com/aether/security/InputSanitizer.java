package com.aether.security;

import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.regex.Pattern;

@ApplicationScoped
public class InputSanitizer {

    private static final List<Pattern> INJECTION_PATTERNS = List.of(
        // Override de instrucoes
        Pattern.compile("(?i)(ignore|forget|disregard|override).{0,40}(previous|prior|above|all).{0,40}(instruction|prompt|rule|context|command)", Pattern.DOTALL),
        // Mudanca de persona / role-play
        Pattern.compile("(?i)(you are now|act as|pretend (to be|you are)|roleplay as|simulate being|from now on you)", Pattern.DOTALL),
        // Tentativa de extrair system prompt
        Pattern.compile("(?i)(reveal|show|print|repeat|output|tell me).{0,30}(system\\s*(prompt|message)|your (instruction|rule))", Pattern.DOTALL),
        // Tokens especiais de modelos
        Pattern.compile("(?i)(\\[INST\\]|\\[/INST\\]|<\\|system\\|>|<\\|user\\|>|<\\|assistant\\|>|<\\|im_start\\|>|###\\s*(system|instruction|human|assistant))", Pattern.DOTALL),
        // Modos de jailbreak conhecidos
        Pattern.compile("(?i)(jailbreak|DAN mode|developer mode|unrestricted mode|do anything now|god mode|no restrictions)", Pattern.DOTALL),
        // Injecao via prompt aninhado
        Pattern.compile("(?i)(new\\s+conversation|new\\s+session|reset\\s+(context|memory|chat)|start\\s+over)", Pattern.DOTALL)
    );

    public String sanitize(String input) {
        if (input == null || input.isBlank()) {
            throw new IllegalArgumentException("Mensagem nao pode estar vazia.");
        }
        for (Pattern pattern : INJECTION_PATTERNS) {
            if (pattern.matcher(input).find()) {
                throw new SecurityException("Conteudo nao permitido detectado na mensagem.");
            }
        }
        return input.strip();
    }
}