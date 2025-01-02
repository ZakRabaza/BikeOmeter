package rabaza.tfe.exception;

public class InvalidCredentialException extends RuntimeException {
    public InvalidCredentialException(String message, Throwable cause) {
        super(message, cause);
    }
}

