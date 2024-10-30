import { RequestWithUser } from "../middlewares/authMiddleware";
import { generateRandomString } from "../utils/generateMeetingId";
import prismaClient from "../utils/prisma";
import { Request, RequestHandler, Response } from "express";

export const startMeeting: RequestHandler = async (
  req: RequestWithUser,
  res: Response
) => {
  const { title, description } = req.body;
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ message: "user id not found" });
    return;
  }

  const meeting = await prismaClient.meeting.create({
    data: {
      isRecordingEnabled: false,
      accessCode: await generateRandomString(),
      meetingLink: await generateRandomString(),
      title: title,
      description: description,
      startTime: new Date(Date.now()),
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      hostId: userId,
      maxParticipants: 2,
      status: "ONGOING",
    },
  });

  res.status(200).json({
    ...meeting,
    message: "meeting created successfully",
  });
};

// export const joinMeeting: RequestHandler = async (
//   req: RequestWithUser,
//   res: Response
// ) => {
//   const userId = req.userId;
//   const { accessCode, meetingId } = req.body;
//   if (!accessCode || !meetingId)
//     res.status(203).json({
//       message: "accessCode is required",
//     });
//   if (!userId) {
//     res.status(401).json({
//       message: "user id not found",
//     });
//   }

//   const user = await prismaClient.user.findFirst({
//     where: {
//       id: userId,
//     },
//   });

//   if (!user) {
//     res.status(404).json({
//       message: "user not found",
//     });
//     return;
//   }

//   const meeting = await prismaClient.meeting.findFirst({
//     where: {
//       accessCode: accessCode,
//     },
//   });

//   if (!meeting || !meeting) {
//     res.status(404).json({
//       message: "meeting not found",
//     });
//     return;
//   }

//   const participants = await prismaClient.participant.create({
//     data: {
//       meetingId: meeting.id,
//       joinedAt: new Date(),
//       userId: user.id,
//     },
//   });

//   await prismaClient.meeting.update({
//     where: {
//       id: meeting.id,
//     },
//     data: {
//       participants: [...meeting.participants, participants],
//     },
//   });

//   res.status(200).json({
//     message: "meeting joined successfully",
//     meeting,
//   });
// };
