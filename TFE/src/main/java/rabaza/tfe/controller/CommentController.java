package rabaza.tfe.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import rabaza.tfe.dto.CommentInfo;
import rabaza.tfe.service.CommentService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @GetMapping("/track/{trackId}")
    @ResponseStatus(HttpStatus.OK)
    public List<CommentInfo> getCommentsByTrackId(@PathVariable Integer trackId) {
        return commentService.getCommentsByTrackId(trackId);
    }

    @GetMapping("/{commentId}")
    @ResponseStatus(HttpStatus.OK)
    public CommentInfo getCommentById(@PathVariable Integer commentId) {
        return commentService.getCommentById(commentId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void addNewComment(@RequestBody CommentInfo commentInfo) {
        commentService.addNewComment(commentInfo);
    }

    @PutMapping
    @ResponseStatus(HttpStatus.OK)
    public void updateComment(@RequestBody CommentInfo commentInfo) {
        commentService.updateComment(commentInfo);
    }

    @DeleteMapping("/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(@PathVariable Integer commentId) {
        commentService.deleteComment(commentId);
    }
}
