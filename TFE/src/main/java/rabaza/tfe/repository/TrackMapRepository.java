package rabaza.tfe.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rabaza.tfe.model.TrackMap;

@Repository
public interface TrackMapRepository extends JpaRepository<TrackMap, Integer> {

}
