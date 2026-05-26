package com.aether.document;

import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.DocumentSplitter;
import dev.langchain4j.data.document.splitter.DocumentSplitters;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.EmbeddingStoreIngestor;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

@ApplicationScoped
public class DocumentProcessor {

    private static final Logger LOG = Logger.getLogger(DocumentProcessor.class);

    @Inject
    EmbeddingStore<TextSegment> embeddingStore;

    @Inject
    EmbeddingModel embeddingModel;

    @ConfigProperty(name = "aether.rag.chunk-size", defaultValue = "500")
    int chunkSize;

    @ConfigProperty(name = "aether.rag.chunk-overlap", defaultValue = "50")
    int chunkOverlap;

    public int ingest(Document document, String documentName) {
        LOG.infof("Processando documento: %s", documentName);

        DocumentSplitter splitter = DocumentSplitters.recursive(chunkSize, chunkOverlap);

        EmbeddingStoreIngestor ingestor = EmbeddingStoreIngestor.builder()
                .embeddingStore(embeddingStore)
                .embeddingModel(embeddingModel)
                .documentSplitter(splitter)
                .build();

        ingestor.ingest(document);

        int chunkCount = splitter.split(document).size();
        LOG.infof("Documento '%s' indexado com %d chunks", documentName, chunkCount);
        return chunkCount;
    }
}