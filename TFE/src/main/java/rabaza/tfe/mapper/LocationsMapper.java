package rabaza.tfe.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import rabaza.tfe.dto.LocationsRequest;
import rabaza.tfe.model.Locations;

@Mapper
public interface LocationsMapper {

    LocationsMapper INSTANCE = Mappers.getMapper( LocationsMapper.class );

    @Mapping(source = "locationRequests", target = "locationsList")
    @Mapping(source = "markerInfos", target = "markersList")
    @Mapping(source = "startTime", target = "startTime")
    @Mapping(source = "stopTime", target = "stopTime")
    @Mapping(source = "pauseTime", target = "pauseTime")
    @Mapping(source = "userEmail", target = "userEmail")

    Locations locationsRequestToLocations(LocationsRequest locationsRequest);

}
