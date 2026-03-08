import bcrypt from "bcryptjs";
import { AppError } from "../../shared/errors/app-error";
import { RefreshTokenRepository } from "../auth/refresh-token.repository";
import { UsersRepository } from "./users.repository";

type UpdateInput = {
  name?: string;
  email?: string;
};

type UpdateProfileInput = {
  avatarUrl?: string | null;
  interestedParties?: string[];
  interestedStates?: string[];
  alertsEnabled?: boolean;
  biometricEnabled?: boolean;
  monitoringCount?: number;
};

export class UsersService {
  private readonly usersRepository = new UsersRepository();
  private readonly refreshTokenRepository = new RefreshTokenRepository();

  async getMe(userId: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new AppError("Usuario nao encontrado", 404, "USER_NOT_FOUND");
    }

    const profile = await this.usersRepository.upsertProfileByUserId(userId, {});

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      profile: {
        avatarUrl: profile.avatarUrl,
        interestedParties: profile.interestedParties,
        interestedStates: profile.interestedStates,
        alertsEnabled: profile.alertsEnabled,
        biometricEnabled: profile.biometricEnabled,
        monitoringCount: profile.monitoringCount,
      },
    };
  }

  async updateMe(userId: string, input: UpdateInput) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new AppError("Usuario nao encontrado", 404, "USER_NOT_FOUND");
    }

    if (input.email && input.email !== user.email) {
      const existing = await this.usersRepository.findByEmail(input.email);
      if (existing && existing.id !== userId) {
        throw new AppError("Email ja cadastrado", 409, "EMAIL_IN_USE");
      }
    }

    const updated = await this.usersRepository.update(userId, {
      name: input.name,
      email: input.email
    });

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      createdAt: updated.createdAt
    };
  }

  async updateMyPassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new AppError("Usuario nao encontrado", 404, "USER_NOT_FOUND");
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      throw new AppError("Senha atual invalida", 401, "INVALID_PASSWORD");
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.update(userId, { passwordHash });
    await this.refreshTokenRepository.revokeByUserId(userId);

    return {
      updated: true
    };
  }

  async deleteMe(userId: string, password: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new AppError("Usuario nao encontrado", 404, "USER_NOT_FOUND");
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new AppError("Senha invalida", 401, "INVALID_PASSWORD");
    }

    await this.refreshTokenRepository.revokeByUserId(userId);
    await this.usersRepository.delete(userId);

    return {
      deleted: true
    };
  }

  async getMyProfile(userId: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new AppError("Usuario nao encontrado", 404, "USER_NOT_FOUND");
    }

    const profile = await this.usersRepository.upsertProfileByUserId(userId, {});
    return {
      userId: profile.userId,
      avatarUrl: profile.avatarUrl,
      interestedParties: profile.interestedParties,
      interestedStates: profile.interestedStates,
      alertsEnabled: profile.alertsEnabled,
      biometricEnabled: profile.biometricEnabled,
      monitoringCount: profile.monitoringCount,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  async updateMyProfile(userId: string, input: UpdateProfileInput) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new AppError("Usuario nao encontrado", 404, "USER_NOT_FOUND");
    }

    const profile = await this.usersRepository.upsertProfileByUserId(userId, input);
    return {
      userId: profile.userId,
      avatarUrl: profile.avatarUrl,
      interestedParties: profile.interestedParties,
      interestedStates: profile.interestedStates,
      alertsEnabled: profile.alertsEnabled,
      biometricEnabled: profile.biometricEnabled,
      monitoringCount: profile.monitoringCount,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
