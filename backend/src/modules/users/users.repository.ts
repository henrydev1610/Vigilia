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

  findByGoogleId(googleId: string) {
    return prisma.user.findFirst({
      where: { googleId } as any,
    });
  }

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  create(data: {
    name: string;
    email: string;
    passwordHash?: string | null;
    googleId?: string | null;
    avatarUrl?: string | null;
    provider?: string;
  }) {
    return prisma.user.create({ data: data as any });
  }

  createWithProfile(data: {
    name: string;
    email: string;
    passwordHash?: string | null;
    firstName: string;
    lastName: string;
    googleId?: string | null;
    avatarUrl?: string | null;
    provider?: string;
  }) {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash ?? null,
        googleId: data.googleId,
        avatarUrl: data.avatarUrl,
        provider: data.provider,
        profile: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            avatarUrl: data.avatarUrl,
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
      passwordHash?: string | null;
      googleId?: string | null;
      avatarUrl?: string | null;
      provider?: string;
    }
  ) {
    return prisma.user.update({
      where: { id },
      data: data as any
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
