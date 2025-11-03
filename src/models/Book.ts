import mongoose, { Document, Schema } from 'mongoose';

export interface IBook extends Document {
  title: string;
  author: string;
  genres: string[];
  description: string;
  publisher: string;
  publishedYear: number;
  coverImage: string;
  averageRating: number;
  ratingCount: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true,
    maxlength: [200, 'El título no puede tener más de 200 caracteres']
  },
  author: {
    type: String,
    required: [true, 'El autor es requerido'],
    trim: true,
    maxlength: [100, 'El autor no puede tener más de 100 caracteres']
  },
  genres: {
    type: [String],
    required: [true, 'Al menos un género es requerido'],
    validate: {
      validator: function(genres: string[]) {
        return genres.length > 0;
      },
      message: 'Debe tener al menos un género'
    }
  },
  description: {
    type: String,
    required: [true, 'La descripción es requerida'],
    maxlength: [2000, 'La descripción no puede tener más de 2000 caracteres']
  },
  publisher: {
    type: String,
    required: [true, 'La editorial es requerida'],
    trim: true
  },
  publishedYear: {
    type: Number,
    required: [true, 'El año de publicación es requerido'],
    min: [1000, 'El año debe ser válido'],
    max: [new Date().getFullYear(), 'El año no puede ser futuro']
  },
  coverImage: {
    type: String,
    required: [true, 'La imagen de portada es requerida'],
    default: '/covers/default.jpg'
  },
  averageRating: {
    type: Number,
    default: 0,
    min: [0, 'La calificación no puede ser menor a 0'],
    max: [5, 'La calificación no puede ser mayor a 5']
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'books'
});

// Índices para optimizar búsquedas
BookSchema.index({ title: 'text', author: 'text', description: 'text' });
BookSchema.index({ genres: 1 });
BookSchema.index({ author: 1 });
BookSchema.index({ averageRating: -1 });
BookSchema.index({ viewCount: -1 });

export default mongoose.model<IBook>('Book', BookSchema);