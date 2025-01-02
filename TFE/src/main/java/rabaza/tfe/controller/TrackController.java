package rabaza.tfe.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import rabaza.tfe.dto.LocationsRequest;
import rabaza.tfe.dto.ShareTrackRequest;
import rabaza.tfe.dto.TrackInfo;
import rabaza.tfe.dto.UserInfo;
import rabaza.tfe.service.TrackService;

import java.util.List;

@RestController
@RequestMapping(path = "api/v1/tracks")
public class TrackController {

    private final TrackService trackService;

    @Autowired
    public TrackController(TrackService trackService) {
        this.trackService = trackService;
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<TrackInfo> getTracks() {
        return trackService.getTracks();
    }

    @GetMapping("{trackId}")
    @ResponseStatus(HttpStatus.OK)
    public TrackInfo getTrackById(@PathVariable Integer trackId) {
        return trackService.getTrackById(trackId);
    }

    @PostMapping(path = "owner")
    @ResponseStatus(HttpStatus.OK)
    public List<TrackInfo> getUserTracks(@RequestBody UserInfo userInfo) {
        return trackService.getUserTracks(userInfo);
    }

    @PostMapping(path = "location")
    @ResponseStatus(HttpStatus.CREATED)
    public void addNewTrackFromLocation(@RequestBody LocationsRequest locationsRequest){
        trackService.addNewTrackFromLocation(locationsRequest);
    }

    @DeleteMapping(path = "{trackId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTrack(@PathVariable("trackId") Integer trackId) {
        trackService.deleteTrack(trackId);
    }


    @PostMapping(path = "unshared/user")
    @ResponseStatus(HttpStatus.OK)
    public List<TrackInfo> getUserUnsharedTracks(@RequestBody UserInfo userInfo) {
        return trackService.getUserUnsharedTracks(userInfo);
    }

    @PostMapping(path = "shared/user")
    @ResponseStatus(HttpStatus.OK)
    public List<TrackInfo> getUserSharedTracks(@RequestBody UserInfo userInfo) {
        return trackService.getUserSharedTracks(userInfo);
    }

    @PostMapping(path = "shared/others")
    @ResponseStatus(HttpStatus.OK)
    public List<TrackInfo> getSharedTracksExcludingUser(@RequestBody UserInfo userInfo) {
        return trackService.getSharedTracksExcludingUser(userInfo);
    }

    @PutMapping("{trackId}/share")
    @ResponseStatus(HttpStatus.OK)
    public void updateTrackSharingStatus(@PathVariable Integer trackId, @RequestBody ShareTrackRequest shareTrackRequest) {
        trackService.updateSharingStatus(trackId, shareTrackRequest);
    }

}
