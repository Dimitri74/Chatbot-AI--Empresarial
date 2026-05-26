package com.aether.controller;

import com.aether.service.DocumentService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.util.Map;

@Path("/api/documents")
@Tag(name = "Documents", description = "Endpoints para gerenciar documentos")
public class DocumentController {

    @Inject
    DocumentService documentService;

    @POST
    @Path("/upload")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Faz upload e indexa um documento")
    public Response upload(@FormParam("file") FileUpload file) {
        try {
            int chunks = documentService.processUpload(
                    java.nio.file.Files.newInputStream(file.uploadedFile()),
                    file.fileName(),
                    file.contentType()
            );

            return Response.ok(Map.of(
                    "message", "Documento indexado com sucesso",
                    "fileName", file.fileName(),
                    "chunks", chunks
            )).build();
        } catch (Exception e) {
            return Response.serverError()
                    .entity(Map.of("error", "Erro ao processar documento: " + e.getMessage()))
                    .build();
        }
    }
}