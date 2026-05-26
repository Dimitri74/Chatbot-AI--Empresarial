package com.aether.controller;

import com.aether.service.DocumentService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.logging.Logger;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.util.Map;

@Path("/api/documents")
@Tag(name = "Documents", description = "Endpoints para gerenciar documentos")
public class DocumentController {

    private static final Logger LOG = Logger.getLogger(DocumentController.class);

    @Inject
    DocumentService documentService;

    @POST
    @Path("/upload")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Faz upload e indexa um documento")
    public Response upload(@FormParam("file") FileUpload file) {
        try {
            long fileSize = java.nio.file.Files.size(file.uploadedFile());
            int chunks = documentService.processUpload(
                    java.nio.file.Files.newInputStream(file.uploadedFile()),
                    file.fileName(),
                    file.contentType(),
                    fileSize
            );

            return Response.ok(Map.of(
                    "message", "Documento indexado com sucesso",
                    "fileName", file.fileName(),
                    "chunks", chunks
            )).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        } catch (Exception e) {
            LOG.errorf(e, "Erro ao processar upload do arquivo: %s", file.fileName());
            return Response.serverError()
                    .entity(Map.of("error", "Erro ao processar o documento. Verifique o formato e tente novamente."))
                    .build();
        }
    }
}