import { prisma } from "../../infra/db/prisma";

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
}
