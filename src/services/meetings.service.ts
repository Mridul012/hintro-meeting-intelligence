import prisma from "../config/database"
import logger from "../utils/logger"
import { CreateMeetingInput, ListMeetingsInput } from "../schemas/meeting.schema"

export async function createMeeting(userId: string, data: CreateMeetingInput) {
  const meeting = await prisma.meeting.create({
    data: {
      userId,
      title: data.title,
      meetingDate: new Date(data.meetingDate),
      participants: data.participants as any,
      transcript: data.transcript as any,
    },
  })

  logger.info({ meetingId: meeting.id, userId }, "meeting created")
  return meeting
}

export async function getMeeting(id: string, userId: string) {
  // findFirst lets us filter on both id and userId (findUnique only takes unique fields)
  const meeting = await prisma.meeting.findFirst({
    where: { id, userId },
    include: { analysis: true },
  })

  if (!meeting) {
    throw Object.assign(new Error("Meeting not found"), { statusCode: 404 })
  }

  return meeting
}

export async function listMeetings(userId: string, query: ListMeetingsInput) {
  const {page,limit} = query

  const skip = (page - 1) * limit

  const [meetings, total] = await Promise.all([
    prisma.meeting.findMany({
      where: { userId },
      skip,
      take: query.limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.meeting.count({ where: { userId } }),
  ])

  return {
    meetings,
    total,
    page: query.page,
    limit: query.limit,
    totalPages: Math.ceil(total / query.limit),
  }
}
