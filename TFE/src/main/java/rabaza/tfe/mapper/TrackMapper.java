package rabaza.tfe.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;
import rabaza.tfe.dto.ShareTrackRequest;
import rabaza.tfe.dto.TrackInfo;
import rabaza.tfe.model.Coordinate;
import rabaza.tfe.model.Marker;
import rabaza.tfe.model.Track;
import rabaza.tfe.model.TrackMap;

import java.util.List;

@Mapper
public interface TrackMapper {

    TrackMapper INSTANCE = Mappers.getMapper( TrackMapper.class );
    List<TrackInfo> tracksToTracksInfo(List<Track> tracks);
    TrackInfo trackToTrackInfo(Track track);
    Track trackInfoToTrack(TrackInfo trackInfo);

    ShareTrackRequest trackToShareTrackRequest(Track track);
    Track shareTrackRequestToTrack(ShareTrackRequest shareTrackRequest);

    // Map nested classes
    TrackInfo.TrackMapInfo trackMapToTrackMapInfo(TrackMap trackMap);

    TrackInfo.CoordinateInfo coordinateToCoordinateInfo(Coordinate coordinate);

    TrackInfo.MarkerInfo markerToMarkerInfo(Marker marker);
}
