package com.oli.oli.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.oli.oli.model.Otp;

public interface OtpRepository extends JpaRepository<Otp, Long> {
    Optional<Otp> findFirstByPhoneAndVerifiedFalseOrderByCreatedAtDesc(String phone);

    Optional<Otp> findFirstByPhoneAndVerifiedTrueOrderByCreatedAtDesc(String phone);

    List<Otp> findByPhoneAndVerifiedFalse(String phone);

    void deleteByPhone(String phone);
}

