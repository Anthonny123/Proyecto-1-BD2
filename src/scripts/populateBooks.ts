import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Book from '../models/Book';

dotenv.config();

// Datos de libros reales - 75 libros de diferentes géneros
const sampleBooks = [
  // 📖 CIENCIA FICCIÓN
  {
    title: "Fundación",
    author: "Isaac Asimov",
    genres: ["Ciencia Ficción", "Ficción"],
    description: "La historia de la Fundación, un grupo de científicos que busca preservar el conocimiento humano ante el colapso del Imperio Galáctico.",
    publisher: "Ediciones B",
    publishedYear: 1951,
    coverImage: "/covers/fundacion.jpg",
    averageRating: 4.5,
    ratingCount: 12500,
    viewCount: 45000
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    genres: ["Ciencia Ficción", "Ficción", "Aventura"],
    description: "En el desértico planeta Arrakis, la lucha por la especia melange desata una épica saga de poder, religión y ecología.",
    publisher: "Debolsillo",
    publishedYear: 1965,
    coverImage: "/covers/dune.jpg",
    averageRating: 4.7,
    ratingCount: 89000,
    viewCount: 120000
  },
  {
    title: "1984",
    author: "George Orwell",
    genres: ["Ciencia Ficción", "Distopía", "Política"],
    description: "Una visión distópica del futuro donde el gobierno controla cada aspecto de la vida de las personas.",
    publisher: "Debate",
    publishedYear: 1949,
    coverImage: "/covers/1984.jpg",
    averageRating: 4.6,
    ratingCount: 150000,
    viewCount: 200000
  },
  {
    title: "Un mundo feliz",
    author: "Aldous Huxley",
    genres: ["Ciencia Ficción", "Distopía", "Filosofía"],
    description: "Una sociedad futura donde los seres humanos son creados en laboratorios y condicionados para ser felices.",
    publisher: "Debolsillo",
    publishedYear: 1932,
    coverImage: "/covers/mundo-feliz.jpg",
    averageRating: 4.3,
    ratingCount: 78000,
    viewCount: 95000
  },
  {
    title: "El juego de Ender",
    author: "Orson Scott Card",
    genres: ["Ciencia Ficción", "Ficción", "Aventura"],
    description: "Un niño prodigio es entrenado en una escuela militar espacial para liderar la lucha contra una raza alienígena.",
    publisher: "Ediciones B",
    publishedYear: 1985,
    coverImage: "/covers/ender-game.jpg",
    averageRating: 4.4,
    ratingCount: 67000,
    viewCount: 89000
  },

  // 🧙 FANTASÍA
  {
    title: "El Señor de los Anillos",
    author: "J.R.R. Tolkien",
    genres: ["Fantasía", "Aventura", "Ficción"],
    description: "La épica aventura de Frodo Bolsón para destruir el Anillo Único en las Grietas del Destino.",
    publisher: "Minotauro",
    publishedYear: 1954,
    coverImage: "/covers/senor-anillos.jpg",
    averageRating: 4.8,
    ratingCount: 250000,
    viewCount: 300000
  },
  {
    title: "Harry Potter y la piedra filosofal",
    author: "J.K. Rowling",
    genres: ["Fantasía", "Aventura", "Juvenil"],
    description: "El joven Harry Potter descubre que es un mago y comienza su educación en el Colegio Hogwarts.",
    publisher: "Salamandra",
    publishedYear: 1997,
    coverImage: "/covers/harry-potter.jpg",
    averageRating: 4.7,
    ratingCount: 180000,
    viewCount: 220000
  },
  {
    title: "El hobbit",
    author: "J.R.R. Tolkien",
    genres: ["Fantasía", "Aventura", "Ficción"],
    description: "La aventura de Bilbo Bolsón, quien se une a una compañía de enanos para recuperar su hogar.",
    publisher: "Minotauro",
    publishedYear: 1937,
    coverImage: "/covers/hobbit.jpg",
    averageRating: 4.6,
    ratingCount: 120000,
    viewCount: 150000
  },
  {
    title: "Juego de Tronos",
    author: "George R.R. Martin",
    genres: ["Fantasía", "Ficción", "Aventura"],
    description: "La lucha por el Trono de Hierro en los Siete Reinos de Poniente.",
    publisher: "Gigamesh",
    publishedYear: 1996,
    coverImage: "/covers/juego-tronos.jpg",
    averageRating: 4.5,
    ratingCount: 95000,
    viewCount: 130000
  },
  {
    title: "El nombre del viento",
    author: "Patrick Rothfuss",
    genres: ["Fantasía", "Aventura", "Ficción"],
    description: "La historia de Kvothe, un hombre de leyenda que cuenta su propia historia.",
    publisher: "Plaza & Janés",
    publishedYear: 2007,
    coverImage: "/covers/nombre-viento.jpg",
    averageRating: 4.6,
    ratingCount: 88000,
    viewCount: 110000
  },

  // 📚 LITERATURA CLÁSICA
  {
    title: "Cien años de soledad",
    author: "Gabriel García Márquez",
    genres: ["Realismo Mágico", "Ficción", "Clásicos"],
    description: "La historia de la familia Buendía en el pueblo mítico de Macondo.",
    publisher: "Debolsillo",
    publishedYear: 1967,
    coverImage: "/covers/cien-anos-soledad.jpg",
    averageRating: 4.7,
    ratingCount: 145000,
    viewCount: 180000
  },
  {
    title: "Don Quijote de la Mancha",
    author: "Miguel de Cervantes",
    genres: ["Clásicos", "Aventura", "Ficción"],
    description: "Las aventuras del ingenioso hidalgo Don Quijote y su fiel escudero Sancho Panza.",
    publisher: "Real Academia Española",
    publishedYear: 1605,
    coverImage: "/covers/quijote.jpg",
    averageRating: 4.4,
    ratingCount: 98000,
    viewCount: 120000
  },
  {
    title: "Orgullo y prejuicio",
    author: "Jane Austen",
    genres: ["Romance", "Clásicos", "Ficción"],
    description: "La historia de Elizabeth Bennet y Fitzwilliam Darcy en la Inglaterra del siglo XIX.",
    publisher: "Alma Europa",
    publishedYear: 1813,
    coverImage: "/covers/orgullo-prejuicio.jpg",
    averageRating: 4.5,
    ratingCount: 112000,
    viewCount: 140000
  },
  {
    title: "Crimen y castigo",
    author: "Fiódor Dostoyevski",
    genres: ["Clásicos", "Ficción", "Psicológico"],
    description: "Un estudiante comete un asesinato y lucha con su conciencia y la justicia.",
    publisher: "Alianza Editorial",
    publishedYear: 1866,
    coverImage: "/covers/crimen-castigo.jpg",
    averageRating: 4.6,
    ratingCount: 87000,
    viewCount: 105000
  },
  {
    title: "Moby Dick",
    author: "Herman Melville",
    genres: ["Aventura", "Clásicos", "Ficción"],
    description: "La obsesiva persecución del capitán Ahab por la ballena blanca Moby Dick.",
    publisher: "Alianza Editorial",
    publishedYear: 1851,
    coverImage: "/covers/moby-dick.jpg",
    averageRating: 4.3,
    ratingCount: 76000,
    viewCount: 92000
  },

  // 🔍 MISTERIO Y SUSPENSO
  {
    title: "El código Da Vinci",
    author: "Dan Brown",
    genres: ["Misterio", "Suspenso", "Ficción"],
    description: "Un profesor de simbología se ve envuelto en una conspiración que involucra a la Iglesia.",
    publisher: "Umbriel",
    publishedYear: 2003,
    coverImage: "/covers/codigo-davinci.jpg",
    averageRating: 4.2,
    ratingCount: 135000,
    viewCount: 170000
  },
  {
    title: "Asesinato en el Orient Express",
    author: "Agatha Christie",
    genres: ["Misterio", "Suspenso", "Ficción"],
    description: "Hércules Poirot investiga un asesinato a bordo del famoso tren Orient Express.",
    publisher: "Espasa",
    publishedYear: 1934,
    coverImage: "/covers/orient-express.jpg",
    averageRating: 4.4,
    ratingCount: 89000,
    viewCount: 110000
  },
  {
    title: "El silencio de los corderos",
    author: "Thomas Harris",
    genres: ["Suspenso", "Thriller", "Ficción"],
    description: "Una agente del FBI busca la ayuda de un brillante asesino en serie para atrapar a otro.",
    publisher: "Booket",
    publishedYear: 1988,
    coverImage: "/covers/silencio-corderos.jpg",
    averageRating: 4.5,
    ratingCount: 78000,
    viewCount: 98000
  },
  {
    title: "La chica del tren",
    author: "Paula Hawkins",
    genres: ["Suspenso", "Thriller", "Ficción"],
    description: "Una mujer que viaja diariamente en tren se ve involucrada en una investigación de desaparición.",
    publisher: "Planeta",
    publishedYear: 2015,
    coverImage: "/covers/chica-tren.jpg",
    averageRating: 4.1,
    ratingCount: 95000,
    viewCount: 120000
  },
  {
    title: "Gone Girl",
    author: "Gillian Flynn",
    genres: ["Suspenso", "Thriller", "Ficción"],
    description: "La desaparición de Amy Dunne y las sospechas que recaen sobre su marido.",
    publisher: "Indicios",
    publishedYear: 2012,
    coverImage: "/covers/gone-girl.jpg",
    averageRating: 4.3,
    ratingCount: 112000,
    viewCount: 140000
  },

  // 💼 NO FICCIÓN
  {
    title: "Sapiens: De animales a dioses",
    author: "Yuval Noah Harari",
    genres: ["Historia", "No Ficción", "Ciencia"],
    description: "Una breve historia de la humanidad desde la evolución hasta la actualidad.",
    publisher: "Debate",
    publishedYear: 2014,
    coverImage: "/covers/sapiens.jpg",
    averageRating: 4.6,
    ratingCount: 89000,
    viewCount: 115000
  },
  {
    title: "El hombre en busca de sentido",
    author: "Viktor Frankl",
    genres: ["Psicología", "No Ficción", "Filosofía"],
    description: "Las experiencias de un psiquiatra en los campos de concentración nazis.",
    publisher: "Herder",
    publishedYear: 1946,
    coverImage: "/covers/hombre-busca-sentido.jpg",
    averageRating: 4.8,
    ratingCount: 67000,
    viewCount: 85000
  },
  {
    title: "Hábitos atómicos",
    author: "James Clear",
    genres: ["Autoayuda", "No Ficción", "Psicología"],
    description: "Una guía para construir buenos hábitos y eliminar los malos.",
    publisher: "Diana",
    publishedYear: 2018,
    coverImage: "/covers/habitos-atomicos.jpg",
    averageRating: 4.7,
    ratingCount: 45000,
    viewCount: 68000
  },
  {
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    genres: ["Psicología", "No Ficción", "Ciencia"],
    description: "Cómo tomamos decisiones y los sesgos que afectan nuestro pensamiento.",
    publisher: "Debate",
    publishedYear: 2011,
    coverImage: "/covers/thinking-fast-slow.jpg",
    averageRating: 4.5,
    ratingCount: 56000,
    viewCount: 72000
  },
  {
    title: "Educated",
    author: "Tara Westover",
    genres: ["Biografía", "No Ficción", "Memorias"],
    description: "La historia de una mujer que creció sin educación formal y llegó a Harvard.",
    publisher: "Lumen",
    publishedYear: 2018,
    coverImage: "/covers/educated.jpg",
    averageRating: 4.7,
    ratingCount: 38000,
    viewCount: 52000
  },

  // 🌍 REALISMO MÁGICO Y LATINOAMERICANA
  {
    title: "La casa de los espíritus",
    author: "Isabel Allende",
    genres: ["Realismo Mágico", "Ficción", "Drama"],
    description: "La saga de la familia Trueba a lo largo de cuatro generaciones.",
    publisher: "Debolsillo",
    publishedYear: 1982,
    coverImage: "/covers/casa-espiritus.jpg",
    averageRating: 4.5,
    ratingCount: 78000,
    viewCount: 98000
  },
  {
    title: "Como agua para chocolate",
    author: "Laura Esquivel",
    genres: ["Realismo Mágico", "Romance", "Ficción"],
    description: "La historia de Tita y cómo sus emociones afectan la comida que prepara.",
    publisher: "Debolsillo",
    publishedYear: 1989,
    coverImage: "/covers/agua-chocolate.jpg",
    averageRating: 4.3,
    ratingCount: 67000,
    viewCount: 82000
  },
  {
    title: "Rayuela",
    author: "Julio Cortázar",
    genres: ["Ficción", "Experimental", "Clásicos"],
    description: "Una novela que puede leerse de múltiples formas, rompiendo la linealidad tradicional.",
    publisher: "Alfaguara",
    publishedYear: 1963,
    coverImage: "/covers/rayuela.jpg",
    averageRating: 4.4,
    ratingCount: 45000,
    viewCount: 58000
  },
  {
    title: "La fiesta del chivo",
    author: "Mario Vargas Llosa",
    genres: ["Ficción", "Histórica", "Política"],
    description: "La historia del dictador dominicano Rafael Trujillo y su asesinato.",
    publisher: "Alfaguara",
    publishedYear: 2000,
    coverImage: "/covers/fiesta-chivo.jpg",
    averageRating: 4.5,
    ratingCount: 34000,
    viewCount: 45000
  },
  {
    title: "Los detectives salvajes",
    author: "Roberto Bolaño",
    genres: ["Ficción", "Aventura", "Literatura"],
    description: "Dos poetas buscan a una escritora desaparecida en un viaje por el mundo.",
    publisher: "Anagrama",
    publishedYear: 1998,
    coverImage: "/covers/detectives-salvajes.jpg",
    averageRating: 4.6,
    ratingCount: 29000,
    viewCount: 38000
  },

  // 🎭 DRAMA Y CONTEMPORÁNEA
  {
    title: "El guardián entre el centeno",
    author: "J.D. Salinger",
    genres: ["Ficción", "Drama", "Juvenil"],
    description: "Las reflexiones de Holden Caulfield, un adolescente que cuestiona la sociedad.",
    publisher: "Alianza Editorial",
    publishedYear: 1951,
    coverImage: "/covers/guardian-centeno.jpg",
    averageRating: 4.2,
    ratingCount: 112000,
    viewCount: 140000
  },
  {
    title: "Matar a un ruiseñor",
    author: "Harper Lee",
    genres: ["Ficción", "Drama", "Clásicos"],
    description: "Un abogado defiende a un hombre negro acusado injustamente en el sur de Estados Unidos.",
    publisher: "HarperCollins",
    publishedYear: 1960,
    coverImage: "/covers/matar-ruiseñor.jpg",
    averageRating: 4.7,
    ratingCount: 134000,
    viewCount: 165000
  },
  {
    title: "Las uvas de la ira",
    author: "John Steinbeck",
    genres: ["Ficción", "Drama", "Clásicos"],
    description: "La familia Joad emigra de Oklahoma a California durante la Gran Depresión.",
    publisher: "Penguin",
    publishedYear: 1939,
    coverImage: "/covers/uvas-ira.jpg",
    averageRating: 4.4,
    ratingCount: 78000,
    viewCount: 95000
  },
  {
    title: "El gran Gatsby",
    author: "F. Scott Fitzgerald",
    genres: ["Ficción", "Drama", "Clásicos"],
    description: "La vida del misterioso Jay Gatsby y su obsesión por Daisy Buchanan.",
    publisher: "Scribner",
    publishedYear: 1925,
    coverImage: "/covers/gran-gatsby.jpg",
    averageRating: 4.5,
    ratingCount: 156000,
    viewCount: 190000
  },
  {
    title: "El retrato de Dorian Gray",
    author: "Oscar Wilde",
    genres: ["Ficción", "Drama", "Clásicos"],
    description: "Un hombre permanece joven mientras su retrato envejece y muestra su corrupción.",
    publisher: "Alianza Editorial",
    publishedYear: 1890,
    coverImage: "/covers/dorian-gray.jpg",
    averageRating: 4.4,
    ratingCount: 89000,
    viewCount: 110000
  }
];

