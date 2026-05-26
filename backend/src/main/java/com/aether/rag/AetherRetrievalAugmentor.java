package com.aether.rag;

import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.rag.DefaultRetrievalAugmentor;
import dev.langchain4j.rag.RetrievalAugmentor;
import dev.langchain4j.rag.content.retriever.EmbeddingStoreContentRetriever;
import dev.langchain4j.store.embedding.EmbeddingStore;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.util.function.Supplier;

@ApplicationScoped
public class AetherRetrievalAugmentor implements Supplier<RetrievalAugmentor> {

    @Inject
    EmbeddingStore<TextSegment> embeddingStore;

    @Inject
    EmbeddingModel embeddingModel;

    @ConfigProperty(name = "aether.rag.max-results", defaultValue = "5")
    int maxResults;

    @ConfigProperty(name = "aether.rag.min-score", defaultValue = "0.7")
    double minScore;

    @Override
    public RetrievalAugmentor get() {
        EmbeddingStoreContentRetriever contentRetriever = EmbeddingStoreContentRetriever.builder()
                .embeddingStore(embeddingStore)
                .embeddingModel(embeddingModel)
                .maxResults(maxResults)
                .minScore(minScore)
                .build();

        return DefaultRetrievalAugmentor.builder()
                .contentRetriever(contentRetriever)
                .build();
    }
}