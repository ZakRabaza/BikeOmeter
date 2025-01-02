
INSERT INTO USERS(
	id, birth_day, email, enable, gender, height, locked, name, password, role, weight)
	VALUES
		(1000,'1993-12-17','user1@mail.com',true,'MALE',175.0,false,'User1','$2a$10$eMkhJVsqQ9FE8.pEpPf3Ked3pW7Slyk17RUIoogV6eTcd8mFniYLa','USER',70.0),
		(2000,'1994-07-23','user2@mail.com',true,'MALE',185.0,false,'User2','$2a$10$eMkhJVsqQ9FE8.pEpPf3Ked3pW7Slyk17RUIoogV6eTcd8mFniYLa','USER',65.0),
		(3000,'1995-08-24','user3@mail.com',true,'FEMALE',166.0,false,'User3','$2a$10$eMkhJVsqQ9FE8.pEpPf3Ked3pW7Slyk17RUIoogV6eTcd8mFniYLa','USER',60.0),
		(4000,'1993-08-24','zakariya@mail.com',true,'MALE',175.0,false,'Zakariya','$2a$10$eMkhJVsqQ9FE8.pEpPf3Ked3pW7Slyk17RUIoogV6eTcd8mFniYLa','USER',67.0)
		;

INSERT INTO TRACK(
	id, active_time, average_speed, calories, date, distance, finish_altitude, finish_time, max_altitude, max_speed, min_altitude, pause_time, start_altitude, start_time, total_time, owner_id)
	VALUES
	   (1000,'1:07:18',19.1,734,'2023-04-23 10:15:00',21.67,53,'11:28:45',71,38,39,'0:06:33',51,'10:15:00','1:13:45',1000),
	   (2000,'1:03:00',20.5,555,'2023-04-30 10:24:00',21.60,52,'11:27:17',56,41.4,38,'0:00:00',45,'10:24:00','1:03:00',1000),
	   (3000,'1:12:09',17.9,441,'2023-05-07 10:46:00',22.97,41,'12:02:02',53,40.7,28,'0:04:55',43,'10:46:00','1:17:02',1000),
	   (4000,'0:58:47',20.8,429,'2023-05-21 11:28:00',20.39,42,'12:25:13',55,35.2,34,'0:00:00',35,'11:28:00','0:58:47',1000),
	   (5000,'0:58:12',21.1,439,'2023-05-28 11:09:00',20.50,40,'12:07:12',54,36.3,38,'0:00:00',50,'11:09:00','0:58:12',1000),

	   (6000,'0:56:45',21.5,415,'2023-06-04 10:46:00',20.30,39,'11:43:30',55,38.6,38,'0:00:00',50,'10:46:00','0:56:45',2000),
	   (7000,'0:58:39',20.8,375,'2023-06-11 8:49:00',20.37,41,'9:50:20',55,39,38,'0:02:33',51,'8:49:00','1:01:20',2000);