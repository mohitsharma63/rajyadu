package com.oli.oli.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("png", "jpg", "jpeg", "webp", "gif");

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public String storeImage(MultipartFile file, String subDir) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
        String ext = getExtension(originalFilename);
        if (ext.isBlank() || !ALLOWED_EXTENSIONS.contains(ext.toLowerCase(Locale.ROOT))) {
            throw new IllegalArgumentException("Unsupported file type");
        }

        String filename = UUID.randomUUID() + "." + ext;

        Path baseDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path targetDir = baseDir.resolve(subDir).normalize();
        Path targetFile = targetDir.resolve(filename).normalize();

        if (!targetFile.startsWith(baseDir)) {
            throw new IllegalArgumentException("Invalid upload path");
        }

        try {
            Files.createDirectories(targetDir);
            try (var inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetFile, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }

        return "/uploads/" + subDir + "/" + filename;
    }

    public void deleteIfExistsByUrl(String url) {
        if (url == null || url.isBlank()) {
            return;
        }
        if (!url.startsWith("/uploads/")) {
            return;
        }

        String relative = url.substring("/uploads/".length());
        Path baseDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path path = baseDir.resolve(relative).normalize();

        if (!path.startsWith(baseDir)) {
            return;
        }

        try {
            Files.deleteIfExists(path);
        } catch (IOException ignored) {
        }
    }

    private static String getExtension(String filename) {
        int idx = filename.lastIndexOf('.');
        if (idx < 0 || idx == filename.length() - 1) {
            return "";
        }
        return filename.substring(idx + 1);
    }
}
