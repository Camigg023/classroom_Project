import { IUserRepository } from '../../../../../ports/repositories/IUserRepository.js';
import { UserModel } from '../models/UserModel.js';
import { User } from '../../../../../domain/entities/User.js';

export class MongoUserRepository extends IUserRepository {
  toDomain(doc) {
    if (!doc) return null;
    return new User({
      id: doc._id.toString(),
      nombre: doc.nombre,
      email: doc.email,
      passwordHash: doc.passwordHash,
      rol: doc.rol,
      estado: doc.estado,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    });
  }

  async findByEmail(email) {
    const doc = await UserModel.findOne({ email: email.trim().toLowerCase() });
    return this.toDomain(doc);
  }

  async findById(id) {
    const doc = await UserModel.findById(id);
    return this.toDomain(doc);
  }

  async findAgentesActivos() {
    const docs = await UserModel.find({ rol: 'Agente', estado: 'Activo' });
    return docs.map(doc => this.toDomain(doc));
  }

  async save(user) {
    if (user.id) {
      const doc = await UserModel.findByIdAndUpdate(
        user.id,
        {
          nombre: user.nombre,
          email: user.email,
          passwordHash: user.passwordHash,
          rol: user.rol,
          estado: user.estado
        },
        { new: true }
      );
      return this.toDomain(doc);
    }
    const doc = await UserModel.create({
      nombre: user.nombre,
      email: user.email,
      passwordHash: user.passwordHash,
      rol: user.rol,
      estado: user.estado
    });
    return this.toDomain(doc);
  }
}
