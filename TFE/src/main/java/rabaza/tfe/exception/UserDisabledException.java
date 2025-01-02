package rabaza.tfe.exception;

public class UserDisabledException extends RuntimeException {
    public UserDisabledException(String message, Throwable cause) {
        super(message, cause);
    }
}
