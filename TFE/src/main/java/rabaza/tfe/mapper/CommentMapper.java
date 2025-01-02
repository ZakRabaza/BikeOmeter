package rabaza.tfe.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import rabaza.tfe.dto.CommentInfo;
import rabaza.tfe.model.Comment;

import java.util.List;

@Mapper
public interface CommentMapper {

    CommentMapper INSTANCE = Mappers.getMapper( CommentMapper.class );

    @Mapping(source = "author.email", target = "authorEmail")
    @Mapping(source = "track.id", target = "trackId")
    CommentInfo commentToCommentInfo(Comment comment);

    @Mapping(source = "authorEmail", target = "author.email")
    @Mapping(source = "trackId", target = "track.id")
    Comment commentInfoToComment(CommentInfo commentInfo);

    List<CommentInfo> commentsToCommentsInfo(List<Comment> comments);

}
