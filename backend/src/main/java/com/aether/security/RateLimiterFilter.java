package com.aether.security;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Provider
@ApplicationScoped
public class RateLimiterFilter implements ContainerRequestFilter {

    private static final Logger LOG = Logger.getLogger(RateLimiterFilter.class);

    @ConfigProperty(name = "aether.security.rate-limit.requests-per-minute", defaultValue = "20")
    int requestsPerMinute;

    private final ConcurrentHashMap<String, RequestWindow> windows = new ConcurrentHashMap<>();

    @Override
    public void filter(ContainerRequestContext ctx) throws IOException {
        String path = ctx.getUriInfo().getPath();
        if (!path.startsWith("/api/chat") && !path.startsWith("/api/documents")) {
            return;
        }

        String ip = extractIp(ctx);
        long now = System.currentTimeMillis();
        RequestWindow window = windows.computeIfAbsent(ip, k -> new RequestWindow());

        if (!window.tryAcquire(now, requestsPerMinute)) {
            LOG.warnf("Rate limit excedido para IP: %s", ip);
            ctx.abortWith(
                Response.status(429)
                    .entity(Map.of("error", "Muitas requisicoes. Aguarde um momento antes de tentar novamente."))
                    .header("Content-Type", "application/json")
                    .header("Retry-After", "60")
                    .build()
            );
        }
    }

    private String extractIp(ContainerRequestContext ctx) {
        String forwarded = ctx.getHeaderString("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        String realIp = ctx.getHeaderString("X-Real-IP");
        return (realIp != null && !realIp.isBlank()) ? realIp : "unknown";
    }

    private static class RequestWindow {
        private long windowStart = System.currentTimeMillis();
        private final AtomicInteger count = new AtomicInteger(0);

        synchronized boolean tryAcquire(long now, int limit) {
            if (now - windowStart > 60_000L) {
                windowStart = now;
                count.set(0);
            }
            return count.incrementAndGet() <= limit;
        }
    }
}