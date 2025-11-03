import mongoose, { Document, Schema, Types} from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: Types.ObjectId
  username: string;
  email: string;
  password: string;
  preferences: {
    favoriteGenres: string[];
    favoriteAuthors: string[];
    excludedGenres?: string[];
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: [true, 'El nombre de usuario es requerido'],
    unique: true, // Esto ya crea un índice automáticamente
    trim: true,
    minlength: [3, 'El usuario debe tener al menos 3 caracteres'],
    maxlength: [30, 'El usuario no puede tener más de 30 caracteres'],
    match: [/^[a-zA-Z0-9_]+$/, 'Solo se permiten letras, números y guiones bajos']
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true, // Esto ya crea un índice automáticamente
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingresa un email válido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false
  },
  preferences: {
    favoriteGenres: {
      type: [String],
      default: []
    },
    favoriteAuthors: {
      type: [String],
      default: []
    },
    excludedGenres: {
      type: [String],
      default: []
    }
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Hash password antes de guardar
UserSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Método para comparar passwords
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};


UserSchema.index({ 'preferences.favoriteGenres': 1 });


export default mongoose.model<IUser>('User', UserSchema);