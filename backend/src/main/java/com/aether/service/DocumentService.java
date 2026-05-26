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
import java.util.Set;

@ApplicationScoped
public class DocumentService {

    private static final Logger LOG = Logger.getLogger(DocumentService.class);

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "txt", "md", "markdown");
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf", "text/plain", "text/markdown", "text/x-markdown"
    );
    private static final long MAX_FILE_SIZE_BYTES = 10L * 1024 * 1024; // 10 MB

    @Inject
    DocumentProcessor documentProcessor;

    public int processUpload(InputStream inputStream, String fileName, String contentType, long fileSize) throws Exception {
        validateFile(fileName, contentType, fileSize);

        // Sanitiza o nome do arquivo para evitar path traversal
        String safeName = Path.of(fileName).getFileName().toString().replaceAll("[^a-zA-Z0-9._\\-]", "_");

        Path tempFile = Files.createTempFile("aether-upload-", "-" + safeName);
        try {
            Files.copy(inputStream, tempFile, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            Document document;
            if (contentType != null && contentType.contains("pdf")) {
                document = FileSystemDocumentLoader.loadDocument(tempFile, new ApachePdfBoxDocumentParser());
            } else {
                document = FileSystemDocumentLoader.loadDocument(tempFile);
            }

            document.metadata().put("file_name", safeName);
            return documentProcessor.ingest(document, safeName);
        } finally {
            Files.deleteIfExists(tempFile);
        }
    }

    private void validateFile(String fileName, String contentType, long fileSize) {
        if (fileName == null || fileName.isBlank()) {
            throw new IllegalArgumentException("Nome do arquivo invalido.");
        }

        String ext = fileName.contains(".")
                ? fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase()
                : "";
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new IllegalArgumentException("Tipo de arquivo nao permitido. Formatos aceitos: PDF, TXT, MD.");
        }

        if (contentType != null && !contentType.isBlank()) {
            String baseType = contentType.split(";")[0].trim().toLowerCase();
            if (!ALLOWED_CONTENT_TYPES.contains(baseType) && !baseType.startsWith("text/")) {
                throw new IllegalArgumentException("Tipo de conteudo nao permitido para extensao " + ext.toUpperCase() + ".");
            }
        }

        if (fileSize > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("Arquivo muito grande. Limite maximo: 10 MB.");
        }
    }
}