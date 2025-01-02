package rabaza.tfe.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import rabaza.tfe.dto.MarkerInfo;
import rabaza.tfe.model.Marker;

import java.util.List;

@Mapper
public interface MarkerMapper {

    MarkerMapper INSTANCE = Mappers.getMapper( MarkerMapper.class );

    List<MarkerInfo> markersToMarkersInfo(List<Marker> markers);
    @Mapping(source = "trackMap.id", target = "trackMapId")
    @Mapping(source = "latitude", target = "coordinate.latitude")
    @Mapping(source = "longitude", target = "coordinate.longitude")
    MarkerInfo markerToMarkerInfo(Marker marker);
    @Mapping(source = "trackMapId", target = "trackMap.id")
    @Mapping(source = "coordinate.latitude", target = "latitude")
    @Mapping(source = "coordinate.longitude", target = "longitude")
    Marker markerInfoToMarker(MarkerInfo markerInfo);
}
