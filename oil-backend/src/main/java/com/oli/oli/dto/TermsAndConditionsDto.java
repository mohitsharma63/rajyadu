package com.oli.oli.dto;

public class TermsAndConditionsDto {
    private Long id;
    private String sectionTitle;
    private String sectionContent;
    private Integer sectionOrder;
    private Boolean isActive;
    private String lastUpdated;

    public TermsAndConditionsDto() {}

    public TermsAndConditionsDto(Long id, String sectionTitle, String sectionContent, Integer sectionOrder, Boolean isActive, String lastUpdated) {
        this.id = id;
        this.sectionTitle = sectionTitle;
        this.sectionContent = sectionContent;
        this.sectionOrder = sectionOrder;
        this.isActive = isActive;
        this.lastUpdated = lastUpdated;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSectionTitle() {
        return sectionTitle;
    }

    public void setSectionTitle(String sectionTitle) {
        this.sectionTitle = sectionTitle;
    }

    public String getSectionContent() {
        return sectionContent;
    }

    public void setSectionContent(String sectionContent) {
        this.sectionContent = sectionContent;
    }

    public Integer getSectionOrder() {
        return sectionOrder;
    }

    public void setSectionOrder(Integer sectionOrder) {
        this.sectionOrder = sectionOrder;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public String getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(String lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
