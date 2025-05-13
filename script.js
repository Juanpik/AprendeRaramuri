// script.js (Final, Complete, and Corrected Version)

document.addEventListener('DOMContentLoaded', () => {

    // --- DECLARACIÓN DE VARIABLES PARA DATOS ---
    let lexiconData = []; // Almacenará los datos del léxico de data.json
    let phrasesData = []; // Almacenará los datos de frases de data.json
    let currentCategoryFilter = 'all'; // Variable para el filtro de categoría de la sección Léxico

    // --- MAPEO DE ICONOS PARA CATEGORÍAS ---
    // Objeto que asocia nombres de categoría con emojis para visualización
    const categoryIcons = {
        'Naturaleza': '🌳',
        'Comida y bebida': '🍎', // Puedes cambiar estos emojis
        'Verbos': '🏃‍♂️',
        'Animales': '🐾',
        'Partes del cuerpo': '🖐️',
        'Objetos': '🔨',
        'Personas': '🧍‍♀️',
        'Vestimenta': '🧦',
        'Colores': '🎨',
        'Lugares': '🏡',
        // Añade más categorías e iconos si los tienes en data.json
        'all': '' // La categoría 'all' (Todos/Todas las categorías) no suele llevar icono
    };
    const defaultCategoryIcon = '🏷️'; // Icono por defecto si una categoría no está en el mapeo


    // --- ELEMENTOS DEL DOM ---
    // Obtener referencias a los elementos HTML que vamos a manipular
    const loadingMessageEl = document.getElementById('loading-message'); // Mensaje de carga inicial
    const errorMessageEl = document.getElementById('error-message');     // Mensaje de error general
    const mainContentEl = document.getElementById('main-content');       // Contenedor principal del contenido
    const navButtons = document.querySelectorAll('nav button');          // Botones de navegación
    const contentSections = document.querySelectorAll('.content-section'); // Secciones de contenido


    // Lexicon Elements
    const lexiconGrid = document.getElementById('lexicon-grid');             // Grid donde se muestran los items del léxico
    const lexiconSearchInput = document.getElementById('lexicon-search');    // Input de búsqueda del léxico
    const categoryFiltersContainer = document.getElementById('category-filters'); // Contenedor para los botones de filtro del Léxico


    // Phrases Elements
    const phrasesList = document.getElementById('phrases-list'); // Lista donde se muestran las frases


    // Memorama Elements
    const memoramaSetup = document.getElementById('memorama-setup');       // Área de configuración del Memorama
    const memoramaGameArea = document.getElementById('memorama-game-area'); // Área de juego del Memorama
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');  // Botones de dificultad del Memorama
    const memoramaGrid = document.getElementById('memorama-grid');           // Grid de cartas del Memorama
    const memoramaAttemptsEl = document.getElementById('memorama-attempts'); // Elemento para mostrar intentos
    const resetMemoramaBtn = document.getElementById('reset-memorama');      // Botón para reiniciar Memorama
    const memoramaWinMessage = document.getElementById('memorama-win-message'); // Mensaje de victoria del Memorama
    const memoramaDataErrorEl = document.getElementById('memorama-data-error'); // Mensaje de error de datos Memorama


    // Quiz Elements
    const quizContainer = document.getElementById('quiz-container');         // Contenedor principal del Quiz
    const quizSetup = document.getElementById('quiz-setup');                 // Área de configuración del Quiz
    const quizLengthSelect = document.getElementById('quiz-length');         // Selector de número de preguntas
    const quizCategorySelect = document.getElementById('quiz-category');     // Selector de categoría del Quiz (NUEVO)
    const startQuizBtn = document.getElementById('start-quiz');              // Botón para empezar Quiz
    const quizQuestionArea = document.getElementById('quiz-question-area');  // Área donde se muestra la pregunta
    const quizImageContainer = document.getElementById('quiz-image-container'); // Contenedor para la imagen de la pregunta
    const quizQuestionEl = document.getElementById('quiz-question');         // Elemento para el texto de la pregunta
    const quizOptionsEl = document.getElementById('quiz-options');           // Contenedor para opciones de MC
    const quizTextInputArea = document.getElementById('quiz-text-input-area'); // Área para input de texto
    const quizTextAnswerInput = document.getElementById('quiz-text-answer'); // Input de texto para respuesta
    const submitTextAnswerBtn = document.getElementById('submit-text-answer'); // Botón para enviar respuesta de texto
    const quizFeedbackEl = document.getElementById('quiz-feedback');         // Elemento para mostrar feedback (correcto/incorrecto)
    const nextQuestionBtn = document.getElementById('next-question');        // Botón Siguiente pregunta
    const quizResultsEl = document.getElementById('quiz-results');           // Área de resultados del Quiz
    const quizScoreEl = document.getElementById('quiz-score');               // Elemento para mostrar la puntuación
    const quizTotalEl = document.getElementById('quiz-total');               // Elemento para mostrar el total de preguntas
    const restartQuizBtn = document.getElementById('restart-quiz');          // Botón reiniciar Quiz
    const retryMissedQuizBtn = document.getElementById('retry-missed-quiz'); // Botón reintentar falladas
    const quizDataErrorEl = document.getElementById('quiz-data-error');      // Mensaje de error de datos Quiz


    // Flashcards Elements
    const flashcardsContainer = document.getElementById('flashcards-container'); // Contenedor principal Flashcards
    const flashcardsSetupControls = document.getElementById('flashcards-setup-controls'); // Contenedor setup Flashcards (NUEVO)
    const flashcardCategorySelect = document.getElementById('flashcard-category'); // Selector de categoría Flashcards (NUEVO)
    const flashcardsDataErrorEl = document.getElementById('flashcards-data-error'); // Mensaje de error Flashcards (NUEVO)
    const flashcardsLoadingEl = document.getElementById('flashcards-loading'); // Mensaje de carga Flashcards
    const flashcardsErrorEl = document.getElementById('flashcards-error');     // Error general Flashcards (e.g., carga de datos)
    const flashcardAreaEl = document.getElementById('flashcard-area');       // Área donde se muestra la tarjeta
    const flashcardCounterEl = document.getElementById('flashcard-counter'); // Contador de tarjetas
    const flashcardEl = document.getElementById('flashcard');                // La tarjeta individual
    const flashcardFrontEl = document.getElementById('flashcard-front');     // Cara frontal
    const flashcardBackEl = document.getElementById('flashcard-back');       // Cara trasera
    const prevFlashcardBtn = document.getElementById('prev-flashcard-btn');  // Botón tarjeta anterior
    const flipFlashcardBtn = document.getElementById('flip-flashcard-btn');  // Botón voltear tarjeta
    const nextFlashcardBtn = document.getElementById('next-flashcard-btn');  // Botón tarjeta siguiente
    const shuffleFlashcardsBtn = document.getElementById('shuffle-flashcards-btn'); // Botón barajar


    // --- VARIABLES GLOBALES JUEGOS ---
    // Estado del juego Memorama
    let memoramaActive = false;
    let mCards = [];
    let mFlippedElements = [];
    let mMatchedPairsCount = 0;
    let mTotalPairs = 0;
    let mAttempts = 0;
    let mLockBoard = false;
    // Estado del juego Quiz
    let allQuizQuestions = []; // Todas las preguntas generadas para el set actual
    let currentQuizSet = [];    // El set de preguntas en juego (puede ser all o missed)
    let currentQuestionIndex = 0; // Índice de la pregunta actual en currentQuizSet
    let score = 0; // Puntuación del quiz actual
    let quizActive = false; // Indica si una pregunta está activa para ser respondida
    let missedQuestions = []; // Lista de preguntas falladas en la última ronda
    // Estado de las Flashcards
    let flashcardData = []; // Items de léxico filtrados y barajados para las flashcards
    let currentFlashcardIndex = 0; // Índice de la tarjeta actual mostrada
    let isFlashcardFlipped = false; // Estado de la tarjeta actual (volteada o no)


    // --- FUNCIÓN PARA CARGAR DATOS ---
    // Carga los datos desde data.json de forma asíncrona al inicio
    async function loadData() {
        try {
            // Muestra mensaje de carga, oculta contenido y errores
            loadingMessageEl.style.display = 'block';
            errorMessageEl.style.display = 'none';
            mainContentEl.style.display = 'none';

            // Realiza la petición fetch a data.json sin cache
            const response = await fetch('data.json', { cache: 'no-cache' });
            // Verifica si la respuesta HTTP fue exitosa
            if (!response.ok) {
                throw new Error(`Error HTTP al cargar data.json: ${response.status} ${response.statusText}`);
            }
            // Parsea la respuesta como JSON
            const data = await response.json();

            // Verifica si el JSON es válido y contiene los arrays esperados
            if (!data || typeof data !== 'object' || !Array.isArray(data.lexicon) || !Array.isArray(data.phrases)) {
                throw new Error("El archivo data.json no tiene el formato esperado (debe contener arrays 'lexicon' y 'phrases').");
            }

            // Almacena los datos en las variables globales
            lexiconData = data.lexicon;
            phrasesData = data.phrases;
            console.log("Datos cargados exitosamente:", { lexicon: lexiconData.length, phrases: phrasesData.length });

            // Oculta mensaje de carga, muestra contenido, oculta errores
            loadingMessageEl.style.display = 'none';
            mainContentEl.style.display = 'block';
            errorMessageEl.style.display = 'none';

            // Inicializa la aplicación una vez que los datos están listos
            initializeApplication();

        } catch (error) {
            console.error("Error al cargar/procesar datos:", error);
            // Oculta mensaje de carga y muestra mensaje de error al usuario
            loadingMessageEl.style.display = 'none';
            errorMessageEl.textContent = `Error cargando datos: ${error.message}. Verifica data.json y la consola (F12) para más detalles.`;
            errorMessageEl.style.display = 'block';
            mainContentEl.style.display = 'none'; // Asegura que el contenido principal no se muestre si hay error
        }
    }


    // --- FUNCIONES GENERALES DE LA APLICACIÓN ---

    // Función utilitaria para barajar arrays (Algoritmo de Fisher-Yates)
    function shuffleArray(array) {
        const shuffled = [...array]; // Crea una copia para no modificar el array original
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1)); // Genera un índice aleatorio
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Intercambia elementos
        }
        return shuffled; // Retorna el array barajado
    }

    // Función utilitaria para normalizar texto (convertir a minúsculas y quitar espacios extra)
    function normalizeAnswer(text) {
         // Si el texto es null/undefined/vacío, retorna string vacío, si no, normaliza
         return text ? String(text).toLowerCase().trim() : '';
    }

    // Configuración de la navegación por pestañas
    function setupNavigation() {
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const sectionId = button.getAttribute('data-section');
                // Ocultar todas las secciones de contenido
                contentSections.forEach(section => section.classList.remove('active'));
                // Quitar la clase 'active' de todos los botones de navegación
                navButtons.forEach(btn => btn.classList.remove('active'));

                // Mostrar la sección correspondiente y marcar el botón como activo
                const currentSection = document.getElementById(sectionId);
                if (currentSection) currentSection.classList.add('active');
                else console.error(`Section ${sectionId} not found.`); // Log error si la sección no existe
                button.classList.add('active');

                // Resetear vistas o inicializar juegos al cambiar de sección
                if (sectionId === 'memorama') {
                    resetMemoramaView(); // Reiniciar juego de Memorama
                } else if (sectionId === 'quiz') {
                    resetQuizView(); // Reiniciar estado del Quiz (muestra setup por defecto)
                } else if (sectionId === 'flashcards') {
                    initializeFlashcardsView(); // Inicializar vista de Flashcards (carga tarjetas de la categoría seleccionada)
                }
                // Nota: Las otras secciones (About, Lexicon, Phrases) solo necesitan ser mostradas.
            });
        });
        // Activar la primera sección por defecto ('About') al cargar
        const aboutButton = document.querySelector('nav button[data-section="about"]');
        const aboutSection = document.getElementById('about');
        if (aboutButton && aboutSection) {
            aboutButton.classList.add('active');
            aboutSection.classList.add('active');
        } else if (navButtons.length > 0 && contentSections.length > 0) {
             // Fallback si 'About' no existe: activar el primer botón/sección encontrado
            navButtons[0].classList.add('active');
            contentSections[0].classList.add('active');
        }
    }

    // Función genérica para poblar un selector <select> con opciones de categoría
    function populateCategorySelect(selectElement, categories) {
         // Verifica si el elemento select y las categorías existen
         if (!selectElement || !categories) { console.warn("Selector o categorías no disponibles para poblar."); return; }
         selectElement.innerHTML = ''; // Limpia opciones existentes

         // Añadir la opción "Todas las categorías" (value 'all')
         const allOption = document.createElement('option');
         allOption.value = 'all';
         allOption.textContent = 'Todas las categorías'; // Texto amigable
         selectElement.appendChild(allOption);

         // Añadir las categorías únicas restantes (excluye 'all' si estuviera en la lista)
         categories.filter(cat => cat !== 'all').forEach(category => {
             const option = document.createElement('option');
             option.value = category; // El valor es el nombre de la categoría
             option.textContent = category; // El texto mostrado es el nombre de la categoría
             selectElement.appendChild(option); // Añade la opción al select
         });
         console.log(`Selector ${selectElement.id} poblado con ${selectElement.options.length} opciones.`);
    }


    // =============================================
    // ========= SECCIÓN LÉXICO (con filtros/iconos) =
    // =============================================

    // Obtener categorías únicas del léxico (sin incluir 'all' inicialmente)
    function getUniqueCategories(data) {
        const categories = new Set();
        // Recorre los datos, añade la categoría si existe y no está vacía
        data.forEach(item => {
            if (item.category && item.category.trim() !== '') {
                categories.add(item.category.trim());
            }
        });
        // Devuelve las categorías únicas como un array ordenado alfabéticamente
        // 'all' NO es parte de esta lista, se añade donde es necesario (botones, selects)
        return Array.from(categories).sort();
    }

    // Crear y mostrar los botones de filtro de categoría para el Léxico
    function populateCategoryFilters() {
        // Verifica si los elementos DOM y los datos están disponibles
        if (!categoryFiltersContainer || !lexiconData) {
            console.warn("Lexicon filter container or lexicon data not available.");
            if(categoryFiltersContainer) categoryFiltersContainer.innerHTML = ''; // Limpiar por si acaso
            return;
        }

        // Obtiene las categorías únicas y añade 'all' para los botones
        const uniqueCategories = getUniqueCategories(lexiconData);
        const categoriesForButtons = ['all', ...uniqueCategories];

        categoryFiltersContainer.innerHTML = ''; // Limpiar botones anteriores

        // Si solo hay 'all' (o ninguna categoría definida en los datos), ocultar el contenedor de filtros
        if (categoriesForButtons.length <= 1) {
             console.log("No categories defined in data.json to show Lexicon filters.");
             categoryFiltersContainer.style.display = 'none';
             return;
        }
        // Si hay categorías, asegurar que el contenedor sea visible
         categoryFiltersContainer.style.display = 'flex';

        // Crea y añade un botón por cada categoría única
        categoriesForButtons.forEach(category => {
            const button = document.createElement('button');
            // Determina el texto del botón ('Todos' para 'all', nombre de la categoría para los demás)
            const categoryName = category === 'all' ? 'Todos' : category;

            // Determina el icono a usar (del mapeo, o el por defecto si no está en el mapeo y no es 'all', o vacío para 'all')
            let icon = '';
            if (category === 'all') {
                icon = categoryIcons['all'] || '';
            } else {
                icon = categoryIcons[category] || defaultCategoryIcon;
            }

            // Establece el texto del botón incluyendo el icono si existe
            button.textContent = icon ? `${icon} ${categoryName}` : categoryName;

            button.dataset.category = category; // Guarda la categoría en un data attribute para identificarla
            button.classList.add('category-filter-btn'); // Añade la clase CSS para estilizado

            // Marca como activo si coincide con el filtro actual guardado
            if (category === currentCategoryFilter) {
                button.classList.add('active');
            }

            // Añade el event listener para manejar el clic
            button.addEventListener('click', handleCategoryFilterClick);
            // Añade el botón al contenedor en el DOM
            categoryFiltersContainer.appendChild(button);
        });
    }

    // Manejar el evento de clic en un botón de filtro de categoría del Léxico
    function handleCategoryFilterClick(event) {
        // Obtiene la categoría del data attribute del botón clickeado
        currentCategoryFilter = event.target.dataset.category;

        // Quita la clase 'active' de todos los botones de filtro
        document.querySelectorAll('.category-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        // Añade la clase 'active' solo al botón clickeado
        event.target.classList.add('active');

        // Vuelve a filtrar y mostrar los items del léxico basándose en la nueva categoría y la búsqueda actual
        filterAndDisplayLexicon();
    }

    // Muestra los items del léxico en el grid basándose en un array de items
    function displayLexiconItems(itemsToShow) {
        if (!lexiconGrid) return; // Verifica si el contenedor del grid existe
        lexiconGrid.innerHTML = ''; // Limpia el contenido actual del grid

        // Muestra un mensaje si no hay items para mostrar (por falta de datos o por los filtros)
        if (!itemsToShow || itemsToShow.length === 0) {
             // Determina el mensaje basándose en si hay filtros activos
             const isFiltered = (lexiconSearchInput && lexiconSearchInput.value) || currentCategoryFilter !== 'all';
             const message = isFiltered
                          ? 'No se encontraron coincidencias para los filtros aplicados.' // Si hay búsqueda o filtro activo
                          : 'No hay datos léxicos para mostrar.'; // Si no hay datos cargados
            // Añade el mensaje centrado y ocupando todo el ancho del grid
            lexiconGrid.innerHTML = `<p class="text-center text-secondary" style="grid-column: 1 / -1;">${message}</p>`;
            return; // Sale de la función
        }

        // Crea y añade un elemento por cada item a mostrar
        itemsToShow.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('lexicon-item'); // Añade la clase CSS para estilizado
            // Usa la imagen del item si existe, si no, usa un placeholder
            const imgSrc = item.image || 'images/placeholder.png';
            // Usa el texto en español y rarámuri, o '???' si faltan
            const spanishText = item.spanish || '???';
            const raramuriText = item.raramuri || '???';

            // Establece el contenido HTML interno del item
            div.innerHTML = `
                <img src="${imgSrc}" alt="${spanishText || raramuriText}" loading="lazy" onerror="this.onerror=null; this.src='images/placeholder.png'; this.alt='Error al cargar: ${raramuriText}';">
                <p class="raramuri-word">${raramuriText}</p>
                <p class="spanish-word">${spanishText}</p>`;
            // Añade el item al grid en el DOM
            lexiconGrid.appendChild(div);
        });
    }

    // Filtra el léxico por la categoría seleccionada (en los botones) y el término de búsqueda, y luego lo muestra
    function filterAndDisplayLexicon() {
        if (!lexiconData) return; // No hacer nada si no hay datos cargados

        // Obtiene el término de búsqueda normalizado (minúsculas, sin espacios extra)
        const searchTerm = lexiconSearchInput ? lexiconSearchInput.value.toLowerCase().trim() : '';
        let filteredItems = lexiconData; // Empieza con todos los datos

        // 1. Filtrar por Categoría seleccionada (si no es 'all')
        // Filtra si item.category existe Y coincide con la categoría actual
        if (currentCategoryFilter !== 'all') {
            filteredItems = filteredItems.filter(item => item.category && item.category === currentCategoryFilter);
        }

        // 2. Filtrar por Término de Búsqueda (si hay un término)
        if (searchTerm) {
            filteredItems = filteredItems.filter(item =>
                // Busca si el término está incluido en la palabra rarámuri o española (insensible a mayúsculas/minúsculas)
                // Asegura que los campos rarámuri/spanish existan antes de usar toLowerCase()
                ((item.raramuri ? item.raramuri.toLowerCase() : '').includes(searchTerm) ||
                 (item.spanish ? item.spanish.toLowerCase() : '').includes(searchTerm))
            );
        }

        // Llama a la función para mostrar los items que pasaron los filtros
        displayLexiconItems(filteredItems);
    }

    // Configurar el input de búsqueda del Léxico
    function setupSearch() {
        if (lexiconSearchInput) {
            // Añade un listener al evento 'input' (cada vez que el valor cambia)
            // Llama a filterAndDisplayLexicon para actualizar la vista
            lexiconSearchInput.addEventListener('input', filterAndDisplayLexicon);
        } else {
            console.error("Elemento #lexicon-search no encontrado.");
        }
    }
    // =============================================
    // ========= FIN SECCIÓN LÉXICO ================
    // =============================================


    // -- Frases --

    // Poblar la lista de frases comunes
     function populatePhrases() {
        if (!phrasesList) return; // Verifica si el contenedor de la lista existe
        phrasesList.innerHTML = ''; // Limpia la lista actual

        // Muestra un mensaje si no hay datos de frases
        if (!phrasesData || phrasesData.length === 0) {
            phrasesList.innerHTML = '<li class="text-secondary">No hay frases disponibles.</li>';
            return;
        }

        // Crea y añade un elemento de lista por cada frase
        phrasesData.forEach(phrase => {
            // Asegura que tanto la frase en rarámuri como en español existen antes de añadir
            if (phrase.raramuri && phrase.spanish) {
                const li = document.createElement('li');
                li.innerHTML = `<span class="raramuri-phrase">${phrase.raramuri}</span><span class="spanish-phrase">${phrase.spanish}</span>`;
                phrasesList.appendChild(li); // Añade el elemento de lista al DOM
            }
        });
    }


    // =============================================
    // ========= SECCIÓN MEMORAMA ==================
    // =============================================

    // (La lógica del Memorama no usa el selector de categoría añadido en Quiz/Flashcards,
    // simplemente selecciona un número de items aleatorios con imagen de todo el léxico.
    // Estas funciones se mantienen principalmente igual a como estaban antes.)

    // Reinicia la vista y el estado del juego Memorama
    function resetMemoramaView() {
        console.log("[Memorama] Reseteando Vista");
        // Muestra/Oculta áreas del UI
        if (memoramaSetup) memoramaSetup.style.display = 'block';
        if (memoramaGameArea) memoramaGameArea.style.display = 'none';
        if (memoramaWinMessage) memoramaWinMessage.style.display = 'none';
        if (memoramaDataErrorEl) memoramaDataErrorEl.style.display = 'none';
        if (memoramaGrid) memoramaGrid.innerHTML = ''; // Limpia el grid de cartas

        // Quita la selección de los botones de dificultad
        difficultyButtons.forEach(btn => btn.classList.remove('selected'));

        // Resetea variables de estado del juego
        memoramaActive = false;
        mCards = [];
        mFlippedElements = [];
        mMatchedPairsCount = 0;
        mTotalPairs = 0;
        mAttempts = 0;
        mLockBoard = false;
        // Actualiza el contador de intentos en UI
        if (memoramaAttemptsEl) memoramaAttemptsEl.textContent = '0';
    }

    // Crea el contenido para la cara frontal de una tarjeta de Memorama (imagen o texto)
    function createMemoramaFaceContent(cardInfo, faceElement) {
        // Verifica que los parámetros necesarios estén presentes
        if (!cardInfo || !faceElement) {
            console.error("[Memorama Critico] Faltan parámetros en createMemoramaFaceContent"); return;
        }
        faceElement.innerHTML = ''; // Limpia el contenido actual del elemento de la cara

        try {
            // Si es una tarjeta de imagen y tiene valor
            if (cardInfo.type === 'image' && cardInfo.value) {
                const img = document.createElement('img');
                img.src = cardInfo.value; // Establece la fuente de la imagen
                img.alt = cardInfo.altText || "Imagen Memorama"; // Establece texto alternativo (accesibilidad)
                img.loading = 'lazy'; // Habilita carga perezosa (rendimiento)
                // Manejo de errores de carga de imagen
                img.onerror = function() {
                    console.error(`[Memorama Critical] Falló carga IMG: ${this.src} (ID: ${cardInfo.id})`);
                    this.style.display = 'none'; // Oculta la imagen rota
                    // Añade un pequeño mensaje de error visual
                    const errorP = document.createElement('p'); errorP.textContent = 'Error Img!'; errorP.style.color = 'red'; errorP.style.fontSize = '10px';
                    faceElement.appendChild(errorP);
                };
                faceElement.appendChild(img); // Añade la imagen al elemento de la cara
            }
            // Si es una tarjeta de texto y tiene valor
            else if (cardInfo.type === 'text' && cardInfo.value) {
                const textP = document.createElement('p');
                textP.textContent = cardInfo.value; // Establece el texto
                faceElement.appendChild(textP); // Añade el párrafo al elemento de la cara
            }
            // Si el contenido es inválido o falta
            else {
                console.warn(`[Memorama Warn] Contenido inválido (ID: ${cardInfo.id}):`, cardInfo);
                // Añade un texto de fallback visual
                const fallbackP = document.createElement('p'); fallbackP.textContent = '??'; fallbackP.style.opacity = '0.5';
                faceElement.appendChild(fallbackP);
            }
        } catch (e) {
            console.error("[Memorama Critico] Excepción en createMemoramaFaceContent:", e, cardInfo);
            // Intenta añadir un mensaje de error de JS si ocurre una excepción
            try { faceElement.innerHTML = '<p style="color:red; font-size:10px;">Error JS!</p>'; } catch (fe) {}
        }
    }

    // Prepara los datos (items de léxico) para el juego Memorama
    function prepareCardData(requestedPairs) {
        // Filtra los items del léxico que son válidos para Memorama (tienen id, imagen, rarámuri y español)
        const validItems = lexiconData.filter(item => item && item.id != null && item.image && item.raramuri && item.spanish);

        // Verifica si hay suficientes items válidos para el número de pares solicitado
        if (validItems.length < requestedPairs) {
            console.warn(`[Memorama] Datos insuficientes: ${validItems.length} items válidos, se necesitan ${requestedPairs} pares.`);
            // Muestra un mensaje de error específico en la UI de Memorama
            if (memoramaDataErrorEl) {
                memoramaDataErrorEl.textContent = `Datos insuficientes (${validItems.length}) con imagen para ${requestedPairs} pares. Añade más entradas con imagen al léxico.`;
                memoramaDataErrorEl.style.display = 'block';
            }
            // Oculta el área de juego y muestra el setup si no hay suficientes datos
             if (memoramaGameArea) memoramaGameArea.style.display = 'none';
             if (memoramaSetup) memoramaSetup.style.display = 'block';
             // Quita la selección del botón de dificultad
             difficultyButtons.forEach(btn => btn.classList.remove('selected'));
            return null; // Retorna null indicando que no se pudo preparar la data
        }
        // Si hay suficientes datos, oculta el mensaje de error
        if (memoramaDataErrorEl) memoramaDataErrorEl.style.display = 'none';

        // Baraja los items válidos y toma la cantidad de pares solicitada
        const shuffledValidItems = shuffleArray(validItems);
        const itemsForGame = shuffledValidItems.slice(0, requestedPairs);

        return itemsForGame; // Retorna los items seleccionados para el juego
    }

    // Construye el grid de cartas en el DOM para el Memorama
    function buildMemoramaGrid() {
        if (!memoramaGrid) { console.error("[Memorama Error] #memorama-grid no encontrado."); return; }
        memoramaGrid.innerHTML = ''; // Limpia el contenido actual del grid

        // Itera sobre el array de cartas preparadas (mCards)
        mCards.forEach((cardData, index) => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('memorama-card'); // Añade clase principal de tarjeta

            // Verifica que los datos de la carta sean válidos
            if (cardData.id === undefined || cardData.id === null) {
                console.error(`[Memorama Error] ID indefinido carta ${index}`, cardData); return;
            }
            // Guarda el ID para la lógica de matching y el índice para debug
            cardElement.dataset.id = cardData.id;
            cardElement.dataset.index = index;

            // Crea los elementos para la cara frontal y trasera
            const frontFace = document.createElement('div');
            frontFace.classList.add('card-face', 'card-front');
            // Llena la cara frontal con el contenido adecuado (imagen o texto)
            createMemoramaFaceContent(cardData, frontFace);

            const backFace = document.createElement('div');
            backFace.classList.add('card-face', 'card-back');
            // La cara trasera del Memorama tiene el '?' definido en CSS ::before

            // Añade ambas caras a la tarjeta
            cardElement.appendChild(frontFace);
            cardElement.appendChild(backFace);

            // Añade el event listener para el clic en la tarjeta
            cardElement.addEventListener('click', handleMemoramaCardClick);
            // Añade la tarjeta al grid en el DOM
            memoramaGrid.appendChild(cardElement);
        });

        // Ajusta el número de columnas del grid dinámicamente basado en la cantidad de cartas
        let columns = Math.ceil(Math.sqrt(mCards.length));
        columns = Math.max(2, Math.min(columns, 5)); // Limita las columnas entre 2 y 5

        memoramaGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        console.log(`[Memorama] Grid construido con ${columns} columnas.`);
    }

    // Inicia una nueva partida de Memorama
    function startMemorama(numPairs) {
        console.log(`[Memorama] Iniciando startMemorama con ${numPairs} pares.`);
        resetMemoramaView(); // Limpia y resetea la vista y el estado actual del juego

        // Prepara los items de léxico para esta partida
        const itemsForGame = prepareCardData(numPairs);

        // Si prepareCardData retornó null (no hay suficientes datos válidos), salir
        if (!itemsForGame) {
            memoramaActive = false; // Asegura que el juego no se active
            return; // La función prepareCardData ya mostró el mensaje de error
        }

        // Inicializa el estado del juego para la nueva partida
        mTotalPairs = itemsForGame.length; // Número total de pares a encontrar
        memoramaActive = true; // Marca el juego como activo
        mCards = []; // Reinicia el array de cartas
        mAttempts = 0; // Reinicia el contador de intentos
        mMatchedPairsCount = 0; // Reinicia el contador de pares encontrados
        mFlippedElements = []; // Reinicia el array de cartas volteadas temporalmente
        mLockBoard = false; // Asegura que el tablero no esté bloqueado

        // Actualiza el contador de intentos en la UI
        if (memoramaAttemptsEl) memoramaAttemptsEl.textContent = mAttempts;
        // Oculta el mensaje de victoria si estaba visible
        if (memoramaWinMessage) memoramaWinMessage.style.display = 'none';

        // Crea los pares de tarjetas a partir de los items seleccionados (imagen + texto raramuri)
        itemsForGame.forEach(item => {
            mCards.push({ id: item.id, type: 'image', value: item.image, altText: item.spanish });
            mCards.push({ id: item.id, type: 'text', value: item.raramuri });
        });

        mCards = shuffleArray(mCards); // Baraja aleatoriamente todas las cartas
        buildMemoramaGrid(); // Construye el grid de cartas en el DOM

        // Oculta el área de configuración y muestra el área de juego
        if (memoramaSetup) memoramaSetup.style.display = 'none';
        if (memoramaGameArea) memoramaGameArea.style.display = 'block';
        console.log(`[Memorama] Juego listo con ${mTotalPairs} pares y ${mCards.length} cartas.`);
    }

    // Maneja el evento de clic en una tarjeta de Memorama
    function handleMemoramaCardClick(event) {
        // Verifica si el juego está activo, si el tablero no está bloqueado y si hay un target válido
        if (!memoramaActive || mLockBoard || !event.currentTarget) return;

        const clickedCardElement = event.currentTarget; // La tarjeta que fue clickeada

        // Ignora el click si la tarjeta ya está volteada o ya fue emparejada
        if (clickedCardElement.classList.contains('flipped') || clickedCardElement.classList.contains('matched')) {
            return;
        }

        // Voltea la tarjeta clickeada (añadiendo la clase 'flipped')
        clickedCardElement.classList.add('flipped');
        // Añade la tarjeta a la lista de elementos volteados en este turno
        mFlippedElements.push(clickedCardElement);

        // Si ya hay dos tarjetas volteadas en este turno
        if (mFlippedElements.length === 2) {
            mLockBoard = true; // Bloquea el tablero para evitar más clicks mientras se comparan las cartas
            mAttempts++; // Incrementa el contador de intentos
            if (memoramaAttemptsEl) memoramaAttemptsEl.textContent = mAttempts; // Actualiza el contador en la UI
            checkMemoramaMatch(); // Llama a la función para comprobar si son un par
        }
    }

    // Comprueba si las dos tarjetas volteadas en el turno actual forman un par
    function checkMemoramaMatch() {
        // Obtiene las dos tarjetas del array de elementos volteados
        const [card1, card2] = mFlippedElements;

        // Verifica que realmente hay dos tarjetas para comparar
        if (!card1 || !card2) {
            console.error("[Memorama Critico] Faltan cartas en checkMemoramaMatch.");
            mFlippedElements = []; // Limpia el array por seguridad
            mLockBoard = false; // Desbloquea el tablero
            return;
        }

        // Comprueba si los IDs de las dos tarjetas coinciden (son un par si tienen el mismo ID)
        const isMatch = card1.dataset.id === card2.dataset.id;

        if (isMatch) {
            // Es un par:
            mMatchedPairsCount++; // Incrementa el contador de pares encontrados
            // Deja las tarjetas volteadas y las marca como emparejadas después de una breve pausa
            setTimeout(() => {
                card1.classList.add('matched');
                card2.classList.add('matched');
                mFlippedElements = []; // Limpia el array de elementos volteados
                mLockBoard = false; // Desbloquea el tablero

                // Comprueba si se han encontrado todos los pares (juego ganado)
                if (mMatchedPairsCount === mTotalPairs) {
                    console.log("[Memorama] ¡Juego Ganado!");
                    // Muestra el mensaje de victoria en la UI
                    if (memoramaWinMessage) {
                        memoramaWinMessage.textContent = `¡Felicidades! Encontraste ${mTotalPairs} pares en ${mAttempts} intentos.`;
                        memoramaWinMessage.style.display = 'block';
                    }
                    memoramaActive = false; // Desactiva el juego
                }
            }, 300); // Pausa corta para que el usuario vea el par antes de marcarlas
        } else {
            // No es un par:
            // Voltea las tarjetas de nuevo después de una pausa más larga para que el usuario vea que no coincidieron
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                mFlippedElements = []; // Limpia el array de elementos volteados
                mLockBoard = false; // Desbloquea el tablero
            }, 1000); // Pausa de 1 segundo
        }
    }

    // Configura los event listeners para los controles del Memorama
    function setupMemoramaControls() {
        // Verifica que los elementos DOM esenciales existan
        if (!memoramaSetup || !resetMemoramaBtn || difficultyButtons.length === 0) {
            console.error("[Memorama Critico] Faltan elementos HTML para controles de Memorama.");
            return;
        }
        console.log("[Memorama] Configurando controles.");

        // Configura los botones de dificultad
        difficultyButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Obtiene el número de pares del data attribute del botón
                const pairs = parseInt(button.getAttribute('data-pairs'));
                // Valida el número de pares
                if (isNaN(pairs) || pairs <= 0) {
                    console.error("[Memorama Error] Atributo data-pairs inválido:", button);
                    return;
                }
                // Quita la clase 'selected' de todos los botones de dificultad
                difficultyButtons.forEach(btn => btn.classList.remove('selected'));
                // Añade la clase 'selected' al botón clickeado
                button.classList.add('selected');
                // Inicia el juego con el número de pares seleccionado
                startMemorama(pairs);
            });
        });

        // Configura el botón de reiniciar juego
        resetMemoramaBtn.addEventListener('click', () => {
            console.log("[Memorama] Botón Reset presionado.");
            // Intenta reiniciar con la dificultad actualmente seleccionada
            const selectedBtn = document.querySelector('#memorama-setup .difficulty-btn.selected');
            if (selectedBtn) { // Si una dificultad fue previamente seleccionada, reinicia con esa dificultad
                const pairs = parseInt(selectedBtn.getAttribute('data-pairs'));
                if (!isNaN(pairs) && pairs > 0) { startMemorama(pairs); }
                else { resetMemoramaView(); } // Si no se encuentra dificultad seleccionada, solo resetea la vista
            } else { resetMemoramaView(); } // Si no hay botones seleccionados, solo resetea la vista
        });
    }
    // =============================================
    // ===== FIN SECCIÓN MEMORAMA ==================
    // =============================================


    // =============================================
    // ========= SECCIÓN QUIZ (con filtro categoría) =
    // =============================================

     // Obtiene opciones incorrectas para una pregunta de opción múltiple
     function getWrongOptions(correctItem, count, sourceData, field) {
        if (!correctItem || !field || !sourceData) return [];
         const correctValueNorm = normalizeAnswer(correctItem[field]); // Valor correcto normalizado

         // Filtra items que NO son el item correcto y tienen el campo relevante
         const wrongAnswerPool = sourceData.filter(item =>
             item && item.id !== correctItem.id && item[field] &&
             normalizeAnswer(item[field]) !== correctValueNorm // Asegura que no sea la misma respuesta normalizada
         );

         const shuffledWrongs = shuffleArray([...wrongAnswerPool]); // Baraja el pool de respuestas incorrectas
         let options = new Set(); // Usa un Set para asegurar opciones únicas

         // Toma hasta 'count' opciones únicas del pool barajado
         for (const item of shuffledWrongs) {
             if (options.size >= count) break;
             options.add(item[field]); // Añade el valor original sin normalizar
         }

         // Fallback: Si no pudimos encontrar suficientes opciones únicas (raro pero posible si el pool es muy pequeño)
         // Intenta añadir opciones aleatorias de todo el sourceData (excepto la correcta)
         // Este paso puede ser menos relevante si getWrongOptions siempre se llama con un pool adecuado.
         let attempts = 0;
         const maxAttempts = sourceData.length * 2; // Limita intentos para evitar bucle infinito
         while (options.size < count && attempts < maxAttempts) {
             const randomItem = sourceData[Math.floor(Math.random() * sourceData.length)];
             if (randomItem && randomItem[field] && normalizeAnswer(randomItem[field]) !== correctValueNorm) {
                  // Añade solo si no es la respuesta correcta (normalizada) y no está ya en el Set
                  options.add(randomItem[field]); // Añade el valor original
             }
             attempts++;
         }

         return Array.from(options); // Devuelve las opciones como array
     }

    // Genera el set de preguntas para el Quiz, filtrando por categoría seleccionada en el UI
    function generateQuizQuestions(numQuestions) {
        // Obtiene la categoría seleccionada del selector de categoría del Quiz
        const selectedCategory = quizCategorySelect ? quizCategorySelect.value : 'all';
        console.log(`[Quiz] Generating questions for category: "${selectedCategory}"`);

        // 1. Filtrar los items del léxico por la categoría seleccionada
        const categoryFilteredItems = lexiconData.filter(item =>
            item && item.id != null && item.raramuri && item.spanish && // Items básicos válidos (necesitan raramuri y spanish para la mayoría de preguntas)
            (selectedCategory === 'all' || (item.category && item.category === selectedCategory)) // Filtro por categoría (verifica que item.category exista)
        );

        // Verifica si hay suficientes items en la categoría filtrada para generar preguntas significativas
        // Se necesitan al menos 2 items para preguntas con opciones incorrectas o para tener variedad.
        if (categoryFilteredItems.length < 2) {
            console.warn(`[Quiz] Datos insuficientes para la categoría "${selectedCategory}" (${categoryFilteredItems.length}). Se necesitan al menos 2 entradas léxicas completas con categoría asignada para generar preguntas.`);
            // Muestra un mensaje de error específico del Quiz en la UI
            if(quizDataErrorEl) {
                const categoryDisplayName = selectedCategory === 'all' ? 'Todas las categorías' : `la categoría "${selectedCategory}"`;
                quizDataErrorEl.textContent = `Datos insuficientes (${categoryFilteredItems.length}) para ${categoryDisplayName}. Se necesitan al menos 2 entradas léxicas completas con categoría asignada.`;
                quizDataErrorEl.style.display = 'block';
            }
            return []; // Retorna un array vacío indicando que no se pudieron generar preguntas
        } else {
             // Si hay suficientes datos, oculta el mensaje de error
             if(quizDataErrorEl) quizDataErrorEl.style.display = 'none';
        }

        // Prepara los items filtrados para generar diferentes tipos de preguntas
        const availableLexiconItems = categoryFilteredItems; // Items válidos en la categoría filtrada
        const availableImageItems = availableLexiconItems.filter(item => item.image); // Items con imagen válidos en la categoría filtrada


        // Crea un pool de preguntas potenciales de varios tipos a partir de los items disponibles
        const potentialQuestions = [];
        availableLexiconItems.forEach(item => {
            potentialQuestions.push({ type: 'MC_RaSp', item: item, question: `¿Qué significa "${item.raramuri}"?`, answer: item.spanish }); // MC Rarámuri -> Español
            potentialQuestions.push({ type: 'MC_SpRa', item: item, question: `¿Cómo se dice "${item.spanish}" en rarámuri?`, answer: item.raramuri }); // MC Español -> Rarámuri
            potentialQuestions.push({ type: 'TXT_SpRa', item: item, question: `Escribe cómo se dice "${item.spanish}" en rarámuri:`, answer: item.raramuri }); // Texto Español -> Rarámuri
        });
         // Generar preguntas de Imagen solo a partir de items que estén en la categoría filtrada Y tengan una imagen
        availableImageItems.forEach(item => {
            potentialQuestions.push({ type: 'MC_ImgRa', item: item, question: `¿Qué es esto en rarámuri?`, answer: item.raramuri, image: item.image }); // MC Imagen -> Rarámuri
            potentialQuestions.push({ type: 'TXT_ImgRa', item: item, question: `Escribe en rarámuri qué ves en la imagen:`, answer: item.raramuri, image: item.image }); // Texto Imagen -> Rarámuri
        });

        const shuffledPotentialQuestions = shuffleArray(potentialQuestions); // Baraja el pool de preguntas potenciales

        let questionsToGenerate = 0;
        const totalPotential = shuffledPotentialQuestions.length; // Total de preguntas potenciales generadas

        // Si no se generó ninguna pregunta (raro si categoryFilteredItems.length >= 2 pero posible si faltan campos o imágenes)
        if (totalPotential === 0) {
             console.warn(`[Quiz] No se pudieron generar preguntas para la categoría "${selectedCategory}" después de filtrar.`);
             if(quizDataErrorEl) {
                 const categoryDisplayName = selectedCategory === 'all' ? 'estas categorías' : `la categoría "${selectedCategory}"`;
                 quizDataErrorEl.textContent = `No se pudieron generar preguntas con los datos disponibles para ${categoryDisplayName}.`;
                 quizDataErrorEl.style.display = 'block';
             }
             return []; // Retorna array vacío
        }

        // Determina cuántas preguntas seleccionar basándose en la opción del usuario ('all' o un número)
        if (numQuestions === 'all') { questionsToGenerate = totalPotential; }
        else { questionsToGenerate = Math.min(parseInt(numQuestions), totalPotential); }

        questionsToGenerate = Math.max(1, questionsToGenerate); // Asegura seleccionar al menos 1 pregunta si es posible

        const finalQuestions = shuffledPotentialQuestions.slice(0, questionsToGenerate); // Selecciona el set final de preguntas

        // Generar opciones incorrectas para las preguntas de opción múltiple (MC)
        finalQuestions.forEach(q => {
            if (q.type.startsWith('MC_')) {
                let wrongOptions = [];
                let field = ''; // Campo a usar para las opciones incorrectas (spanish o raramuri)

                if (q.type === 'MC_RaSp') field = 'spanish';
                else if (q.type === 'MC_SpRa' || q.type === 'MC_ImgRa') field = 'raramuri';

                // Obtiene un pool de items del léxico *dentro de la misma categoría filtrada* que NO sean el item correcto
                if (field && q.item) {
                     const potentialWrongPool = categoryFilteredItems.filter(item => item && item.id !== q.item.id);
                     // Llama a getWrongOptions usando este pool filtrado
                     wrongOptions = getWrongOptions(q.item, 3, potentialWrongPool, field);
                     const allOptions = [q.answer, ...wrongOptions];
                     const uniqueOptions = Array.from(new Set(allOptions)); // Asegura opciones únicas
                     q.options = shuffleArray(uniqueOptions.slice(0, 4)); // Baraja y limita a máximo 4 opciones
                } else {
                     // Fallback si no se puede determinar el campo o el item correcto
                     q.options = [q.answer]; // Solo la respuesta correcta como opción (esto hará que la pregunta sea trivial o presente un error visual si solo hay 1 opción)
                     console.warn("No se pudieron generar opciones MC válidas para:", q);
                }

                // Opcional: Marcar preguntas MC que no tienen al menos 2 opciones para posible filtrado posterior
                if (!Array.isArray(q.options) || q.options.length < 2) {
                     console.warn("Pregunta MC generada con menos de 2 opciones:", q);
                     // q._invalid = true; // Puedes usar una flag si quieres eliminarlas más adelante
                }
            }
        });

        // Si usaste q._invalid = true, podrías filtrar aquí:
        // const validFinalQuestions = finalQuestions.filter(q => !q._invalid);
        const validFinalQuestions = finalQuestions; // Por ahora, mantenemos todas las preguntas generadas

        console.log("[Quiz] Preguntas generadas:", validFinalQuestions);
        return validFinalQuestions; // Retorna el array de preguntas generadas
     }

    // Inicia una nueva partida de Quiz
    function startQuiz(isRetry = false) {
         quizActive = true; score = 0; currentQuestionIndex = 0;

         // Si no es un reintento de preguntas falladas, genera un nuevo set completo
         if (!isRetry) {
             const selectedLength = quizLengthSelect ? quizLengthSelect.value : '5';
             // generateQuizQuestions lee la categoría seleccionada internamente del selector
             allQuizQuestions = generateQuizQuestions(selectedLength);
             currentQuizSet = allQuizQuestions; // El set inicial de juego es el set completo
             missedQuestions = []; // Reinicia las preguntas falladas
         }
         else { // Si es un reintento de preguntas falladas
             currentQuizSet = shuffleArray([...missedQuestions]); // Baraja las preguntas falladas
             missedQuestions = []; // Reinicia el array de falladas para esta nueva ronda
             // Si no hay preguntas falladas para reintentar
             if (currentQuizSet.length === 0) {
                 alert("¡Felicidades! No hubo preguntas falladas en el último intento.");
                 resetQuizView(); // Vuelve al setup si no hay nada que reintentar
                 return; // Sale de la función
             }
             console.log("[Quiz] Reintentando:", currentQuizSet);
              // Asegura que el mensaje de error de datos específico del Quiz esté oculto cuando reintentas falladas
              if(quizDataErrorEl) quizDataErrorEl.style.display = 'none';
         }

         // Si no hay preguntas en el set actual (ya sea porque la generación inicial falló o no había falladas)
         if (!currentQuizSet || currentQuizSet.length === 0) {
             console.log("[Quiz] No hay preguntas disponibles en el set actual.");
             // Si generateQuizQuestions retornó vacío, ya mostró el error.
             // Si fue un reintento y currentQuizSet estaba vacío, la alerta ya se mostró.
             // Asegura que la UI esté en estado de setup
             if(quizQuestionArea) quizQuestionArea.style.display = 'none';
             if(quizSetup) quizSetup.style.display = 'block';
             if(quizResultsEl) quizResultsEl.style.display = 'none';
             if(retryMissedQuizBtn) retryMissedQuizBtn.style.display = 'none';
             // quizDataErrorEl visibility is managed by generateQuizQuestions or the empty retry check
             quizActive = false; // Marca el juego como inactivo
             return; // Sale de la función
         }

         // Si hay preguntas, procede a iniciar la visualización del juego
         if(quizSetup) quizSetup.style.display = 'none'; // Oculta setup
         if(quizResultsEl) quizResultsEl.style.display = 'none'; // Oculta resultados
         if(retryMissedQuizBtn) retryMissedQuizBtn.style.display = 'none'; // Oculta botón reintentar
         if(quizQuestionArea) quizQuestionArea.style.display = 'block'; // Muestra área de pregunta
         if(nextQuestionBtn) nextQuestionBtn.style.display = 'none'; // Oculta botón Siguiente inicialmente
         // quizDataErrorEl está oculto arriba si currentQuizSet no está vacío

         displayQuestion(); // Muestra la primera pregunta del set
     }

    // Muestra la pregunta actual en la UI (Funciona igual, no necesita cambios por categoría)
    function displayQuestion() {
        // Si ya no quedan preguntas en el set actual, muestra los resultados finales
        if (currentQuestionIndex >= currentQuizSet.length) { showResults(); return; }

        quizActive = true; // Marca el quiz como activo para permitir interacción con la pregunta actual
        const q = currentQuizSet[currentQuestionIndex]; // Obtiene el objeto de la pregunta actual

        // Verificación básica de la validez del objeto pregunta
        if (!q || typeof q.type === 'undefined' || typeof q.question === 'undefined' || typeof q.answer === 'undefined') {
             console.error("[Quiz Error] Pregunta inválida en el set:", q);
             // Si la pregunta es inválida, muestra un error y permite pasar a la siguiente
             if(quizFeedbackEl) {
                 quizFeedbackEl.textContent = "Error al cargar pregunta.";
                 quizFeedbackEl.className = 'incorrect';
             }
             quizActive = false; // Desactiva interacción
             if(nextQuestionBtn) nextQuestionBtn.style.display = 'inline-block'; // Permite saltar
             // Intenta pasar a la siguiente pregunta después de un pequeño retraso
             setTimeout(goToNextQuestion, 1000); // Auto-skip después de 1 segundo
             return;
        }

        // Limpia y resetea áreas de la UI para la nueva pregunta
        if(quizQuestionEl) quizQuestionEl.textContent = q.question; // Muestra el texto de la pregunta
        if(quizImageContainer) quizImageContainer.innerHTML = ''; // Limpia contenedor de imagen
        if(quizOptionsEl) { quizOptionsEl.innerHTML = ''; quizOptionsEl.style.display = 'none'; } // Limpia y oculta opciones MC
        if(quizTextInputArea) quizTextInputArea.style.display = 'none'; // Oculta área de texto
        if(quizTextAnswerInput) { // Limpia y resetea input de texto
            quizTextAnswerInput.value = '';
            quizTextAnswerInput.className = ''; // Quita clases de correcto/incorrecto
            quizTextAnswerInput.disabled = false; // Habilita input
        }
        if(submitTextAnswerBtn) submitTextAnswerBtn.disabled = false; // Habilita botón de submit texto
        if(quizFeedbackEl) { quizFeedbackEl.textContent = ''; quizFeedbackEl.className = ''; } // Limpia feedback
        if(nextQuestionBtn) nextQuestionBtn.style.display = 'none'; // Oculta botón Siguiente

        // Si la pregunta tiene una imagen, la muestra
        if (q.image && quizImageContainer) {
             const img = document.createElement('img');
             img.src = q.image;
             img.alt = `Imagen para la pregunta: ${q.question}`; // Alt text descriptivo
             img.loading = 'lazy'; // Carga perezosa
             img.onerror = function() { // Manejo de error si la imagen no carga
                 console.error(`[Quiz Error] IMG no cargada: ${this.src}`);
                 this.alt = 'Error al cargar imagen';
                 this.src='images/placeholder.png'; // Muestra placeholder
             };
             quizImageContainer.appendChild(img);
        }

        // Configura las opciones de respuesta según el tipo de pregunta
        if (q.type.startsWith('MC_') && quizOptionsEl) {
            // Si es opción múltiple, muestra el área de opciones
            quizOptionsEl.style.display = 'block';
            // Verifica que existan opciones válidas (al menos 2)
            if (!Array.isArray(q.options) || q.options.length < 2) {
                 console.error("[Quiz Error] Pregunta MC sin opciones válidas en display:", q);
                 quizOptionsEl.innerHTML = '<p style="color:var(--error-red);">Error al mostrar opciones para esta pregunta.</p>';
                 // En este caso, permite pasar a la siguiente pregunta ya que esta no se puede responder
                 quizActive = false; // Desactiva interacción
                 if(nextQuestionBtn) nextQuestionBtn.style.display = 'inline-block'; // Muestra botón Siguiente
            }
            else {
                 // Crea un botón por cada opción y añade un listener
                 q.options.forEach(option => {
                     const button = document.createElement('button');
                     button.textContent = option;
                     button.disabled = false; // Habilita botón
                     button.addEventListener('click', handleMCAnswer); // Listener al clic
                     quizOptionsEl.appendChild(button); // Añade el botón al contenedor de opciones
                 });
            }
        } else if (q.type.startsWith('TXT_') && quizTextInputArea && quizTextAnswerInput && submitTextAnswerBtn) {
            // Si es pregunta de texto, muestra el área de input de texto
            quizTextInputArea.style.display = 'flex';
            // Pone el foco en el input después de un pequeño retraso
            setTimeout(() => { if (quizTextAnswerInput) quizTextAnswerInput.focus(); }, 100);
        } else {
            // Maneja tipos de pregunta inesperados o falta de elementos DOM necesarios para el tipo
             console.error("[Quiz Error] Tipo de pregunta desconocido o elementos DOM faltantes para el tipo:", q.type, q);
             if(quizFeedbackEl) {
                 quizFeedbackEl.textContent = "Error: Tipo de pregunta desconocido.";
                 quizFeedbackEl.className = 'incorrect';
             }
             quizActive = false; // Desactiva interacción
             if(nextQuestionBtn) nextQuestionBtn.style.display = 'inline-block'; // Permite saltar
        }
    }

    // Maneja el evento de clic en una opción de una pregunta de opción múltiple (MC)
    function handleMCAnswer(event) {
        // Verifica que el quiz esté activo y los elementos DOM necesarios existan
        if (!quizActive || !quizOptionsEl || !quizFeedbackEl || !nextQuestionBtn) return;

        quizActive = false; // Desactiva el quiz temporalmente para procesar la respuesta
        const selectedButton = event.target; // El botón que fue clickeado
        const selectedAnswer = selectedButton.textContent; // El texto de la opción seleccionada
        const currentQuestion = currentQuizSet[currentQuestionIndex]; // La pregunta actual

        // Verifica que la pregunta y la respuesta existan
        if (!currentQuestion || typeof currentQuestion.answer === 'undefined') {
             console.error("[Quiz Error] handleMCAnswer: Invalid current question or answer.");
             // Muestra error, deshabilita botones y permite siguiente
             if(quizFeedbackEl) { quizFeedbackEl.textContent = "Error interno. No se pudo verificar la respuesta."; quizFeedbackEl.className = 'incorrect'; }
             const optionButtons = quizOptionsEl.querySelectorAll('button');
             optionButtons.forEach(btn => btn.disabled = true);
             if(nextQuestionBtn) nextQuestionBtn.style.display = 'inline-block';
             return;
        }

        const correctAnswer = currentQuestion.answer; // La respuesta correcta
        const optionButtons = quizOptionsEl.querySelectorAll('button'); // Todos los botones de opción

        // Deshabilita todos los botones de opción después de una selección
        optionButtons.forEach(btn => btn.disabled = true);

        // Comprueba si la respuesta seleccionada es correcta
        if (selectedAnswer === correctAnswer) {
            score++; // Incrementa la puntuación
            selectedButton.classList.add('correct'); // Marca el botón seleccionado como correcto
            quizFeedbackEl.textContent = '¡Correcto!'; // Muestra feedback de correcto
            quizFeedbackEl.className = 'correct'; // Añade clase para estilo de feedback correcto
        } else {
            selectedButton.classList.add('incorrect'); // Marca el botón seleccionado como incorrecto
            quizFeedbackEl.innerHTML = `Incorrecto. Correcto: <strong>${correctAnswer}</strong>`; // Muestra feedback con la respuesta correcta
            quizFeedbackEl.className = 'incorrect'; // Añade clase para estilo de feedback incorrecto

            // Si la pregunta fue respondida incorrectamente y tiene un item asociado, la añade a la lista de falladas (si no está ya)
            if (currentQuestion.item && !missedQuestions.some(mq => mq.item.id === currentQuestion.item.id)) {
                 // Hace una copia profunda para evitar referencias compartidas si el objeto pregunta es complejo
                missedQuestions.push(JSON.parse(JSON.stringify(currentQuestion)));
            }

            // Resalta la respuesta correcta entre las opciones
            optionButtons.forEach(btn => {
                if (btn.textContent === correctAnswer) {
                    btn.classList.add('correct');
                }
            });
        }

        // Muestra el botón para pasar a la siguiente pregunta
        if(nextQuestionBtn) nextQuestionBtn.style.display = 'inline-block';
    }

    // Maneja el envío de respuesta para preguntas de texto
    function handleTextAnswer() {
         // Verifica que el quiz esté activo y los elementos DOM necesarios existan
         if (!quizActive || !quizTextAnswerInput || !submitTextAnswerBtn || !quizFeedbackEl || !nextQuestionBtn) return;

         quizActive = false; // Desactiva el quiz temporalmente
         const currentQuestion = currentQuizSet[currentQuestionIndex]; // La pregunta actual

        // Verifica que la pregunta y la respuesta existan
         if (!currentQuestion || typeof currentQuestion.answer === 'undefined') {
             console.error("[Quiz Error] handleTextAnswer: Invalid current question or answer.");
             // Muestra error, deshabilita input/botón y permite siguiente
              if(quizFeedbackEl) { quizFeedbackEl.textContent = "Error interno. No se pudo verificar la respuesta."; quizFeedbackEl.className = 'incorrect'; }
             if (quizTextAnswerInput) quizTextAnswerInput.disabled = true;
             if (submitTextAnswerBtn) submitTextAnswerBtn.disabled = true;
              if(nextQuestionBtn) nextQuestionBtn.style.display = 'inline-block';
             return;
         }

         const userAnswer = normalizeAnswer(quizTextAnswerInput.value); // Respuesta del usuario normalizada
         const correctAnswerNorm = normalizeAnswer(currentQuestion.answer); // Respuesta correcta normalizada
         const originalCorrectAnswer = currentQuestion.answer; // Guarda la respuesta correcta original para mostrarla si es incorrecta

         // Deshabilita el input y el botón de submit
         if (quizTextAnswerInput) quizTextAnswerInput.disabled = true;
         if (submitTextAnswerBtn) submitTextAnswerBtn.disabled = true;

         // Comprueba si la respuesta del usuario es correcta (normalizada) y no está vacía
         if (userAnswer === correctAnswerNorm && userAnswer !== '') {
             score++; // Incrementa puntuación
             if (quizTextAnswerInput) quizTextAnswerInput.classList.add('correct'); // Marca input como correcto
             quizFeedbackEl.textContent = '¡Correcto!'; // Muestra feedback
             quizFeedbackEl.className = 'correct'; // Estilo feedback correcto
         }
         else {
             if (quizTextAnswerInput) quizTextAnswerInput.classList.add('incorrect'); // Marca input como incorrecto
             quizFeedbackEl.innerHTML = `Incorrecto. Correcto: <strong>${originalCorrectAnswer}</strong>`; // Muestra feedback con respuesta correcta original
             quizFeedbackEl.className = 'incorrect'; // Estilo feedback incorrecto

             // Si la pregunta fue respondida incorrectamente y tiene un item asociado, la añade a la lista de falladas (si no está ya)
             if (currentQuestion.item && !missedQuestions.some(mq => mq.item.id === currentQuestion.item.id)) {
                 missedQuestions.push(JSON.parse(JSON.stringify(currentQuestion))); // Copia profunda
             }
         }

         // Muestra el botón para pasar a la siguiente pregunta
         if(nextQuestionBtn) nextQuestionBtn.style.display = 'inline-block';
     }

    // Avanza a la siguiente pregunta o muestra los resultados finales
    function goToNextQuestion() {
        currentQuestionIndex++; // Incrementa el índice de la pregunta
        // Muestra la siguiente pregunta después de un pequeño retraso para suavizar la transición
        setTimeout(displayQuestion, 50); // Llama displayQuestion, que internamente verifica si terminó el quiz
    }

    // Muestra la pantalla de resultados del Quiz
    function showResults() {
        if(quizQuestionArea) quizQuestionArea.style.display = 'none'; // Oculta área de pregunta
        if(quizResultsEl) quizResultsEl.style.display = 'block'; // Muestra área de resultados

        // Actualiza la puntuación en la UI de resultados
        if(quizScoreEl) quizScoreEl.textContent = score;
        if(quizTotalEl && currentQuizSet) quizTotalEl.textContent = currentQuizSet.length;

        quizActive = false; // Marca el quiz como inactivo

        // Determina si la ronda que acaba de terminar fue la ronda principal (no un reintento de falladas)
        const wasMainQuizRound = (currentQuizSet === allQuizQuestions);

        // Muestra el botón "Reintentar Falladas" solo si hay preguntas falladas Y si la ronda actual fue la principal
        if (missedQuestions.length > 0 && wasMainQuizRound && retryMissedQuizBtn) {
            retryMissedQuizBtn.style.display = 'inline-block';
        } else if(retryMissedQuizBtn) {
            retryMissedQuizBtn.style.display = 'none'; // Oculta el botón si no aplica
        }
    }

    // Resetea completamente la vista y el estado del Quiz
    function resetQuizView() {
        quizActive = false; // Marca quiz como inactivo
        allQuizQuestions = []; // Limpia sets de preguntas
        currentQuizSet = [];
        missedQuestions = []; // Limpia preguntas falladas
        score = 0; // Resetea puntuación
        currentQuestionIndex = 0; // Resetea índice de pregunta

        // Muestra el área de setup y oculta las otras áreas del juego
        if(quizSetup) quizSetup.style.display = 'block';
        if(quizQuestionArea) quizQuestionArea.style.display = 'none';
        if(quizResultsEl) quizResultsEl.style.display = 'none';
        if(retryMissedQuizBtn) retryMissedQuizBtn.style.display = 'none';

        // --- RESET CATEGORY SELECT & ERROR MESSAGE ---
        if(quizCategorySelect) {
            // Si el selector ya fue poblado, lo resetea a la opción 'all'
             if(quizCategorySelect.options.length > 0) {
                 quizCategorySelect.value = 'all';
             }
             // Si no fue poblado aún (e.g., si loadData falló o lexiconData estaba vacío),
             // intenta poblarlo ahora si hay datos disponibles.
             // Esto es un fallback, normalmente initializeApplication lo hace al inicio.
             if(lexiconData.length > 0 && quizCategorySelect.options.length === 0) {
                  const uniqueCategories = getUniqueCategories(lexiconData);
                  populateCategorySelect(quizCategorySelect, uniqueCategories);
             }
             // Si después de intentar poblar sigue vacío, deshabilitar el selector
             if (quizCategorySelect.options.length <= 1) {
                quizCategorySelect.disabled = true;
             } else {
                quizCategorySelect.disabled = false;
             }
        }
        if(quizDataErrorEl) quizDataErrorEl.style.display = 'none'; // Oculta mensaje de error específico del Quiz
        // ---------------------------------------------

        // Limpia los contenidos dinámicos de la UI
        if(quizImageContainer) quizImageContainer.innerHTML = '';
        if(quizFeedbackEl) { quizFeedbackEl.textContent = ''; quizFeedbackEl.className = ''; }
        if(quizOptionsEl) quizOptionsEl.innerHTML = '';
        if(quizTextInputArea) quizTextInputArea.style.display = 'none';
        if(quizTextAnswerInput) { quizTextAnswerInput.value = ''; quizTextAnswerInput.className = ''; }
        if(quizQuestionEl) quizQuestionEl.textContent = '';

        // Resetea el selector de número de preguntas a un valor por defecto (opcional)
        if(quizLengthSelect) quizLengthSelect.value = "5";

        console.log("[Quiz] Vista reseteada.");
    }

    // Configura los event listeners para los controles del Quiz
    function setupQuizControls() {
        // Verifica que los elementos DOM esenciales existan
        if (!startQuizBtn || !nextQuestionBtn || !restartQuizBtn || !retryMissedQuizBtn || !submitTextAnswerBtn || !quizTextAnswerInput || !quizLengthSelect || !quizCategorySelect) {
            console.error("[Quiz Error] Faltan elementos HTML esenciales para controles del Quiz. Verifica IDs: #start-quiz, #next-question, #restart-quiz, #retry-missed-quiz, #submit-text-answer, #quiz-text-answer, #quiz-length, #quiz-category.");
             // Opcional: Mostrar un mensaje de error al usuario si faltan controles
             if (errorMessageEl) { // Usando el error general para elementos faltantes
                 errorMessageEl.textContent = "Error: Algunos controles del Quiz no se encontraron en el HTML. Consulta la consola (F12).";
                 errorMessageEl.style.display = 'block';
             }
            return; // Sale si faltan elementos
        }
        console.log("[Quiz] Configurando controles.");

        // Listeners para los botones principales del Quiz
        startQuizBtn.addEventListener('click', () => startQuiz(false)); // Empezar un nuevo quiz (no reintento)
        nextQuestionBtn.addEventListener('click', goToNextQuestion); // Pasar a la siguiente pregunta
        restartQuizBtn.addEventListener('click', resetQuizView); // Reiniciar quiz completamente
        retryMissedQuizBtn.addEventListener('click', () => startQuiz(true)); // Reintentar preguntas falladas
        submitTextAnswerBtn.addEventListener('click', handleTextAnswer); // Enviar respuesta de texto

        // Listener para la tecla Enter en el input de texto
        quizTextAnswerInput.addEventListener('keypress', function (e) {
            // Si la tecla presionada es Enter (key 13) y el botón de submit no está deshabilitado
            if (e.key === 'Enter' && !submitTextAnswerBtn.disabled) {
                handleTextAnswer(); // Llama a la función para manejar la respuesta de texto
            }
        });

        // --- NUEVO: Listener para el selector de categoría ---
        quizCategorySelect.addEventListener('change', () => {
            console.log("[Quiz] Categoría seleccionada cambiada. Reseteando vista del Quiz.");
            // Cuando cambia la categoría, resetea la vista del quiz al estado de setup.
            // El próximo quiz iniciado con startQuizBtn usará la nueva categoría seleccionada.
            resetQuizView();
        });
        // ---------------------------------------------------
    }
    // =============================================
    // ========= FIN SECCIÓN QUIZ ==================
    // =============================================


    // =============================================
    // ========= SECCIÓN FLASHCARDS (con filtro) ===
    // =============================================

    // Prepara los datos (items de léxico) para las Flashcards, filtrando por categoría seleccionada
    function prepareFlashcardData() {
        // Muestra mensaje de carga y oculta áreas de tarjeta y errores al iniciar la preparación
        if (flashcardsLoadingEl) flashcardsLoadingEl.style.display = 'block';
        if (flashcardAreaEl) flashcardAreaEl.style.display = 'none'; // Oculta el área de la tarjeta
        if (flashcardsErrorEl) flashcardsErrorEl.style.display = 'none'; // Oculta error general
        if (flashcardsDataErrorEl) flashcardsDataErrorEl.style.display = 'none'; // Oculta error específico de categoría

        // Obtiene la categoría seleccionada del selector de categoría de Flashcards
        const selectedCategory = flashcardCategorySelect ? flashcardCategorySelect.value : 'all';
        console.log(`[Flashcards] Preparing cards for category: "${selectedCategory}"`);

        // 1. Filtrar items del léxico por la categoría seleccionada
        // Las flashcards necesitan tener al menos rarámuri Y (español O imagen), Y opcionalmente coincidir con la categoría
        const categoryFilteredLexicon = lexiconData.filter(item =>
            item && item.id != null && item.raramuri && (item.spanish || item.image) && // Validez básica (item completo)
            (selectedCategory === 'all' || (item.category && item.category === selectedCategory)) // Filtro por categoría (verifica que item.category exista)
        );

        console.log(`[Flashcards] Items válidos para categoría "${selectedCategory}": ${categoryFilteredLexicon.length}`);

        // Verifica si hay suficientes items para la categoría seleccionada (al menos 1)
        if (categoryFilteredLexicon.length === 0) {
             console.warn(`[Flashcards] No hay datos disponibles para la categoría "${selectedCategory}".`);
             // Muestra el mensaje de error específico para la categoría seleccionada
             if (flashcardsDataErrorEl) {
                 const categoryDisplayName = selectedCategory === 'all' ? 'todas las categorías' : `la categoría "${selectedCategory}"`;
                 flashcardsDataErrorEl.textContent = `No hay datos disponibles para ${categoryDisplayName}.`;
                 flashcardsDataErrorEl.style.display = 'block';
             }
             if (flashcardsLoadingEl) flashcardsLoadingEl.style.display = 'none'; // Oculta el mensaje de carga
             flashcardData = []; // Asegura que el array de datos de flashcards esté vacío
             // El área de la tarjeta y los controles están ocultos al inicio de la función
             return false; // Indica que la preparación de datos falló
        }

        // Si hay datos, oculta el mensaje de error específico de categoría
        if (flashcardsDataErrorEl) flashcardsDataErrorEl.style.display = 'none';

        // Baraja los items filtrados y los almacena para su uso en las flashcards
        flashcardData = shuffleArray([...categoryFilteredLexicon]);
        currentFlashcardIndex = 0; // Reinicia el índice a la primera tarjeta (0)
        isFlashcardFlipped = false; // Asegura que la primera tarjeta inicie sin voltear

        // Oculta mensaje de carga y muestra el área de la tarjeta (ya con datos)
        if (flashcardsLoadingEl) flashcardsLoadingEl.style.display = 'none';
        if (flashcardAreaEl) flashcardAreaEl.style.display = 'block'; // Muestra el área de la tarjeta

        return true; // Indica que los datos se prepararon exitosamente
    }

    // Muestra la tarjeta actual en la UI de Flashcards
     function displayCurrentFlashcard() {
        // Sale si no hay datos de flashcards o el área de visualización está oculta
        if (!flashcardData || flashcardData.length === 0 || !flashcardAreaEl || flashcardAreaEl.style.display === 'none') {
             console.log("[Flashcards] No flashcard data to display or display area not visible.");
             // Asegura que el contador también se oculte si no hay tarjetas
             if (flashcardCounterEl) flashcardCounterEl.textContent = '';
             return;
        }
        // Asegura que el índice actual sea válido; si no, lo resetea a 0
        if (currentFlashcardIndex < 0 || currentFlashcardIndex >= flashcardData.length) {
             console.error(`[Flashcards] Invalid current index: ${currentFlashcardIndex}. Resetting to 0.`);
             currentFlashcardIndex = 0; // Resetea índice para prevenir errores

             // Verifica nuevamente si hay datos en el índice 0 después del reset
             if (!flashcardData[currentFlashcardIndex]) {
                 console.error("[Flashcards] Data missing even at index 0 after reset.");
                 // Muestra un error si aún hay problemas para obtener datos
                  if (flashcardsErrorEl) { flashcardsErrorEl.textContent = 'Error al mostrar tarjeta. Datos faltantes.'; flashcardsErrorEl.style.display = 'block'; }
                  if (flashcardAreaEl) flashcardAreaEl.style.display = 'none'; // Oculta el área si no se puede mostrar la tarjeta
                 return;
             }
        }
        // Obtiene los datos de la tarjeta actual
        const cardData = flashcardData[currentFlashcardIndex];

        // Asegura que el elemento de la tarjeta no esté volteado al mostrar una nueva tarjeta
        if (flashcardEl) flashcardEl.classList.remove('flipped');
        isFlashcardFlipped = false; // Actualiza la variable de estado

        // Rellena la cara frontal (Español o Imagen)
        if (flashcardFrontEl) {
             flashcardFrontEl.innerHTML = ''; // Limpia contenido anterior
            if (cardData.image) {
                // Si hay imagen, crea el elemento <img> y lo añade
                const img = document.createElement('img');
                img.src = cardData.image;
                img.alt = cardData.spanish || 'Flashcard Image'; // Alt text desde la palabra en español
                img.loading = 'lazy'; // Habilita lazy loading
                img.onerror = function() { // Manejo de error si la imagen falla
                    console.error(`[Flashcards] Image failed to load: ${this.src}`);
                    this.alt = 'Error al cargar imagen';
                    this.src='images/placeholder.png'; // Usa un placeholder
                };
                flashcardFrontEl.appendChild(img);
                // Nota: El texto en español *no* se muestra debajo de la imagen en el diseño actual basado en CSS/HTML.
                // Si quisieras texto E imagen, necesitarías añadir un <p> aquí.
            } else if (cardData.spanish) {
                 // Si no hay imagen pero sí texto en español, muestra el texto
                 flashcardFrontEl.textContent = cardData.spanish;
            }
            else { // Fallback si no existe ni imagen ni texto en español (raro con la lógica de prepare)
                 flashcardFrontEl.textContent = '???';
            }
        }

        // Rellena la cara trasera (Rarámuri)
        if (flashcardBackEl) {
             flashcardBackEl.textContent = cardData.raramuri || '???'; // Muestra texto en Rarámuri ('???' si falta)
        }

        // Actualiza el texto del contador de tarjetas
        if (flashcardCounterEl) {
             flashcardCounterEl.textContent = `Tarjeta ${currentFlashcardIndex + 1} de ${flashcardData.length}`;
        }
    }

    // Voltea la tarjeta actual
    function flipFlashcard() {
        if (!flashcardEl) return; // Verifica si el elemento de la tarjeta existe
        flashcardEl.classList.toggle('flipped'); // Alterna la clase 'flipped' para la animación CSS
        isFlashcardFlipped = !isFlashcardFlipped; // Actualiza la variable de estado
    }

    // Pasa a la siguiente tarjeta
    function nextFlashcard() {
        if (!flashcardData || flashcardData.length === 0) return; // Necesita datos para navegar
        currentFlashcardIndex++; // Incrementa el índice
        // Si llega al final, vuelve al principio
        if (currentFlashcardIndex >= flashcardData.length) {
            currentFlashcardIndex = 0;
        }
        displayCurrentFlashcard(); // Muestra la nueva tarjeta actual
    }

    // Pasa a la tarjeta anterior
    function prevFlashcard() {
        if (!flashcardData || flashcardData.length === 0) return; // Necesita datos para navegar
        currentFlashcardIndex--; // Decrementa el índice
        // Si llega al principio, vuelve al final
        if (currentFlashcardIndex < 0) {
            currentFlashcardIndex = flashcardData.length - 1;
        }
        displayCurrentFlashcard(); // Muestra la nueva tarjeta actual
    }

     // Baraja las tarjetas (re-prepara y baraja los datos)
     function shuffleFlashcards() {
         console.log("[Flashcards] Shuffling cards...");
         // Prepara los datos de nuevo (lo cual también los baraja)
         // prepareFlashcardData ya usa la categoría seleccionada actualmente
         if (prepareFlashcardData()) {
              // Si los datos se prepararon exitosamente, muestra la primera tarjeta (índice 0)
              displayCurrentFlashcard();
         } else {
             // Si prepareFlashcardData retorna false (no hay datos para la categoría),
             // ya mostró el mensaje de error específico y ocultó el área de la tarjeta.
         }
     }

    // Configura los event listeners para los controles de Flashcards
    function setupFlashcardsControls() {
        // Verifica que los elementos DOM esenciales existan
        if (!flashcardEl || !prevFlashcardBtn || !flipFlashcardBtn || !nextFlashcardBtn || !shuffleFlashcardsBtn || !flashcardCategorySelect || !flashcardsSetupControls || !flashcardsDataErrorEl) {
             console.error("Missing essential Flashcard control elements. Check IDs: #flashcard, #prev-flashcard-btn, #flip-flashcard-btn, #next-flashcard-btn, #shuffle-flashcards-btn, #flashcard-category, #flashcards-setup-controls, #flashcards-data-error.");
             // Si faltan elementos, muestra un error general
             if (flashcardsErrorEl) {
                 flashcardsErrorEl.textContent = "Error: Algunos controles de Flashcards no se encontraron en el HTML. Consulta la consola (F12).";
                 flashcardsErrorEl.style.display = 'block';
             }
             // Oculta el setup si faltan elementos esenciales para él
             if(flashcardsSetupControls) flashcardsSetupControls.style.display = 'none';
             return; // Sale si faltan elementos
        }
        console.log("[Flashcards] Configurando controles.");

        // Listeners para los botones principales de Flashcards
        flashcardEl.addEventListener('click', flipFlashcard); // Clic en la tarjeta misma la voltea
        flipFlashcardBtn.addEventListener('click', flipFlashcard); // Botón "Voltear"
        nextFlashcardBtn.addEventListener('click', nextFlashcard); // Botón "Siguiente"
        prevFlashcardBtn.addEventListener('click', prevFlashcard); // Botón "Anterior"
        shuffleFlashcardsBtn.addEventListener('click', shuffleFlashcards); // Botón "Barajar"

        // --- NUEVO: Listener para el selector de categoría ---
        flashcardCategorySelect.addEventListener('change', () => {
            console.log("[Flashcards] Categoría seleccionada cambiada. Recargando tarjetas.");
            // Cuando cambia la categoría, prepara los datos para la nueva categoría
            // prepareFlashcardData ya lee el valor del selector internamente
            const dataPrepared = prepareFlashcardData();

            // Si los datos se prepararon exitosamente (hay tarjetas para la categoría)
            if (dataPrepared) {
                 displayCurrentFlashcard(); // Muestra la primera tarjeta del nuevo set
            } else {
                // Si prepareFlashcardData retornó false (no hay datos para la categoría),
                // ya mostró el mensaje de error específico y ocultó el área de la tarjeta.
            }
        });
        // ---------------------------------------------------
    }

     // Inicializa la vista de Flashcards cuando se navega a esa sección
     function initializeFlashcardsView() {
         console.log("[Flashcards] Initializing view...");

         // Verifica si los selectores de categoría necesitan ser poblados (solo si hay datos léxicos y no están ya poblados)
         // Esto se hace en initializeApplication al inicio, pero lo re-verificamos aquí.
         if(lexiconData.length > 0 && flashcardCategorySelect && flashcardCategorySelect.options.length <= 1) { // <= 1 porque 'all' ya cuenta
              const uniqueCategories = getUniqueCategories(lexiconData);
              populateCategorySelect(flashcardCategorySelect, uniqueCategories);
         }
         // Si no hay datos léxicos cargados en absoluto
         else if (lexiconData.length === 0) {
              console.warn("[Flashcards] No lexicon data available. Cannot initialize flashcards.");
              // Asegura que los selectores estén deshabilitados y el mensaje de error visible
               if(flashcardCategorySelect) flashcardCategorySelect.disabled = true;
               if(flashcardsSetupControls) flashcardsSetupControls.style.display = 'block'; // Asegura que el área de setup esté visible
               if (flashcardsDataErrorEl) {
                   flashcardsDataErrorEl.textContent = 'No hay datos léxicos disponibles para Flashcards.';
                   flashcardsDataErrorEl.style.display = 'block';
               }
               // Asegura que el área de tarjetas y carga estén ocultas
               if (flashcardsLoadingEl) flashcardsLoadingEl.style.display = 'none';
               if (flashcardAreaEl) flashcardAreaEl.style.display = 'none';
               return; // Detiene la inicialización si no hay datos léxicos
         }

         // Prepara los datos de flashcard basándose en la categoría actualmente seleccionada (por defecto 'all')
         // Esta función llena flashcardData y resetea currentFlashcardIndex a 0.
         const dataPrepared = prepareFlashcardData();

         // Si los datos se prepararon exitosamente (prepareFlashcardData retornó true)
         if(dataPrepared){
              displayCurrentFlashcard(); // Muestra la primera tarjeta del set preparado
         } else {
              // Si prepareFlashcardData retornó false (e.g., no hay items para la categoría seleccionada),
              // ya manejó la visualización de errores y ocultó el área de tarjetas.
         }
     }
    // =============================================
    // ========= FIN SECCIÓN FLASHCARDS ============
    // =============================================


    // --- Initialization Application ---
    // Función principal que inicia toda la aplicación después de cargar los datos
    function initializeApplication() {
        // Verifica que todos los elementos DOM esenciales existan.
        // Esto es crucial para evitar errores de "Cannot read properties of null" al iniciar.
        if (!mainContentEl || !navButtons || !contentSections || !lexiconGrid || !phrasesList || !memoramaGrid || !quizContainer || !flashcardsContainer || !categoryFiltersContainer || !quizCategorySelect || !flashcardCategorySelect || !flashcardsSetupControls || !flashcardsDataErrorEl || !quizDataErrorEl) {
            console.error("Critical Error: Missing essential HTML elements. Ensure all required IDs are present in index.html:",
                "#main-content, nav buttons, .content-section, #lexicon-grid, #phrases-list, #memorama-grid, #quiz-container, #flashcards-container, #category-filters, #quiz-category, #flashcard-category, #flashcards-setup-controls, #flashcards-data-error, #quiz-data-error.");
            if(errorMessageEl) {
                 errorMessageEl.textContent = "Error crítico al iniciar: Algunos elementos de la página no se encontraron en el HTML. Consulta la consola (F12).";
                 errorMessageEl.style.display = 'block';
            }
            if(loadingMessageEl) loadingMessageEl.style.display = 'none';
            if(mainContentEl) mainContentEl.style.display = 'none'; // Oculta contenido si no es utilizable
            return; // Detiene la ejecución si hay errores críticos
        }
        console.log("HTML elements check passed. Initializing application modules...");

        // Configura los listeners para la navegación entre secciones
        setupNavigation();

        // Configura la sección de Frases (popula la lista)
        populatePhrases();

        // Configura la sección de Léxico (búsqueda y botones de filtro de categoría)
        setupSearch(); // Configura input de búsqueda
        populateCategoryFilters(); // Popula los botones de filtro de Léxico
        filterAndDisplayLexicon(); // Muestra el léxico inicial (usando filtro por defecto 'all' y sin búsqueda)

        // --- NUEVO: Poblar los selectores de categoría para Quiz y Flashcards ---
        // Solo intenta poblar si hay datos léxicos disponibles
        if(lexiconData.length > 0) {
            const uniqueCategories = getUniqueCategories(lexiconData); // Obtiene categorías únicas (sin 'all')
            populateCategorySelect(quizCategorySelect, uniqueCategories); // Popula selector de Quiz
            populateCategorySelect(flashcardCategorySelect, uniqueCategories); // Popula selector de Flashcards

            // Asegura que los selectores estén habilitados si se pudieron poblar
             if(quizCategorySelect) quizCategorySelect.disabled = false;
             if(flashcardCategorySelect) flashcardCategorySelect.disabled = false;

        } else {
             console.warn("No lexicon data available. Category selects for Quiz/Flashcards are disabled.");
             // Si no hay datos léxicos, deshabilita los selectores y muestra un mensaje de error específico para los juegos
             if(quizCategorySelect) quizCategorySelect.disabled = true;
             if(flashcardCategorySelect) flashcardCategorySelect.disabled = true;
             if(flashcardsSetupControls) flashcardsSetupControls.style.display = 'block'; // Asegura que el setup de Flashcards sea visible
             if (flashcardsDataErrorEl) { // Usa el error específico de Flashcards
                 flashcardsDataErrorEl.textContent = 'No hay datos léxicos disponibles para Flashcards o Quiz.';
                 flashcardsDataErrorEl.style.display = 'block';
             }
              if(quizDataErrorEl) { // Usa el error específico de Quiz
                 quizDataErrorEl.textContent = 'No hay datos léxicos disponibles para Quiz o Flashcards.';
                 quizDataErrorEl.style.display = 'block';
              }
        }
        // ------------------------------------------------------------------

        // Configura los event listeners para los controles de los juegos
        setupMemoramaControls(); // Configura controles de Memorama
        setupQuizControls(); // Configura controles de Quiz (incluye listener de cambio de categoría)
        setupFlashcardsControls(); // Configura controles de Flashcards (incluye listener de cambio de categoría)

        // Nota: La vista inicial de Flashcards (cargar tarjetas) se maneja al navegar a esa sección (initializeFlashcardsView)
        // El Quiz inicia mostrando su área de setup por defecto.

        console.log("Aplicación inicializada correctamente.");
    }

    // --- Punto de Entrada ---
    // Inicia el proceso de carga de datos cuando el DOM está listo
    loadData();

}); // Fin del evento DOMContentLoaded
