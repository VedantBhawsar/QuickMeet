import prismaClient from "./prisma";

export async function generateRandomString() {
  const randomChar = () =>
    String.fromCharCode(Math.floor(Math.random() * 26) + 97);

  const id = `${randomChar()}${randomChar()}${randomChar()}-${randomChar()}${randomChar()}${randomChar()}-${randomChar()}${randomChar()}${randomChar()}`;

  const meeting = await prismaClient.meeting.findFirst({
    where: {
      accessCode: id,
    },
  });
  if (meeting) {
    generateRandomString();
  }
  return id;
}
