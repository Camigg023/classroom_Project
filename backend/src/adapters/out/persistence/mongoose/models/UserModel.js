import mongoose from 'mongoose';
import { ROLES, USER_STATUS } from '../../../../../domain/entities/User.js';

const userSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    rol: { type: String, required: true, enum: Object.values(ROLES) },
    estado: { type: String, required: true, enum: Object.values(USER_STATUS), default: USER_STATUS.ACTIVO }
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
