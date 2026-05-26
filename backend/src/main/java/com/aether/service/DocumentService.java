package com.aether.service;

import com.aether.document.DocumentProcessor;
import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.loader.FileSystemDocumentLoader;
import dev.langchain4j.data.document.parser.apache.pdfbox.ApachePdfBoxDocumentParser;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

@ApplicationScoped
public class DocumentService {

    private static final Logger LOG = Logger.getLogger(DocumentService.class);

    @Inject
    DocumentProcessor documentProcessor;

    public int processUpload(InputStream inputStream, String fileName, String contentType) throws Exception {
        Path tempFile = Files.createTempFile("aether-upload-", "-" + fileName);
        try {
            Files.copy(inputStream, tempFile, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            Document document;
            if (contentType != null && contentType.contains("pdf")) {
                document = FileSystemDocumentLoader.loadDocument(tempFile, new ApachePdfBoxDocumentParser());
            } else {
                document = FileSystemDocumentLoader.loadDocument(tempFile);
            }

            document.metadata().put("file_name", fileName);
            return documentProcessor.ingest(document, fileName);
        } finally {
            Files.deleteIfExists(tempFile);
        }
    }
}