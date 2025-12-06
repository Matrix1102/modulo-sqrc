package com.sqrc.module.backendsqrc.plantillaRespuesta.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupabaseStorageService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service-key}")
    private String serviceKey;

    @Value("${supabase.bucket.manuales}")
    private String bucketManuales;

    @Value("${supabase.bucket.automaticas}")
    private String bucketAutomaticas;

    private final WebClient webClient = WebClient.builder().build();

    /**
     * Sube un PDF a un bucket y devuelve la URL pública.
     */
    public String uploadPdf(String bucket, String objectPath, byte[] pdfBytes) {
        String uploadUrl = supabaseUrl + "/storage/v1/object/" + bucket + "/" + objectPath;

        log.info("Subiendo PDF a Supabase: {} (bucket={})", objectPath, bucket);

        webClient.post()
                .uri(uploadUrl)
                .header("apikey", serviceKey)
                .header("Authorization", "Bearer " + serviceKey)
                .contentType(MediaType.APPLICATION_PDF)
                .bodyValue(pdfBytes)
                .retrieve()
                .toBodilessEntity()
                .block();  // para simplificar

        // URL pública (para buckets marcados como "public")
        String publicUrl = supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + objectPath;
        log.info("PDF subido. URL pública: {}", publicUrl);
        return publicUrl;
    }

    public String uploadPdfManual(String objectPath, byte[] pdfBytes) {
        return uploadPdf(bucketManuales, objectPath, pdfBytes);
    }

    public String uploadPdfAutomatico(String objectPath, byte[] pdfBytes) {
        return uploadPdf(bucketAutomaticas, objectPath, pdfBytes);
    }
}
