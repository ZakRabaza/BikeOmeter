package rabaza.tfe.exception;

public class EmailTakenException extends RuntimeException {
    public EmailTakenException(String msg) {
        super(msg);
    }
}