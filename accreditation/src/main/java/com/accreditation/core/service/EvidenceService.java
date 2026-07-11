package com.accreditation.core.service;

import com.accreditation.core.entity.EvidenceFile;
import com.accreditation.core.entity.Task;
import com.accreditation.core.entity.User;
import com.accreditation.core.repository.EvidenceFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EvidenceService {

    private final EvidenceFileRepository evidenceFileRepository;
    private final String UPLOAD_DIR = "uploads/evidences/";

    public EvidenceFile createEntity(MultipartFile file, Task task, User uploader) throws IOException {

        File directory = new File(UPLOAD_DIR);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(UPLOAD_DIR + fileName);

        Files.write(filePath, file.getBytes());

        EvidenceFile evidence = new EvidenceFile();
        evidence.setFileName(file.getOriginalFilename());
        evidence.setFilePath(filePath.toString());
        evidence.setTask(task);
        evidence.setUploader(uploader);
        evidence.setFileSizeBytes(file.getSize());

        return evidenceFileRepository.save(evidence);
    }
}
