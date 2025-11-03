import Book from "../models/Book";
import User from "../models/User";
import UserInteraction from "../models/UserInteraction";
import Recommendation from "../models/Recommendation";
import {
  ContentBasedRecommendationRequest,
  CollaborativeRecommendationRequest,
  UserRecommendationRequest,
  RecommendationResponse,
  SimilarityResult,
} from "../types/recommendation";
import mongoose from "mongoose";

export class RecommendationService {
  /**
   * Recomendaciones basadas en contenido (libros similares)
   */
  static async getContentBasedRecommendations(
    request: ContentBasedRecommendationRequest
  ): Promise<RecommendationResponse> {
    try {
      const { bookId, limit = 10 } = request;

      // Verificar si el libro existe
      const targetBook = await Book.findById(bookId);
      if (!targetBook) {
        return {
          success: false,
          message: "Libro no encontrado",
        };
      }

      // Buscar recomendaciones pre-calculadas primero
      const cachedRecs = await Recommendation.findOne({
        type: "content_based",
        sourceId: bookId,
      });

      if (cachedRecs) {
        const recommendedBooks = await Book.find({
          _id: {
            $in: cachedRecs.recommendedBooks
              .slice(0, limit)
              .map((r) => r.bookId),
          },
        }).lean();

        const recommendations = recommendedBooks.map((book, index) => ({
          book,
          score: cachedRecs.recommendedBooks[index].score,
          reason: cachedRecs.recommendedBooks[index].reason,
          type: "content_based" as const,
        }));

        return {
          success: true,
          message: "Recomendaciones por contenido obtenidas exitosamente",
          data: { recommendations },
        };
      }

      // Si no hay cache, calcular en tiempo real
      const recommendations = await this.calculateContentBasedRecommendations(
        targetBook,
        limit
      );

      return {
        success: true,
        message: "Recomendaciones por contenido obtenidas exitosamente",
        data: { recommendations },
      };
    } catch (error: any) {
      console.error("Error en recomendaciones por contenido:", error);

      return {
        success: false,
        message: "Error al generar recomendaciones por contenido",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      };
    }
  }

  /**
   * Calcular similitud de contenido entre libros
   */
  private static async calculateContentBasedRecommendations(
    targetBook: any,
    limit: number
  ): Promise<any[]> {
    const allBooks = await Book.find({ _id: { $ne: targetBook._id } }).lean();

    const similarities: SimilarityResult[] = [];

    for (const book of allBooks) {
      const score = this.calculateContentSimilarity(targetBook, book);

      if (score > 0.3) {
        // Solo considerar similitudes significativas
        similarities.push({
          bookId: book._id.toString(),
          score,
          reasons: this.getSimilarityReasons(targetBook, book),
        });
      }
    }

    // Ordenar por score descendente y tomar el límite
    similarities.sort((a, b) => b.score - a.score);
    const topSimilarities = similarities.slice(0, limit);

    // Obtener los libros completos
    const recommendedBooks = await Book.find({
      _id: { $in: topSimilarities.map((s) => s.bookId) },
    }).lean();

    // Combinar con la información de similitud
    return recommendedBooks.map((book) => {
      const similarity = topSimilarities.find(
        (s) => s.bookId === book._id.toString()
      );
      return {
        book,
        score: similarity?.score || 0,
        reason: similarity?.reasons[0] || "similitud general",
        type: "content_based" as const,
      };
    });
  }

