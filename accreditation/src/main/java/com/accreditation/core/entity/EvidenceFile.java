package com.accreditation.core.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "evidence_files")
@Getter
@Setter
public class EvidenceFile {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    // Which task?
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    // Who uploaded?
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploader_user_id")
    private User uploader;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    @Column(name = "is_valid")
    private Boolean isValid = false;

    @Column(name = "validation_notes", columnDefinition = "TEXT")
    private String validationNotes;

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
    }
}