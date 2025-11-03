import mongoose, { Document, Schema } from 'mongoose';

export type InteractionType = 'view' | 'rating' | 'wishlist';

export interface IUserInteraction extends Document {
  userId: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  interactionType: InteractionType;
  ratingValue?: number; // 1-5, solo para tipo 'rating'
  timeOnPage?: number; // segundos, solo para tipo 'view'
  timestamp: Date;
  sessionId: string;
}

const UserInteractionSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El ID de usuario es requerido'],
    index: true
  },
  bookId: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'El ID de libro es requerido'],
    index: true
  },
  interactionType: {
    type: String,
    required: [true, 'El tipo de interacción es requerido'],
    enum: {
      values: ['view', 'rating', 'wishlist'],
      message: 'Tipo de interacción no válido. Valores permitidos: view, rating, wishlist'
    },
    index: true
  },
  ratingValue: {
    type: Number,
    min: [1, 'La calificación mínima es 1'],
    max: [5, 'La calificación máxima es 5'],
    validate: {
      validator: function(this: IUserInteraction, value: number) {
        // ratingValue es requerido solo si interactionType es 'rating'
        if (this.interactionType === 'rating') {
          return value !== undefined && value >= 1 && value <= 5;
        }
        return true; // Para otros tipos, no es requerido
      },
      message: 'La calificación es requerida y debe ser entre 1-5 para interacciones de rating'
    }
  },
  timeOnPage: {
    type: Number,
    min: [0, 'El tiempo en página no puede ser negativo'],
    validate: {
      validator: function(this: IUserInteraction, value: number) {
        // timeOnPage es requerido solo si interactionType es 'view'
        if (this.interactionType === 'view') {
          return value !== undefined && value >= 0;
        }
        return true; // Para otros tipos, no es requerido
      },
      message: 'El tiempo en página es requerido para interacciones de view'
    }
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  sessionId: {
    type: String,
    required: [true, 'El ID de sesión es requerido'],
    index: true
  }
}, {
  timestamps: true,
  collection: 'user_interactions'
});

// Índices compuestos para optimizar consultas
UserInteractionSchema.index({ userId: 1, timestamp: -1 });
UserInteractionSchema.index({ bookId: 1, interactionType: 1 });
UserInteractionSchema.index({ userId: 1, bookId: 1, interactionType: 1 });
UserInteractionSchema.index({ sessionId: 1, timestamp: 1 });

export default mongoose.model<IUserInteraction>('UserInteraction', UserInteractionSchema);