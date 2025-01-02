package rabaza.tfe.utils;

import rabaza.tfe.model.UserGender;

import java.time.LocalTime;

public class Formulas {

    private static final double EARTH_RADIUS = 6366.00 ;

    static double haversine(double val) {
        return Math.pow(Math.sin(val / 2), 2);

    }
    static double calculateDistance(double startLat, double startLong, double endLat, double endLong) {
        //value given is in km

        double dLat = Math.toRadians((endLat - startLat));
        double dLong = Math.toRadians((endLong - startLong));

        startLat = Math.toRadians(startLat);
        endLat = Math.toRadians(endLat);

        double a = haversine(dLat) + Math.cos(startLat) * Math.cos(endLat) * haversine(dLong);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS * c;
    }
    static double  basalMetabolicRate(double weight,double height, int age , UserGender gender){
        //weight in kg
        //height in cm
        //age in year
        double maleFormula = (10*weight)+(6.25*height)-(5*age)+5;
        double femaleFormula = (10*weight)+(6.25*height)-(5*age)-161;

        return (gender == UserGender.MALE)?maleFormula:femaleFormula;
    }

    static double calculateCalories(double basalMetabolicRate, double averageSpeed , LocalTime totalTime){

        double bmrPerHour = basalMetabolicRate/24;

        //totalTime in hours
        double hours = totalTime.getHour() + (double) totalTime.getMinute() / 60 + (double) totalTime.getSecond() / 3600;

        double met = 0 ;
        if(averageSpeed<16.1)
            met=4;
        else if (averageSpeed>=16.1 && averageSpeed <19.2) {
            met=6.8;
        }
        else if (averageSpeed>=19.2 && averageSpeed <22.4) {
            met=8;
        }
        else if (averageSpeed>=22.4 && averageSpeed <25.7) {
            met=10;
        }
        else if (averageSpeed>=25.7 && averageSpeed <32.1) {
            met=12;
        }
        else if (averageSpeed>=32.2) {
            met=15.8;
        }

        return bmrPerHour * met  * hours;
    }
}
