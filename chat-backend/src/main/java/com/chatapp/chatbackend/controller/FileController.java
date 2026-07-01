package com.chatapp.chatbackend.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "http://localhost:5173")
public class FileController {

    private static final String UPLOAD_DIR =
            System.getProperty("user.dir") + "/uploads/";

    @PostMapping("/upload")
    public Map<String, String> uploadFile(
            @RequestParam("file") MultipartFile file
    ) throws IOException {

        File uploadFolder = new File(UPLOAD_DIR);

        if (!uploadFolder.exists()) {
            uploadFolder.mkdirs();
        }

        String originalName = file.getOriginalFilename();

        String fileName =
                UUID.randomUUID() + "_" + originalName;

        File destination =
                new File(UPLOAD_DIR + fileName);

        file.transferTo(destination);

        String fileUrl =
                "http://localhost:8080/uploads/" + fileName;

        Map<String, String> response = new HashMap<>();

        response.put("fileUrl", fileUrl);
        response.put("fileName", originalName);

        return response;
    }
}