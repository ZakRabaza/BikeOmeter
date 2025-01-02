package rabaza;

import org.apache.commons.lang3.StringUtils;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

public class T4 {
    @Test
    void test(){
        System.out.println(StringUtils.isNotBlank("j"));
    }

    @Test
    void test2(){
//        Assertions.assertEquals("Blabla",);
        // deuxieme objet pas crée
        System.out.println("Blabla"=="Blabla");
        System.out.println("Blabla"== new String ("Blabla"));
        System.out.println("Blabla".equals( new String ("Blabla")));
    }
}
