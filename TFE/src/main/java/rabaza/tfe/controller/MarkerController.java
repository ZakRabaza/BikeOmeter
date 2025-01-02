package rabaza.tfe.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import rabaza.tfe.dto.MarkerInfo;
import rabaza.tfe.service.MarkerService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/markers")
public class MarkerController {

    @Autowired
    private MarkerService markerService;
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<MarkerInfo> getMarkers() {
        return markerService.getMarkers();
    }

    @GetMapping("/trackMap/{trackMapId}")
    @ResponseStatus(HttpStatus.OK)
    public List<MarkerInfo> getMarkersByTrackMapId(@PathVariable Integer trackMapId) {
        return markerService.getMarkersByTrackMapId(trackMapId);
    }

    @GetMapping("/{markerId}")
    @ResponseStatus(HttpStatus.OK)
    public MarkerInfo getMarkerById(@PathVariable Integer markerId) {
        return markerService.getMarkerById(markerId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void  addNewMarker(@RequestBody MarkerInfo markerInfo){
        markerService.addNewMarker(markerInfo);
    }

    @PutMapping
    @ResponseStatus(HttpStatus.OK)
    public void updateMarker(@RequestBody MarkerInfo markerInfo) {
         markerService.updateMarker(markerInfo);
    }

    @DeleteMapping("/{markerId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMarker(@PathVariable Integer markerId) {
        markerService.deleteMarker(markerId);
    }
}
