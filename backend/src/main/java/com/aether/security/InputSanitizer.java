package com.aether.security;

import jakarta.enterprise.context.ApplicationScoped;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Primeira linha de defesa contra prompt injection.
 * Cobre PT-BR e EN. Cada categoria e independente — basta uma match para bloquear.
 *
 * Categorias:
 *  1.  Override de instrucoes (EN) — verbo perto de substantivo de instrucao
 *  2.  Override de instrucoes (PT-BR) — inclui plurais e variantes acentuadas
 *  3.  Reset de contexto (EN) — frases standalone
 *  4.  Reset de contexto (PT-BR) — frases standalone
 *  5.  Mudanca de persona (EN)
 *  6.  Mudanca de persona (PT-BR)
 *  7.  Extracao do system prompt (EN + PT-BR)
 *  8.  Comentarios HTML/CSS e instrucoes ocultas
 *  9.  Tokens especiais de modelos LLM
 * 10.  Modos de jailbreak (EN + PT-BR)
 * 11.  Reset de sessao (EN + PT-BR)
 * 12.  Meta-prompt / instrucoes aninhadas via marcadores
 * 13.  Conteudo proibido / sem restricoes
 */
@ApplicationScoped
public class InputSanitizer {

    private static final Map<String, Pattern> PATTERNS = new LinkedHashMap<>();

