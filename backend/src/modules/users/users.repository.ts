import { prisma } from "../../infra/db/prisma";

type ProfileUpdateData = {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
  interestedParties?: string[];
  interestedStates?: string[];
  alertsEnabled?: boolean;
  biometricEnabled?: boolean;
  monitoringCount?: number;
};

export class UsersRepository {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  create(data: { name: string; email: string; passwordHash: string }) {
    return prisma.user.create({ data });
  }

  createWithProfile(data: {
    name: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
  }) {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        profile: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
          },
        },
      },
      include: {
        profile: true,
      },
    });
  }

  update(
    id: string,
    data: {
      name?: string;
      email?: string;
      passwordHash?: string;
    }
  ) {
    return prisma.user.update({
      where: { id },
      data
    });
  }

  delete(id: string) {
    return prisma.user.delete({
      where: { id }
    });
  }

  getProfileByUserId(userId: string) {
    return prisma.profile.findUnique({
      where: { userId },
    });
  }

  upsertProfileByUserId(userId: string, data: ProfileUpdateData) {
    return prisma.profile.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });
  }
}