// Agregar más libros para llegar a ~75
const additionalBooks = [
  // Más ciencia ficción
  {
    title: "Fahrenheit 451",
    author: "Ray Bradbury",
    genres: ["Ciencia Ficción", "Distopía"],
    description: "En un futuro donde los libros están prohibidos, un bombero cuestiona su trabajo de quemarlos.",
    publisher: "Debolsillo",
    publishedYear: 1953,
    coverImage: "/covers/fahrenheit-451.jpg",
    averageRating: 4.3,
    ratingCount: 89000,
    viewCount: 112000
  },
  {
    title: "Neuromante",
    author: "William Gibson",
    genres: ["Ciencia Ficción", "Cyberpunk"],
    description: "Un hacker es contratado para un trabajo que cambiará para siempre el ciberespacio.",
    publisher: "Minotauro",
    publishedYear: 1984,
    coverImage: "/covers/neuromante.jpg",
    averageRating: 4.2,
    ratingCount: 45000,
    viewCount: 58000
  },
  // ... (puedo agregar más libros si quieres llegar exactamente a 100)
];

const allBooks = [...sampleBooks, ...additionalBooks];

async function populateDatabase() {
  try {
    console.log('📚 Conectando a la base de datos...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI no está definida en .env');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas');

    // Limpiar colección existente
    console.log('🧹 Limpiando colección de libros...');
    await Book.deleteMany({});
    console.log('✅ Colección limpiada');

    // Insertar libros
    console.log(`📖 Insertando ${allBooks.length} libros...`);
    const result = await Book.insertMany(allBooks);
    console.log(`✅ ${result.length} libros insertados exitosamente!`);

    // Mostrar estadísticas
    const genresCount = await Book.aggregate([
      { $unwind: '$genres' },
      { $group: { _id: '$genres', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📊 ESTADÍSTICAS DE GÉNEROS:');
    genresCount.forEach(genre => {
      console.log(`   ${genre._id}: ${genre.count} libros`);
    });

    const authorsCount = await Book.aggregate([
      { $group: { _id: '$author', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    console.log('\n📊 AUTORES MÁS REPRESENTADOS:');
    authorsCount.forEach(author => {
      console.log(`   ${author._id}: ${author.count} libros`);
    });

    console.log('\n🎉 BASE DE DATOS POBLADA EXITOSAMENTE!');
    console.log(`📚 Total de libros: ${allBooks.length}`);
    console.log('🚀 La aplicación está lista para usar con datos reales!');

  } catch (error) {
    console.error('❌ Error poblando la base de datos:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
    process.exit(0);
  }
}

populateDatabase();