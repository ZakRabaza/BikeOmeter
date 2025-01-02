package rabaza.tfe.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import rabaza.tfe.model.Marker;

import java.util.List;

@Repository
public interface MarkerRepository extends JpaRepository<Marker, Integer> {
    @Query("SELECT m FROM Marker m WHERE m.trackMap.id = :trackMapId")
    List<Marker> findByTrackMapId(@Param("trackMapId") Integer trackMapId);

}