  /**
   * Calcular similitud entre dos libros basado en contenido (MEJORADO)
   */
  private static calculateContentSimilarity(bookA: any, bookB: any): number {
    let score = 0;
    const factors: string[] = [];
    const weights = {
      author: 0.4, // Mismo autor: muy importante
      genres: 0.35, // Géneros en común: importante
      rating: 0.15, // Rating similar: moderadamente importante
      popularity: 0.1, // Popularidad similar: poco importante
    };

    // 1. Similitud por autor (40%)
    if (bookA.author === bookB.author) {
      score += weights.author;
      factors.push("mismo_autor");
    }

    // 2. Similitud por géneros (35%)
    const commonGenres = bookA.genres.filter((genre: string) =>
      bookB.genres.includes(genre)
    );
    if (commonGenres.length > 0) {
      const genreSimilarity =
        commonGenres.length /
        Math.max(bookA.genres.length, bookB.genres.length);
      score += genreSimilarity * weights.genres;
      factors.push(`${commonGenres.length} géneros en común`);
    }

    // 3. Similitud por rating (15%)
    const ratingDiff = Math.abs(bookA.averageRating - bookB.averageRating);
    const ratingSimilarity = Math.max(0, 1 - ratingDiff / 5);
    score += ratingSimilarity * weights.rating;

    // 4. Similitud por popularidad (10%)
    const popularityA = Math.log(bookA.viewCount + 1) / Math.log(1000);
    const popularityB = Math.log(bookB.viewCount + 1) / Math.log(1000);
    const popularitySimilarity = 1 - Math.abs(popularityA - popularityB);
    score += Math.max(0, popularitySimilarity) * weights.popularity;

    return Math.min(score, 1);
  }

  /**
   * Obtener razones de similitud entre libros
   */
  private static getSimilarityReasons(bookA: any, bookB: any): string[] {
    const reasons: string[] = [];

    if (bookA.author === bookB.author) {
      reasons.push("Mismo autor");
    }

    const commonGenres = bookA.genres.filter((genre: string) =>
      bookB.genres.includes(genre)
    );
    if (commonGenres.length > 0) {
      reasons.push(`Géneros similares: ${commonGenres.join(", ")}`);
    }

    if (Math.abs(bookA.averageRating - bookB.averageRating) < 1) {
      reasons.push("Calificación similar");
    }

    return reasons.length > 0 ? reasons : ["Contenido similar"];
  }

  /**
   * Recomendaciones colaborativas (basadas en usuarios similares)
   */
  static async getCollaborativeRecommendations(
    request: CollaborativeRecommendationRequest
  ): Promise<RecommendationResponse> {
    try {
      const { userId, limit = 10 } = request;

      // Verificar si el usuario existe
      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          message: "Usuario no encontrado",
        };
      }

      // Buscar recomendaciones pre-calculadas primero
      const cachedRecs = await Recommendation.findOne({
        type: "collaborative",
        sourceId: userId,
      });

      if (cachedRecs) {
        const recommendedBooks = await Book.find({
          _id: {
            $in: cachedRecs.recommendedBooks
              .slice(0, limit)
              .map((r) => r.bookId),
          },
        }).lean();

        const recommendations = recommendedBooks.map((book, index) => ({
          book,
          score: cachedRecs.recommendedBooks[index].score,
          reason: cachedRecs.recommendedBooks[index].reason,
          type: "collaborative" as const,
        }));

        return {
          success: true,
          message: "Recomendaciones colaborativas obtenidas exitosamente",
          data: { recommendations },
        };
      }

      // Si no hay cache, calcular en tiempo real
      const recommendations = await this.calculateCollaborativeRecommendations(
        userId,
        limit
      );

