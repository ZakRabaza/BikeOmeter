package rabaza.tfe.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;
import rabaza.tfe.dto.UserInfo;
import rabaza.tfe.model.User;

import java.util.List;

@Mapper
public interface UserMapper {

        UserMapper INSTANCE = Mappers.getMapper( UserMapper.class );

        List<UserInfo> usersToUsersInfo(List<User> users);
        UserInfo userToUserInfo(User user);
        User userInfoToUser(UserInfo userInfo);
}
