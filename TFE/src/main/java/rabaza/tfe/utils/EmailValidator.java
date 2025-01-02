package rabaza.tfe.utils;

import org.springframework.stereotype.Service;

import java.util.function.Predicate;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class EmailValidator implements Predicate<String> {

    String regex = "^(.+)@(.+)$";
    Pattern pattern = Pattern.compile(regex);

    @Override
    public boolean test(String s) {
        Matcher matcher = pattern.matcher(s);
        return matcher.matches();
    }
}
