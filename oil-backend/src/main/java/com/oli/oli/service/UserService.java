package com.oli.oli.service;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.oli.oli.model.User;
import com.oli.oli.repository.UserRepository;

import jakarta.persistence.criteria.Predicate;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> findBySearch(String q, int page, int pageSize, String sortBy, String sortOrder) {
        Specification<User> spec = buildSearchSpecification(q);
        Sort sort = buildSort(sortBy, sortOrder);
        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);
        return userRepository.findAll(spec, pageable).getContent();
    }

    public long countBySearch(String q) {
        Specification<User> spec = buildSearchSpecification(q);
        return userRepository.count(spec);
    }

    private Specification<User> buildSearchSpecification(String q) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(q)) {
                return cb.conjunction();
            }
            String searchTerm = "%" + q.toLowerCase() + "%";
            Predicate firstNamePred = cb.like(cb.lower(root.get("firstName")), searchTerm);
            Predicate lastNamePred = cb.like(cb.lower(root.get("lastName")), searchTerm);
            Predicate emailPred = cb.like(cb.lower(root.get("email")), searchTerm);
            Predicate phonePred = cb.and(
                cb.isNotNull(root.get("phone")),
                cb.like(cb.lower(root.get("phone")), searchTerm)
            );
            return cb.or(firstNamePred, lastNamePred, emailPred, phonePred);
        };
    }

    private Sort buildSort(String sortBy, String sortOrder) {
        if (sortBy == null || sortBy.isEmpty()) {
            sortBy = "createdAt";
        }
        
        String propertyName = mapSortByToProperty(sortBy);
        Sort.Direction direction = "asc".equalsIgnoreCase(sortOrder) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(direction, propertyName);
    }

    private String mapSortByToProperty(String sortBy) {
        return switch (sortBy.toLowerCase()) {
            case "id" -> "id";
            case "firstname" -> "firstName";
            case "lastname" -> "lastName";
            case "email" -> "email";
            case "createdat" -> "createdAt";
            case "updatedat" -> "updatedAt";
            default -> "createdAt";
        };
    }
}

