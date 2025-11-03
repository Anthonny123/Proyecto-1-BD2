import mongoose, { Document, Schema } from 'mongoose';

export type RecommendationType = 'content_based' | 'collaborative';

export interface IRecommendedBook {
  bookId: mongoose.Types.ObjectId;
  score: number; // 0.0 - 1.0
  reason: 'mismo_autor' | 'mismo_genero' | 'usuarios_similares' | 'alta_calificacion';
}

export interface IRecommendation extends Document {
  type: RecommendationType;
  sourceId: mongoose.Types.ObjectId; // bookId para content_based, userId para collaborative
  recommendedBooks: IRecommendedBook[];
  calculatedAt: Date;
  expiresAt: Date;
}

const RecommendedBookSchema: Schema = new Schema({
  bookId: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: [0, 'El score no puede ser menor a 0'],
    max: [1, 'El score no puede ser mayor a 1']
  },
  reason: {
    type: String,
    required: true,
    enum: {
      values: ['mismo_autor', 'mismo_genero', 'usuarios_similares', 'alta_calificacion'],
      message: 'Razón no válida'
    }
  }
});

const RecommendationSchema: Schema = new Schema({
  type: {
    type: String,
    required: [true, 'El tipo de recomendación es requerido'],
    enum: {
      values: ['content_based', 'collaborative'],
      message: 'Tipo de recomendación no válido'
    },
    index: true
  },
  sourceId: {
    type: Schema.Types.ObjectId,
    required: [true, 'El ID de origen es requerido'],
    index: true
  },
  recommendedBooks: {
    type: [RecommendedBookSchema],
    required: true,
    validate: {
      validator: function(books: IRecommendedBook[]) {
        return books.length > 0;
      },
      message: 'Debe haber al menos un libro recomendado'
    }
  },
  calculatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
    // ⬇️ ELIMINADO: index: true
  }
}, {
  timestamps: true,
  collection: 'recommendations'
});

// Índices para optimizar búsquedas
RecommendationSchema.index({ type: 1, sourceId: 1 });
RecommendationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index para limpieza automática

export default mongoose.model<IRecommendation>('Recommendation', RecommendationSchema);