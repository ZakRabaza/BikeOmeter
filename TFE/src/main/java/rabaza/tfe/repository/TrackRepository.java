package rabaza.tfe.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import rabaza.tfe.model.Track;
import rabaza.tfe.model.User;

import java.util.List;

@Repository
public interface TrackRepository extends JpaRepository<Track, Integer> {

    @Query("SELECT t FROM Track t WHERE t.owner = :owner AND t.shared = false")
    List<Track> findByOwnerAndSharedFalse(@Param("owner") User owner);

    @Query("SELECT t FROM Track t WHERE t.owner = :owner AND t.shared = true")
    List<Track> findByOwnerAndSharedTrue(@Param("owner") User owner);

    @Query("SELECT t FROM Track t WHERE t.owner <> :owner AND t.shared = true")
    List<Track> findByOwnerNotAndSharedTrue(@Param("owner") User owner);


}