    static {

        // ── 1. Override EN: verbo de override perto de substantivo de instrucao ──────────
        PATTERNS.put("override-en",
            Pattern.compile(
                "(?i)\\b(ignore|forget|disregard|override|skip|clear|erase|delete|remove|dismiss)\\b" +
                ".{0,100}" +
                "\\b(instruction|instructions|prompt|prompts|rule|rules|context|command|commands|directive|directives)\\b",
                Pattern.DOTALL));

        // ── 2. Override PT-BR: plural, sem acento, com acento ────────────────────────────
        // Cobre: instrucao/instrucoes/instrução/instruções, regra/regras, contexto, comando/comandos
        PATTERNS.put("override-ptbr",
            Pattern.compile(
                "(?i)\\b(ignore|esqueça|esqueca|desconsidere|anule|cancele|apague|descarte|remova|limpe|zere|delete|exclua)\\b" +
                ".{0,100}" +
                "\\b(instrução|instrucao|instruções|instrucoes|regra|regras|contexto|comando|comandos|diretriz|diretrizes|mensagem anterior|mensagens anteriores)\\b",
                Pattern.DOTALL));

        // ── 3. Reset de contexto EN: frases de redefinicao ──────────────────────────────
        PATTERNS.put("context-reset-en",
            Pattern.compile(
                "(?i)\\b(from now on|starting now|as of now|henceforth|going forward|from this point|" +
                "new instructions?|your new (role|task|job|purpose|goal))\\b",
                Pattern.DOTALL));

        // ── 4. Reset de contexto PT-BR ───────────────────────────────────────────────────
        PATTERNS.put("context-reset-ptbr",
            Pattern.compile(
                "(?i)(a partir de agora|de agora em diante|daqui em diante|desde agora|" +
                "novas? instruç|novas? instrucao|novo (papel|objetivo|propósito|proposito|comportamento)|" +
                "seu novo (papel|objetivo|proposito)|agora (você|voce) (deve|vai|pode|tem que))",
                Pattern.DOTALL));

        // ── 5. Mudanca de persona EN ──────────────────────────────────────────────────────
        PATTERNS.put("persona-en",
            Pattern.compile(
                "(?i)\\b(you are now|act as|acting as|pretend (to be|you are)|roleplay( as)?|" +
                "simulate being|play the role( of)?|behave as|impersonate|your (new )?persona|" +
                "as an? (ai|assistant|bot|character) (without|with no|that (can|will)))\\b",
                Pattern.DOTALL));

        // ── 6. Mudanca de persona PT-BR ───────────────────────────────────────────────────
        PATTERNS.put("persona-ptbr",
            Pattern.compile(
                "(?i)(aja como|agindo como|finja (ser|que (você|voce)|de ser)|assuma (o papel|a persona|a identidade|o personagem)|" +
                "interprete (um|uma|o papel|a personagem)|faça o papel|faca o papel|simule (ser|um|uma)|" +
                "(você|voce) agora (é|e)|seu novo personagem|como (esse|este|um) personagem (fictício|ficticio|imaginário|imaginario)|" +
                "personagem (sem|que nao tem|que não tem) restrição|personagem (que pode|capaz de) (responder|dizer|falar) qualquer)",
                Pattern.DOTALL));

        // ── 7. Extracao do system prompt EN + PT-BR ───────────────────────────────────────
        PATTERNS.put("extract-prompt",
            Pattern.compile(
                "(?i)(reveal|show|print|repeat|output|display|tell me|share|expose|leak|" +
                "mostre|revele|repita|exiba|imprima|compartilhe|exponha|vaze|diga|qual (é|e)|quais (são|sao)).{0,80}" +
                "(system (prompt|message|instruction|rule)|your (instruction|rule|prompt|setup|configuration|guideline|directive)|" +
                "seu (prompt|instrução|instrucao|sistema|configuração|configuracao|setup)|suas (instrução|instrucao|regras|diretrizes))",
                Pattern.DOTALL));

        // ── 8. Comentarios HTML/CSS/SQL e instrucoes ocultas ──────────────────────────────
        // Cobre: <!-- -->, /* */, instrucao oculta, hidden instruction
        PATTERNS.put("comment-injection",
            Pattern.compile(
                "(?i)(<!--|-->|/\\*|\\*/|" +
                "instrução oculta|instrucao oculta|instrução (escondida|embutida|invisível|invisivel)|" +
                "instrucao (escondida|embutida|invisivel)|" +
                "hidden (instruction|rule|command|prompt)|oculto:|escondido:|invisible:|" +
                "nota (oculta|escondida|interna)|note (hidden|internal|secret))",
                Pattern.DOTALL));

        // ── 9. Tokens especiais de modelos LLM ───────────────────────────────────────────
        PATTERNS.put("model-tokens",
            Pattern.compile(
                "(?i)(\\[INST\\]|\\[/INST\\]|<\\|system\\|>|<\\|user\\|>|<\\|assistant\\|>|" +
                "<\\|im_start\\|>|<\\|im_end\\|>|<\\|eot_id\\|>|" +
                "###\\s*(system|instruction|human|assistant|prompt|input)|" +
                "<<SYS>>|</SYS>|<</SYS>>|\\[s\\]|\\[/s\\])",
                Pattern.DOTALL));

        // ── 10. Modos de jailbreak conhecidos EN + PT-BR ──────────────────────────────────
        PATTERNS.put("jailbreak",
            Pattern.compile(
                "(?i)(jailbreak|DAN( mode)?|developer mode|god mode|unrestricted mode|do anything now|" +
                "no restrictions|without restrictions|without (any )?limits?|" +
                "sem restrições|sem restricoes|sem (nenhuma )?limitação|sem (nenhuma )?limitacao|" +
                "modo desenvolvedor|modo irrestrito|modo deus|modo livre|modo sem censura|" +
                "bypass (all|os filtros|a censura|restrictions?|rules?|instrução|instrucao)|" +
                "desabilit(e|ar|ar) (o filtro|as restrições|as restricoes|a censura)|" +
                "qualquer coisa sem (restrição|restricao|limite|censura))",
                Pattern.DOTALL));

        // ── 11. Reset de sessao EN + PT-BR ────────────────────────────────────────────────
        PATTERNS.put("session-reset",
            Pattern.compile(
                "(?i)(new (conversation|session|chat|prompt|context)|" +
                "reset (all|context|memory|chat|history|everything)|start (over|fresh|again)|" +
                "nova (conversa|sessão|sessao|sessao)|novo (chat|contexto)|" +
                "reiniciar|reinicie (o )?(contexto|memoria|memória|chat|tudo)|" +
                "limpe? (a |o )?(memoria|memória|histórico|historico|contexto|conversa)|" +
                "esqueça (tudo|toda a conversa|o que foi dito|o histórico)|" +
                "esqueca (tudo|toda a conversa|o que foi dito|o historico))",
                Pattern.DOTALL));

        // ── 12. Meta-prompt / instrucoes aninhadas via marcadores estruturais ─────────────
        PATTERNS.put("nested-instructions",
            Pattern.compile(
                "(?i)(\\[system\\]|\\[assistant\\]|\\[user\\]|\\[prompt\\]|" +
                "<system>|<assistant>|<user>|<instruction>|<prompt>|" +
                "<<SYS>>|<</SYS>>|<</system>>)",
                Pattern.DOTALL));

        // ── 13. Conteudo proibido / pedido de acoes sem restricoes ───────────────────────
        PATTERNS.put("prohibited-content",
            Pattern.compile(
                "(?i)(ações proibidas|acoes proibidas|prohibited (actions?|content|activities)|" +
                "conteúdo proibido|conteudo proibido|conteúdo (ilegal|ilícito)|conteudo (ilegal|ilicito)|" +
                "como (realizar|fazer|executar|praticar).{0,40}(proibid|ilegal|ilícito|ilicito|prejudicial|perigoso)|" +
                "anything (illegal|prohibited|harmful|dangerous|without restriction)|" +
                "responda (tudo|qualquer coisa|qualquer pergunta) sem (restrição|restricao|filtro|censura))",
                Pattern.DOTALL));
    }

    public String sanitize(String input) {
        if (input == null || input.isBlank()) {
            throw new IllegalArgumentException("Mensagem nao pode estar vazia.");
        }

        for (Map.Entry<String, Pattern> entry : PATTERNS.entrySet()) {
            if (entry.getValue().matcher(input).find()) {
                throw new SecurityException("Conteudo nao permitido detectado na mensagem.");
            }
        }

        return input.strip();
    }
}