      return {
        success: true,
        message: "Recomendaciones colaborativas obtenidas exitosamente",
        data: { recommendations },
      };
    } catch (error: any) {
      console.error("Error en recomendaciones colaborativas:", error);

      return {
        success: false,
        message: "Error al generar recomendaciones colaborativas",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      };
    }
  }

  /**
   * Calcular recomendaciones colaborativas
   */
  private static async calculateCollaborativeRecommendations(
    userId: string,
    limit: number
  ): Promise<any[]> {
    // Obtener interacciones del usuario
    const userInteractions = await UserInteraction.find({ userId })
      .populate("bookId")
      .lean();

    if (userInteractions.length === 0) {
      // Si no tiene interacciones, devolver libros populares
      const popularBooks = await Book.find()
        .sort({ averageRating: -1, viewCount: -1 })
        .limit(limit)
        .lean();

      return popularBooks.map((book) => ({
        book,
        score: 0.8, // Score alto para libros populares
        reason: "Libro popular entre todos los usuarios",
        type: "collaborative" as const,
      }));
    }

    // Obtener libros que el usuario ya ha interactuado
    const userBookIds = userInteractions.map((interaction) =>
      interaction.bookId._id.toString()
    );

    // Buscar usuarios con interacciones similares
    const similarUsers = await this.findSimilarUsers(userId, userBookIds);

    // Obtener libros recomendados por usuarios similares
    const recommendedBooks = await this.getBooksFromSimilarUsers(
      similarUsers,
      userBookIds,
      limit
    );

    return recommendedBooks;
  }

  /**
   * Encontrar usuarios similares basado en interacciones
   */
  private static async findSimilarUsers(
    targetUserId: string,
    targetUserBookIds: string[]
  ): Promise<Array<{ userId: string; similarity: number }>> {
    // Obtener todos los usuarios excepto el target
    const allUsers = await User.find({ _id: { $ne: targetUserId } }).lean();
    const similarUsers: Array<{ userId: string; similarity: number }> = [];

    for (const user of allUsers) {
      // Obtener interacciones de este usuario
      const userInteractions = await UserInteraction.find({
        userId: user._id,
        interactionType: { $in: ["view", "rating"] },
      }).lean();

      const userBookIds = userInteractions.map((interaction) =>
        interaction.bookId.toString()
      );

      // Calcular similitud (Jaccard similarity)
      const intersection = targetUserBookIds.filter((bookId) =>
        userBookIds.includes(bookId)
      ).length;

      const union = new Set([...targetUserBookIds, ...userBookIds]).size;

      const similarity = union > 0 ? intersection / union : 0;

      if (similarity > 0.1) {
        // Solo usuarios con similitud significativa
        similarUsers.push({
          userId: user._id.toString(),
          similarity,
        });
      }
    }

    // Ordenar por similitud descendente
    return similarUsers
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 20);
  }

  /**
   * Obtener libros de usuarios similares
   */
  private static async getBooksFromSimilarUsers(
    similarUsers: Array<{ userId: string; similarity: number }>,
    excludedBookIds: string[],
    limit: number
  ): Promise<any[]> {
    if (similarUsers.length === 0) {
      return [];
    }

    // Obtener libros altamente calificados por usuarios similares
    const similarUserIds = similarUsers.map((u) => u.userId);

    const highlyRatedBooks = await UserInteraction.aggregate([
      {
        $match: {
          userId: { $in: similarUserIds },
          interactionType: "rating",
          ratingValue: { $gte: 4 },
        },
      },
      {
        $group: {
          _id: "$bookId",
          avgRating: { $avg: "$ratingValue" },
          ratingCount: { $sum: 1 },
          totalSimilarity: {
            $sum: {
              $let: {
                vars: {
                  userSimilarity: {
                    $arrayElemAt: [
                      similarUsers.map((u) => u.similarity),
                      { $indexOfArray: [similarUserIds, "$userId"] },
                    ],
                  },
                },
                in: { $multiply: ["$ratingValue", "$$userSimilarity"] },
              },
            },
          },
        },
      },
      {
        $match: {
          _id: { $nin: excludedBookIds }, // Excluir libros que el usuario ya vio
        },
      },
      {
        $sort: { totalSimilarity: -1, avgRating: -1 },
      },
      {
        $limit: limit,
      },
    ]);

    // Obtener información completa de los libros
    const bookIds = highlyRatedBooks.map((item) => item._id);
    const books = await Book.find({ _id: { $in: bookIds } }).lean();

    // Combinar con información de similitud
    return books.map((book) => {
      const bookData = highlyRatedBooks.find(
        (item) => item._id.toString() === book._id.toString()
      );

      return {
        book,
        score: bookData ? bookData.totalSimilarity / bookData.ratingCount : 0.7,
        reason:
          "Usuarios con gustos similares calificaron este libro positivamente",
        type: "collaborative" as const,
      };
    });
  }

  /**
   * Generar recomendaciones pre-calculadas (para cache)
   */
  static async generateRecommendations(): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      console.log("Iniciando generación de recomendaciones pre-calculadas...");

      // Generar recomendaciones por contenido para todos los libros
      const allBooks = await Book.find().lean();

      for (const book of allBooks) {
        const recommendations = await this.calculateContentBasedRecommendations(
          book,
          10
        );

        await Recommendation.findOneAndUpdate(
          {
            type: "content_based",
            sourceId: book._id,
          },
          {
            type: "content_based",
            sourceId: book._id,
            recommendedBooks: recommendations.map((rec) => ({
              bookId: rec.book._id,
              score: rec.score,
              reason: rec.reason,
            })),
            calculatedAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expira en 24 horas
          },
          { upsert: true, new: true }
        );
      }

      console.log("Recomendaciones por contenido generadas exitosamente");

      // Generar recomendaciones colaborativas para usuarios activos
      const activeUsers = await UserInteraction.distinct("userId");

      // Convertir ObjectId a string
      const activeUserIds = activeUsers.map((userId) => userId.toString());

      for (const userId of activeUserIds.slice(0, 50)) {
        // Limitar a 50 usuarios para no sobrecargar
        const recommendations =
          await this.calculateCollaborativeRecommendations(userId, 10);

        await Recommendation.findOneAndUpdate(
          {
            type: "collaborative",
            sourceId: userId,
          },
          {
            type: "collaborative",
            sourceId: userId,
            recommendedBooks: recommendations.map((rec) => ({
              bookId: rec.book._id,
              score: rec.score,
              reason: rec.reason,
            })),
            calculatedAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expira en 24 horas
          },
          { upsert: true, new: true }
        );
      }

      console.log("Recomendaciones colaborativas generadas exitosamente");

      return {
        success: true,
        message: "Recomendaciones pre-calculadas generadas exitosamente",
      };
    } catch (error: any) {
      console.error("Error generando recomendaciones pre-calculadas:", error);

      return {
        success: false,
        message: "Error al generar recomendaciones pre-calculadas",
      };
    }
  }

  /**
   * Obtener recomendaciones para usuario (híbrido)
   */
  static async getRecommendationsForUser(
    request: UserRecommendationRequest
  ): Promise<RecommendationResponse> {
    try {
      const { userId, limit = 10 } = request;

      // Verificar si el usuario existe
      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          message: "Usuario no encontrado",
        };
      }

      // Obtener recomendaciones colaborativas
      const collaborativeRecs = await this.getCollaborativeRecommendations({
        userId,
        limit: Math.floor(limit * 0.6), // 60% colaborativas
      });

      // Obtener recomendaciones basadas en preferencias del usuario
      const preferenceRecs = await this.getPreferenceBasedRecommendations(
        user,
        Math.floor(limit * 0.4) // 40% basadas en preferencias
      );

      // Combinar y ordenar recomendaciones
      const allRecommendations = [
        ...(collaborativeRecs.success && collaborativeRecs.data
          ? collaborativeRecs.data.recommendations
          : []),
        ...preferenceRecs,
      ];

      // Eliminar duplicados y ordenar por score
      const uniqueRecommendations = this.removeDuplicateRecommendations(
        allRecommendations
      )
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return {
        success: true,
        message: "Recomendaciones personalizadas obtenidas exitosamente",
        data: { recommendations: uniqueRecommendations },
      };
    } catch (error: any) {
      console.error("Error en recomendaciones para usuario:", error);

      return {
        success: false,
        message: "Error al generar recomendaciones personalizadas",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      };
    }
  }

  /**
   * Recomendaciones basadas en preferencias del usuario
   */
  private static async getPreferenceBasedRecommendations(
    user: any,
    limit: number
  ): Promise<any[]> {
    const { favoriteGenres, favoriteAuthors } = user.preferences;

    const query: any = {};
    const conditions = [];

    if (favoriteGenres && favoriteGenres.length > 0) {
      conditions.push({ genres: { $in: favoriteGenres } });
    }

    if (favoriteAuthors && favoriteAuthors.length > 0) {
      conditions.push({ author: { $in: favoriteAuthors } });
    }

    if (conditions.length === 0) {
      return [];
    }

    query.$or = conditions;

    const books = await Book.find(query)
      .sort({ averageRating: -1, viewCount: -1 })
      .limit(limit)
      .lean();

    return books.map((book) => ({
      book,
      score: 0.9, // Alto score por coincidir con preferencias
      reason: "Coincide con tus preferencias",
      type: "content_based" as const,
    }));
  }

  /**
   * Eliminar recomendaciones duplicadas
   */
  private static removeDuplicateRecommendations(recommendations: any[]): any[] {
    const seen = new Set();
    return recommendations.filter((rec) => {
      const bookId = rec.book._id.toString();
      if (seen.has(bookId)) {
        return false;
      }
      seen.add(bookId);
      return true;
    });
  }

  /**
   * Encontrar usuarios similares usando múltiples factores (MEJORADO)
   */
  private static async findSimilarUsersAdvanced(
    targetUserId: string,
    targetUserBookIds: string[]
  ): Promise<Array<{ userId: string; similarity: number; factors: string[] }>> {
    const allUsers = await User.find({ _id: { $ne: targetUserId } }).lean();
    const similarUsers: Array<{
      userId: string;
      similarity: number;
      factors: string[];
    }> = [];

    // Obtener preferencias del usuario target
    const targetUser = await User.findById(targetUserId).lean();
    const targetPreferences = targetUser?.preferences || {
      favoriteGenres: [],
      favoriteAuthors: [],
    };

    for (const user of allUsers) {
      let similarity = 0;
      const factors: string[] = [];

      // 1. Similitud por interacciones (Jaccard) - 50%
      const userInteractions = await UserInteraction.find({
        userId: user._id,
        interactionType: { $in: ["view", "rating"] },
      }).lean();

      const userBookIds = userInteractions.map((interaction) =>
        interaction.bookId.toString()
      );

      const intersection = targetUserBookIds.filter((bookId) =>
        userBookIds.includes(bookId)
      ).length;

      const union = new Set([...targetUserBookIds, ...userBookIds]).size;

      const interactionSimilarity = union > 0 ? intersection / union : 0;
      similarity += interactionSimilarity * 0.5;

      if (interactionSimilarity > 0) {
        factors.push(`${intersection} libros en común`);
      }

      // 2. Similitud por preferencias de género - 30%
      const userPreferences = user.preferences || {
        favoriteGenres: [],
        favoriteAuthors: [],
      };
      const commonGenres = targetPreferences.favoriteGenres.filter((genre) =>
        userPreferences.favoriteGenres.includes(genre)
      );

      if (commonGenres.length > 0) {
        const genreSimilarity =
          commonGenres.length /
          Math.max(
            targetPreferences.favoriteGenres.length,
            userPreferences.favoriteGenres.length
          );
        similarity += genreSimilarity * 0.3;
        factors.push(`${commonGenres.length} géneros favoritos en común`);
      }

      // 3. Similitud por autores favoritos - 20%
      const commonAuthors = targetPreferences.favoriteAuthors.filter((author) =>
        userPreferences.favoriteAuthors.includes(author)
      );

      if (commonAuthors.length > 0) {
        const authorSimilarity =
          commonAuthors.length /
          Math.max(
            targetPreferences.favoriteAuthors.length,
            userPreferences.favoriteAuthors.length
          );
        similarity += authorSimilarity * 0.2;
        factors.push(`${commonAuthors.length} autores favoritos en común`);
      }

      if (similarity > 0.1) {
        // Solo usuarios con similitud significativa
        similarUsers.push({
          userId: user._id.toString(),
          similarity,
          factors,
        });
      }
    }

    return similarUsers
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 25);
  }

  /**
   * Sistema de recomendación híbrido mejorado
   */
  static async getHybridRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<RecommendationResponse> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          message: "Usuario no encontrado",
        };
      }

      // Obtener recomendaciones de diferentes fuentes
      const [collaborativeRecs, contentRecs, popularityRecs, preferenceRecs] =
        await Promise.all([
          this.getCollaborativeRecommendations({
            userId,
            limit: Math.floor(limit * 0.4),
          }),
          this.getContentBasedOnUserHistory(userId, Math.floor(limit * 0.3)),
          this.getPopularityBasedRecommendations(Math.floor(limit * 0.2)),
          this.getPreferenceBasedRecommendations(user, Math.floor(limit * 0.1)),
        ]);

      // Combinar todas las recomendaciones
      const allRecommendations = [
        ...(collaborativeRecs.success && collaborativeRecs.data
          ? collaborativeRecs.data.recommendations
          : []),
        ...contentRecs,
        ...popularityRecs,
        ...preferenceRecs,
      ];

      // Aplicar diversificación y eliminar duplicados
      const diversifiedRecs = this.diversifyRecommendations(
        allRecommendations,
        limit
      );

      return {
        success: true,
        message: "Recomendaciones híbridas obtenidas exitosamente",
        data: { recommendations: diversifiedRecs },
      };
    } catch (error: any) {
      console.error("Error en recomendaciones híbridas:", error);
      return {
        success: false,
        message: "Error al generar recomendaciones híbridas",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      };
    }
  }

  /**
   * Recomendaciones basadas en el historial del usuario
   */
  private static async getContentBasedOnUserHistory(
    userId: string,
    limit: number
  ): Promise<any[]> {
    // Obtener libros que el usuario ha interactuado positivamente
    const userInteractions = await UserInteraction.find({
      userId,
      interactionType: { $in: ["rating", "view"] },
    })
      .populate("bookId")
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    if (userInteractions.length === 0) {
      return [];
    }

    const recommendations: any[] = [];

    // Para cada libro que el usuario interactuó, encontrar similares
    for (const interaction of userInteractions.slice(0, 3)) {
      // Solo top 3
      const similarBooks = await this.calculateContentBasedRecommendations(
        interaction.bookId,
        Math.ceil(limit / 3)
      );
      recommendations.push(...similarBooks);
    }

    return recommendations;
  }

  /**
   * Recomendaciones basadas en popularidad
   */
  private static async getPopularityBasedRecommendations(
    limit: number
  ): Promise<any[]> {
    const popularBooks = await Book.find()
      .sort({
        averageRating: -1,
        viewCount: -1,
        ratingCount: -1,
      })
      .limit(limit * 2) // Tomar más para filtrar después
      .lean();

    // Mezclar y seleccionar aleatoriamente para diversidad
    const shuffled = popularBooks.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit).map((book) => ({
      book,
      score: 0.7, // Score base para libros populares
      reason: "Libro popular y bien calificado",
      type: "popularity" as const,
    }));
  }

  /**
   * Diversificar recomendaciones para evitar que sean muy similares
   */
  private static diversifyRecommendations(
    recommendations: any[],
    limit: number
  ): any[] {
    const seenBooks = new Set();
    const diversified: any[] = [];
    const byAuthor = new Map();
    const byGenre = new Map();

    // Primera pasada: eliminar duplicados exactos
    for (const rec of recommendations) {
      const bookId = rec.book._id.toString();
      if (!seenBooks.has(bookId)) {
        seenBooks.add(bookId);
        diversified.push(rec);

        // Agrupar por autor y género para diversificación
        const author = rec.book.author;
        const genres = rec.book.genres;

        byAuthor.set(author, (byAuthor.get(author) || 0) + 1);
        for (const genre of genres) {
          byGenre.set(genre, (byGenre.get(genre) || 0) + 1);
        }
      }
    }

    // Ordenar por score y aplicar diversificación
    return diversified
      .sort((a, b) => {
        // Penalizar recomendaciones de autores/géneros muy representados
        const scoreA =
          a.score * this.getDiversificationPenalty(a, byAuthor, byGenre);
        const scoreB =
          b.score * this.getDiversificationPenalty(b, byAuthor, byGenre);
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }

  /**
   * Calcular penalización por diversificación
   */
  private static getDiversificationPenalty(
    recommendation: any,
    byAuthor: Map<string, number>,
    byGenre: Map<string, number>
  ): number {
    const authorCount = byAuthor.get(recommendation.book.author) || 0;
    const genreCounts = recommendation.book.genres.map(
      (genre: string) => byGenre.get(genre) || 0
    );
    const avgGenreCount =
      genreCounts.reduce((a: number, b: number) => a + b, 0) /
      genreCounts.length;

    // Penalizar si hay muchos del mismo autor o género
    const authorPenalty = Math.max(0.5, 1 - authorCount * 0.1);
    const genrePenalty = Math.max(0.7, 1 - avgGenreCount * 0.05);

    return authorPenalty * genrePenalty;
  }
}
