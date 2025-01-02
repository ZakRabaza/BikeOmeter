package rabaza.tfe.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rabaza.tfe.dto.CommentInfo;
import rabaza.tfe.mapper.CommentMapper;
import rabaza.tfe.model.Comment;
import rabaza.tfe.model.Track;
import rabaza.tfe.model.User;
import rabaza.tfe.repository.CommentRepository;
import rabaza.tfe.repository.TrackRepository;
import rabaza.tfe.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final TrackRepository trackRepository;
    private final UserRepository userRepository;

    @Autowired
    public CommentService(CommentRepository commentRepository, TrackRepository trackRepository, UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.trackRepository = trackRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<CommentInfo> getCommentsByTrackId(Integer trackId) {
        List<Comment> comments = commentRepository.findByTrackId(trackId);
        return CommentMapper.INSTANCE.commentsToCommentsInfo(comments);
    }

    @Transactional(readOnly = true)
    public CommentInfo getCommentById(Integer commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalStateException("Comment with id " + commentId + " does not exist"));
        return CommentMapper.INSTANCE.commentToCommentInfo(comment);
    }

    @Transactional
    public Comment addNewComment(CommentInfo commentInfo ) {
        Track track = trackRepository.findById(commentInfo.getTrackId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid track ID"));
        User user = userRepository.findUserByEmail(commentInfo.getAuthorEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid user ID"));

        Comment comment = new Comment();
        comment.setContent(commentInfo.getContent());
        comment.setCreatedDate(LocalDateTime.now());
        comment.setAuthor(user);
        comment.setTrack(track);
        return commentRepository.save(comment);
    }

    @Transactional
    public Comment updateComment(CommentInfo commentInfo) {
        Comment comment = commentRepository.findById(commentInfo.getId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid comment ID"));
        if (!comment.isAuthor(userRepository.findUserByEmail(commentInfo.getAuthorEmail()).orElse(null))) {
            throw new IllegalStateException("User is not the author of the comment");
        }
        // Update comment content if the provided content is not null and different from the current content
        if (commentInfo.getContent() != null && !Objects.equals(comment.getContent(), commentInfo.getContent())) {
            comment.editContent(commentInfo.getContent());
        }
        return commentRepository.save(comment);
    }
    @Transactional
    public void deleteComment(Integer commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid comment ID"));
        commentRepository.delete(comment);
    }

}
