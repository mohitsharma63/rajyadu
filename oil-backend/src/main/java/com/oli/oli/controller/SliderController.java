package com.oli.oli.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.oli.oli.dto.SliderDto;
import com.oli.oli.model.Slider;
import com.oli.oli.repository.SliderRepository;
import com.oli.oli.service.FileStorageService;

@RestController
@RequestMapping("/api/sliders")
public class SliderController {

    private final SliderRepository sliderRepository;
    private final FileStorageService fileStorageService;

    public SliderController(SliderRepository sliderRepository, FileStorageService fileStorageService) {
        this.sliderRepository = sliderRepository;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping
    public List<SliderDto> list() {
        return sliderRepository.findAll().stream().map(SliderController::toDto).toList();
    }

    @GetMapping("/{id}")
    public SliderDto get(@PathVariable Long id) {
        Slider slider = sliderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Slider not found"));
        return toDto(slider);	
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public SliderDto create(
            @RequestParam(value = "title", required = false) String title,
            @RequestParam("image") MultipartFile image
    ) {
        Slider slider = new Slider();
        slider.setTitle(title);
        slider.setImageUrl(fileStorageService.storeImage(image, "sliders"));

        Slider saved = sliderRepository.save(slider);
        return toDto(saved);
    }

    @PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public SliderDto update(
            @PathVariable Long id,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        Slider slider = sliderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Slider not found"));

        slider.setTitle(title);

        if (image != null && !image.isEmpty()) {
            fileStorageService.deleteIfExistsByUrl(slider.getImageUrl());
            slider.setImageUrl(fileStorageService.storeImage(image, "sliders"));
        }

        Slider saved = sliderRepository.save(slider);
        return toDto(saved);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        Slider slider = sliderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Slider not found"));

        fileStorageService.deleteIfExistsByUrl(slider.getImageUrl());
        sliderRepository.delete(slider);
    }

    private static SliderDto toDto(Slider s) {
        return new SliderDto(s.getId(), s.getTitle(), s.getImageUrl());
    }
}
