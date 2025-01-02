package rabaza.tfe.utils;

import org.springframework.stereotype.Service;
import rabaza.tfe.dto.LocationRequest;
import rabaza.tfe.model.User;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

import static java.time.temporal.ChronoUnit.SECONDS;

@Service
public class TrackCreator {
    public LocalDateTime convertToLocalDateTimeViaInstant(Date dateToConvert) {
        return dateToConvert.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();
    }
    public LocalTime convertToLocalTimeViaInstant(Date dateToConvert) {
        return dateToConvert.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalTime();
    }
    public LocalTime timeBetween(LocalTime time1, LocalTime time2 ){
        return LocalTime.ofSecondOfDay(SECONDS.between(time1, time2));
    }

    public double calculateDistance(List<LocationRequest> locationRequestList){

        double totalDistance = 0.0;

        // Iterate through each location request to calculate distance
        for (int i = 0; i < locationRequestList.size() - 1; i++) {
            double startLat = locationRequestList.get(i).getLatitude();
            double startLong = locationRequestList.get(i).getLongitude();
            double endLat = locationRequestList.get(i + 1).getLatitude();
            double endLong = locationRequestList.get(i + 1).getLongitude();

            // Calculate distance between current and next locations
            double distance = Formulas.calculateDistance(startLat, startLong, endLat, endLong);

            totalDistance += distance;
        }
        return totalDistance;
    }

    public double calculateCalories(double averageSpeed, LocalTime totalDuration, User owner){
        double bmr = Formulas.basalMetabolicRate(owner.getWeight(),owner.getHeight(), owner.getAge(), owner.getGender());
        return Formulas.calculateCalories(bmr,averageSpeed,totalDuration);
    }

}
