// script.js (Final, Complete, Verified - Includes Memorama Category Selector)

document.addEventListener('DOMContentLoaded', () => {

    // --- DECLARACIÓN DE VARIABLES PARA DATOS ---
    let lexiconData = []; // Almacenará los datos del léxico de data.json
    let phrasesData = []; // Almacenará los datos de frases de data.json
    let currentCategoryFilter = 'all'; // Variable para el filtro de categoría de la sección Léxico

    // --- MAPEO DE ICONOS PARA CATEGORÍAS ---
    // Objeto que asocia nombres de categoría con emojis para visualización
    const categoryIcons = {
        'Naturaleza': '🌳',
        'Comida y bebida': '🍎',
        'Verbos': '🏃‍♂️',
        'Animales': '🐾',
        'Partes del cuerpo': '🖐️',
        'Objetos': '🔨',
        'Personas': '🧍‍♀️',
        'Vestimenta': '🧦',
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
    const memoramaCategorySelect = document.getElementById('memorama-category'); // *** NUEVO: Selector de categoría Memorama ***
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
    const quizCategorySelect = document.getElementById('quiz-category');     // Selector de categoría del Quiz
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
    const flashcardsSetupControls = document.getElementById('flashcards-setup-controls'); // Contenedor setup Flashcards
    const flashcardCategorySelect = document.getElementById('flashcard-category'); // Selector de categoría Flashcards
    const flashcardsDataErrorEl = document.getElementById('flashcards-data-error'); // Mensaje de error Flashcards
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
            loadingMessageEl.style.display = 'block';
            errorMessageEl.style.display = 'none';
            mainContentEl.style.display = 'none';

            const response = await fetch('data.json', { cache: 'no-cache' });
            if (!response.ok) {
                throw new Error(`Error HTTP al cargar data.json: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();

            if (!data || typeof data !== 'object' || !Array.isArray(data.lexicon) || !Array.isArray(data.phrases)) {
                throw new Error("El archivo data.json no tiene el formato esperado (debe contener arrays 'lexicon' y 'phrases').");
            }

            lexiconData = data.lexicon;
            phrasesData = data.phrases;
            console.log("Datos cargados exitosamente:", { lexicon: lexiconData.length, phrases: phrasesData.length });

            loadingMessageEl.style.display = 'none';
            mainContentEl.style.display = 'block';
            errorMessageEl.style.display = 'none';

            initializeApplication();

        } catch (error) {
            console.error("Error al cargar/procesar datos:", error);
            loadingMessageEl.style.display = 'none';
            errorMessageEl.textContent = `Error cargando datos: ${error.message}. Verifica data.json y la consola (F12) para más detalles.`;
            errorMessageEl.style.display = 'block';
            mainContentEl.style.display = 'none';
        }
    }


    // --- FUNCIONES GENERALES DE LA APLICACIÓN ---

    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    function normalizeAnswer(text) {
         return text ? String(text).toLowerCase().trim() : '';
    }

    function setupNavigation() {
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const sectionId = button.getAttribute('data-section');
                contentSections.forEach(section => section.classList.remove('active'));
                navButtons.forEach(btn => btn.classList.remove('active'));

                const currentSection = document.getElementById(sectionId);
                if (currentSection) currentSection.classList.add('active');
                else console.error(`Section ${sectionId} not found.`);
                button.classList.add('active');

                if (sectionId === 'memorama') {
                    resetMemoramaView();
                } else if (sectionId === 'quiz') {
                    resetQuizView();
                } else if (sectionId === 'flashcards') {
                    initializeFlashcardsView();
                }
            });
        });
        const aboutButton = document.querySelector('nav button[data-section="about"]');
        const aboutSection = document.getElementById('about');
        if (aboutButton && aboutSection) {
            aboutButton.classList.add('active');
            aboutSection.classList.add('active');
        } else if (navButtons.length > 0 && contentSections.length > 0) {
            navButtons[0].classList.add('active');
            contentSections[0].classList.add('active');
        }
    }

    function populateCategorySelect(selectElement, categories) {
         if (!selectElement || !categories) { console.warn("Selector o categorías no disponibles para poblar."); return; }
         selectElement.innerHTML = '';

         const allOption = document.createElement('option');
         allOption.value = 'all';
         allOption.textContent = 'Todas las categorías';
         selectElement.appendChild(allOption);

         categories.filter(cat => cat !== 'all').forEach(category => {
             const option = document.createElement('option');
             option.value = category;
             option.textContent = category;
             selectElement.appendChild(option);
         });
         console.log(`Selector ${selectElement.id} poblado con ${selectElement.options.length} opciones.`);
    }


    // =============================================
    // ========= SECCIÓN LÉXICO (con filtros/iconos) =
    // =============================================

    function getUniqueCategories(data) {
        const categories = new Set();
        data.forEach(item => {
            if (item.category && item.category.trim() !== '') {
                categories.add(item.category.trim());
            }
        });
        return Array.from(categories).sort();
    }

    function populateCategoryFilters() {
        if (!categoryFiltersContainer || !lexiconData) {
            console.warn("Lexicon filter container or lexicon data not available.");
            if(categoryFiltersContainer) categoryFiltersContainer.innerHTML = '';
            return;
        }

        const uniqueCategories = getUniqueCategories(lexiconData);
        const categoriesForButtons = ['all', ...uniqueCategories];

        categoryFiltersContainer.innerHTML = '';

        if (categoriesForButtons.length <= 1) {
             console.log("No categories defined in data.json to show Lexicon filters.");
             categoryFiltersContainer.style.display = 'none';
             return;
        }
         categoryFiltersContainer.style.display = 'flex';

        categoriesForButtons.forEach(category => {
            const button = document.createElement('button');
            const categoryName = category === 'all' ? 'Todos' : category;
            let icon = category === 'all' ? (categoryIcons['all'] || '') : (categoryIcons[category] || defaultCategoryIcon);
            button.textContent = icon ? `${icon} ${categoryName}` : categoryName;
            button.dataset.category = category;
            button.classList.add('category-filter-btn');

            if (category === currentCategoryFilter) {
                button.classList.add('active');
            }

            button.addEventListener('click', handleCategoryFilterClick);
            categoryFiltersContainer.appendChild(button);
        });
    }

    function handleCategoryFilterClick(event) {
        currentCategoryFilter = event.target.dataset.category;
        document.querySelectorAll('.category-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        filterAndDisplayLexicon();
    }

    function displayLexiconItems(itemsToShow) {
        if (!lexiconGrid) return;
        lexiconGrid.innerHTML = '';

        if (!itemsToShow || itemsToShow.length === 0) {
             const isFiltered = (lexiconSearchInput && lexiconSearchInput.value) || currentCategoryFilter !== 'all';
             const message = isFiltered
                          ? 'No se encontraron coincidencias para los filtros aplicados.'
                          : 'No hay datos léxicos para mostrar.';
            lexiconGrid.innerHTML = `<p class="text-center text-secondary" style="grid-column: 1 / -1;">${message}</p>`;
            return;
        }

        itemsToShow.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('lexicon-item');
            const imgSrc = item.image || 'images/placeholder.png';
            const spanishText = item.spanish || '???';
            const raramuriText = item.raramuri || '???';

            div.innerHTML = `
                <img src="${imgSrc}" alt="${spanishText || raramuriText}" loading="lazy" onerror="this.onerror=null; this.src='images/placeholder.png'; this.alt='Error al cargar: ${raramuriText}';">
                <p class="raramuri-word">${raramuriText}</p>
                <p class="spanish-word">${spanishText}</p>`;
            lexiconGrid.appendChild(div);
        });
    }

    function filterAndDisplayLexicon() {
        if (!lexiconData) return;

        const searchTerm = lexiconSearchInput ? lexiconSearchInput.value.toLowerCase().trim() : '';
        let filteredItems = lexiconData;

        // 1. Filter by Category
        if (currentCategoryFilter !== 'all') {
            filteredItems = filteredItems.filter(item => item.category && item.category === currentCategoryFilter);
        }

        // 2. Filter by Search Term
        if (searchTerm) {
            filteredItems = filteredItems.filter(item =>
                ((item.raramuri ? item.raramuri.toLowerCase() : '').includes(searchTerm) ||
                 (item.spanish ? item.spanish.toLowerCase() : '').includes(searchTerm))
            );
        }

        displayLexiconItems(filteredItems);
    }

    function setupSearch() {
        if (lexiconSearchInput) {
            lexiconSearchInput.addEventListener('input', filterAndDisplayLexicon);
        } else {
            console.error("Elemento #lexicon-search no encontrado.");
        }
    }
    // =============================================
    // ========= FIN SECCIÓN LÉXICO ================
    // =============================================


    // -- Frases --
     function populatePhrases() {
        if (!phrasesList) return;
        phrasesList.innerHTML = '';

        if (!phrasesData || phrasesData.length === 0) {
            phrasesList.innerHTML = '<li class="text-secondary">No hay frases disponibles.</li>';
            return;
        }

        phrasesData.forEach(phrase => {
            if (phrase.raramuri && phrase.spanish) {
                const li = document.createElement('li');
                li.innerHTML = `<span class="raramuri-phrase">${phrase.raramuri}</span><span class="spanish-phrase">${phrase.spanish}</span>`;
                phrasesList.appendChild(li);
            }
        });
    }


    // =======================================================
    // ========= SECCIÓN MEMORAMA (con filtro categoría) =====
    // =======================================================

    // Reinicia la vista y el estado del juego Memorama
    function resetMemoramaView() {
        console.log("[Memorama] Reseteando Vista");
        if (memoramaSetup) memoramaSetup.style.display = 'block';
        if (memoramaGameArea) memoramaGameArea.style.display = 'none';
        if (memoramaWinMessage) memoramaWinMessage.style.display = 'none';
        if (memoramaDataErrorEl) memoramaDataErrorEl.style.display = 'none'; // Oculta el error específico
        if (memoramaGrid) memoramaGrid.innerHTML = '';

        // *** NUEVO: Resetear el selector de categoría a 'all' ***
        if (memoramaCategorySelect) memoramaCategorySelect.value = 'all';

        difficultyButtons.forEach(btn => btn.classList.remove('selected'));

        memoramaActive = false;
        mCards = [];
        mFlippedElements = [];
        mMatchedPairsCount = 0;
        mTotalPairs = 0;
        mAttempts = 0;
        mLockBoard = false;
        if (memoramaAttemptsEl) memoramaAttemptsEl.textContent = '0';
    }

    // Crea el contenido para la cara frontal de una tarjeta de Memorama
    function createMemoramaFaceContent(cardInfo, faceElement) {
        if (!cardInfo || !faceElement) {
            console.error("[Memorama Critico] Faltan parámetros en createMemoramaFaceContent"); return;
        }
        faceElement.innerHTML = '';

        try {
            if (cardInfo.type === 'image' && cardInfo.value) {
                const img = document.createElement('img');
                img.src = cardInfo.value;
                img.alt = cardInfo.altText || "Imagen Memorama";
                img.loading = 'lazy';
                img.onerror = function() {
                    console.error(`[Memorama Critical] Falló carga IMG: ${this.src} (ID: ${cardInfo.id})`);
                    this.style.display = 'none';
                    const errorP = document.createElement('p'); errorP.textContent = 'Error Img!'; errorP.style.color = 'red'; errorP.style.fontSize = '10px';
                    faceElement.appendChild(errorP);
                };
                faceElement.appendChild(img);
            }
            else if (cardInfo.type === 'text' && cardInfo.value) {
                const textP = document.createElement('p');
                textP.textContent = cardInfo.value;
                faceElement.appendChild(textP);
            }
            else {
                console.warn(`[Memorama Warn] Contenido inválido (ID: ${cardInfo.id}):`, cardInfo);
                const fallbackP = document.createElement('p'); fallbackP.textContent = '??'; fallbackP.style.opacity = '0.5';
                faceElement.appendChild(fallbackP);
            }
        } catch (e) {
            console.error("[Memorama Critico] Excepción en createMemoramaFaceContent:", e, cardInfo);
            try { faceElement.innerHTML = '<p style="color:red; font-size:10px;">Error JS!</p>'; } catch (fe) {}
        }
    }

    // Prepara los datos (items de léxico) para el juego Memorama
    // *** MODIFICADO: Acepta y usa selectedCategory ***
    function prepareCardData(requestedPairs, selectedCategory = 'all') {
        console.log(`[Memorama] Preparing data for ${requestedPairs} pairs, category: "${selectedCategory}"`);

        // 1. Filtrar base: items válidos para Memorama
        let validItemsBase = lexiconData.filter(item =>
            item && item.id != null && item.image && item.raramuri && item.spanish
        );

        // 2. Filtrar ADICIONALMENTE por categoría
        let categoryFilteredItems = validItemsBase;
        if (selectedCategory !== 'all') {
            categoryFilteredItems = validItemsBase.filter(item => item.category && item.category === selectedCategory);
        }
        console.log(`[Memorama] Found ${categoryFilteredItems.length} valid items after category filter.`);

        // 3. Verificar si hay suficientes items DESPUÉS del filtro de categoría
        if (categoryFilteredItems.length < requestedPairs) {
            console.warn(`[Memorama] Datos insuficientes: ${categoryFilteredItems.length} items válidos en categoría "${selectedCategory}", se necesitan ${requestedPairs} pares.`);
            if (memoramaDataErrorEl) {
                const categoryDisplayName = selectedCategory === 'all' ? 'todas las categorías' : `la categoría "${selectedCategory}"`;
                memoramaDataErrorEl.textContent = `Datos insuficientes (${categoryFilteredItems.length}) con imagen para ${requestedPairs} pares en ${categoryDisplayName}. Añade más entradas o elige otra categoría/dificultad.`;
                memoramaDataErrorEl.style.display = 'block';
            }
             if (memoramaGameArea) memoramaGameArea.style.display = 'none';
             if (memoramaSetup) memoramaSetup.style.display = 'block';
             difficultyButtons.forEach(btn => btn.classList.remove('selected')); // Deseleccionar dificultad
            return null;
        } else {
             if (memoramaDataErrorEl) memoramaDataErrorEl.style.display = 'none'; // Ocultar error si hay datos
        }

        // 4. Barajar y seleccionar items finales
        const shuffledValidItems = shuffleArray(categoryFilteredItems);
        const itemsForGame = shuffledValidItems.slice(0, requestedPairs);

        return itemsForGame;
    }

    // Construye el grid de cartas en el DOM para el Memorama
    function buildMemoramaGrid() {
        if (!memoramaGrid) { console.error("[Memorama Error] #memorama-grid no encontrado."); return; }
        memoramaGrid.innerHTML = '';

        mCards.forEach((cardData, index) => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('memorama-card');
            if (cardData.id === undefined || cardData.id === null) {
                console.error(`[Memorama Error] ID indefinido carta ${index}`, cardData); return;
            }
            cardElement.dataset.id = cardData.id;
            cardElement.dataset.index = index;

            const frontFace = document.createElement('div');
            frontFace.classList.add('card-face', 'card-front');
            createMemoramaFaceContent(cardData, frontFace);

            const backFace = document.createElement('div');
            backFace.classList.add('card-face', 'card-back');

            cardElement.appendChild(frontFace);
            cardElement.appendChild(backFace);
            cardElement.addEventListener('click', handleMemoramaCardClick);
            memoramaGrid.appendChild(cardElement);
        });

        let columns = Math.ceil(Math.sqrt(mCards.length));
        columns = Math.max(2, Math.min(columns, 5));
        memoramaGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        console.log(`[Memorama] Grid construido con ${columns} columnas.`);
    }

    // Inicia una nueva partida de Memorama
    // *** MODIFICADO: Lee y pasa la categoría seleccionada ***
    function startMemorama(numPairs) {
        const selectedCategory = memoramaCategorySelect ? memoramaCategorySelect.value : 'all';
        console.log(`[Memorama] Iniciando startMemorama con ${numPairs} pares para categoría "${selectedCategory}".`);

        resetMemoramaView(); // Limpia vista y estado

        // *** MODIFICADO: Pasa la categoría a prepareCardData ***
        const itemsForGame = prepareCardData(numPairs, selectedCategory);

        if (!itemsForGame) {
            memoramaActive = false; // No se pudo iniciar
            return; // prepareCardData ya mostró el error
        }

        mTotalPairs = itemsForGame.length;
        memoramaActive = true;
        mCards = [];
        mAttempts = 0;
        mMatchedPairsCount = 0;
        mFlippedElements = [];
        mLockBoard = false;
        if (memoramaAttemptsEl) memoramaAttemptsEl.textContent = mAttempts;
        if (memoramaWinMessage) memoramaWinMessage.style.display = 'none';

        itemsForGame.forEach(item => {
            mCards.push({ id: item.id, type: 'image', value: item.image, altText: item.spanish });
            mCards.push({ id: item.id, type: 'text', value: item.raramuri });
        });

        mCards = shuffleArray(mCards);
        buildMemoramaGrid();

        if (memoramaSetup) memoramaSetup.style.display = 'none';
        if (memoramaGameArea) memoramaGameArea.style.display = 'block';
        console.log(`[Memorama] Juego listo con ${mTotalPairs} pares y ${mCards.length} cartas.`);
    }

    // Maneja el evento de clic en una tarjeta de Memorama
    function handleMemoramaCardClick(event) {
        if (!memoramaActive || mLockBoard || !event.currentTarget) return;
        const clickedCardElement = event.currentTarget;

        if (clickedCardElement.classList.contains('flipped') || clickedCardElement.classList.contains('matched')) {
            return;
        }

        clickedCardElement.classList.add('flipped');
        mFlippedElements.push(clickedCardElement);

        if (mFlippedElements.length === 2) {
            mLockBoard = true;
            mAttempts++;
            if (memoramaAttemptsEl) memoramaAttemptsEl.textContent = mAttempts;
            checkMemoramaMatch();
        }
    }

    // Comprueba si las dos tarjetas volteadas forman un par
    function checkMemoramaMatch() {
        const [card1, card2] = mFlippedElements;
        if (!card1 || !card2) {
            console.error("[Memorama Critico] Faltan cartas en checkMemoramaMatch.");
            mFlippedElements = []; mLockBoard = false; return;
        }

        const isMatch = card1.dataset.id === card2.dataset.id;

        if (isMatch) {
            mMatchedPairsCount++;
            setTimeout(() => {
                card1.classList.add('matched');
                card2.classList.add('matched');
                mFlippedElements = [];
                mLockBoard = false;

                if (mMatchedPairsCount === mTotalPairs) {
                    console.log("[Memorama] ¡Juego Ganado!");
                    if (memoramaWinMessage) {
                        memoramaWinMessage.textContent = `¡Felicidades! Encontraste ${mTotalPairs} pares en ${mAttempts} intentos.`;
                        memoramaWinMessage.style.display = 'block';
                    }
                    memoramaActive = false;
                }
            }, 300);
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                mFlippedElements = [];
                mLockBoard = false;
            }, 1000);
        }
    }

    // Configura los event listeners para los controles del Memorama
    // *** MODIFICADO: Añade listener para el select de categoría ***
    function setupMemoramaControls() {
        // Añadir memoramaCategorySelect a la verificación
        if (!memoramaSetup || !resetMemoramaBtn || !memoramaCategorySelect || !memoramaDataErrorEl || difficultyButtons.length === 0) {
            console.error("[Memorama Critico] Faltan elementos HTML para controles de Memorama (#memorama-setup, #reset-memorama, #memorama-category, #memorama-data-error, .difficulty-btn).");
            return;
        }
        console.log("[Memorama] Configurando controles.");

        // Listener para botones de dificultad (llama a startMemorama, que ahora lee el select)
        difficultyButtons.forEach(button => {
            button.addEventListener('click', () => {
                const pairs = parseInt(button.getAttribute('data-pairs'));
                if (isNaN(pairs) || pairs <= 0) {
                    console.error("[Memorama Error] Atributo data-pairs inválido:", button); return;
                }
                difficultyButtons.forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');
                startMemorama(pairs); // startMemorama leerá la categoría del select
            });
        });

        // Listener para botón de reiniciar (llama a startMemorama si hay dificultad seleccionada)
        resetMemoramaBtn.addEventListener('click', () => {
            console.log("[Memorama] Botón Reset presionado.");
            const selectedDiffBtn = document.querySelector('#memorama-setup .difficulty-btn.selected');
            if (selectedDiffBtn) {
                const pairs = parseInt(selectedDiffBtn.getAttribute('data-pairs'));
                // startMemorama leerá la categoría actual del select
                if (!isNaN(pairs) && pairs > 0) { startMemorama(pairs); }
                else { resetMemoramaView(); }
            } else {
                resetMemoramaView(); // Solo resetea la vista si no había dificultad seleccionada
            }
        });

        // *** NUEVO: Listener para el cambio de categoría ***
        memoramaCategorySelect.addEventListener('change', () => {
            console.log("[Memorama] Categoría cambiada. Reseteando vista.");
            // Cuando cambia la categoría, resetea la vista del memorama al estado de setup.
            // El próximo juego iniciado (eligiendo dificultad) usará la nueva categoría.
            resetMemoramaView();
        });
    }
    // =============================================
    // ===== FIN SECCIÓN MEMORAMA ==================
    // =============================================


    // =============================================
    // ========= SECCIÓN QUIZ (con filtro categoría) =
    // =============================================

     function getWrongOptions(correctItem, count, sourceData, field) {
        if (!correctItem || !field || !sourceData) return [];
         const correctValueNorm = normalizeAnswer(correctItem[field]);

         const wrongAnswerPool = sourceData.filter(item =>
             item && item.id !== correctItem.id && item[field] &&
             normalizeAnswer(item[field]) !== correctValueNorm
         );

         const shuffledWrongs = shuffleArray([...wrongAnswerPool]);
         let options = new Set();

         for (const item of shuffledWrongs) {
             if (options.size >= count) break;
             // Añadir el valor original, no el normalizado
             if (item[field]) { // Asegurarse que el campo existe antes de añadir
                 options.add(item[field]);
             }
         }

         let attempts = 0;
         const maxAttempts = sourceData.length * 2;
         while (options.size < count && attempts < maxAttempts) {
             const randomItem = sourceData[Math.floor(Math.random() * sourceData.length)];
             if (randomItem && randomItem[field] && normalizeAnswer(randomItem[field]) !== correctValueNorm) {
                  if (item[field] && !options.has(item[field])) { // Añadir valor original si no está ya
                       options.add(randomItem[field]);
                  }
             }
             attempts++;
         }

         return Array.from(options);
     }

    function generateQuizQuestions(numQuestions) {
        const selectedCategory = quizCategorySelect ? quizCategorySelect.value : 'all';
        console.log(`[Quiz] Generating questions for category: "${selectedCategory}"`);

        const categoryFilteredItems = lexiconData.filter(item =>
            item && item.id != null && item.raramuri && item.spanish &&
            (selectedCategory === 'all' || (item.category && item.category === selectedCategory))
        );

        if (categoryFilteredItems.length < 2) {
            console.warn(`[Quiz] Datos insuficientes para la categoría "${selectedCategory}" (${categoryFilteredItems.length}).`);
            if(quizDataErrorEl) {
                const categoryDisplayName = selectedCategory === 'all' ? 'Todas las categorías' : `la categoría "${selectedCategory}"`;
                quizDataErrorEl.textContent = `Datos insuficientes (${categoryFilteredItems.length}) para ${categoryDisplayName}. Se necesitan al menos 2 entradas léxicas completas.`;
                quizDataErrorEl.style.display = 'block';
            }
            return [];
        } else {
             if(quizDataErrorEl) quizDataErrorEl.style.display = 'none';
        }

        const availableLexiconItems = categoryFilteredItems;
        const availableImageItems = availableLexiconItems.filter(item => item.image);

        const potentialQuestions = [];
        availableLexiconItems.forEach(item => {
            potentialQuestions.push({ type: 'MC_RaSp', item: item, question: `¿Qué significa "${item.raramuri}"?`, answer: item.spanish });
            potentialQuestions.push({ type: 'MC_SpRa', item: item, question: `¿Cómo se dice "${item.spanish}" en rarámuri?`, answer: item.raramuri });
            potentialQuestions.push({ type: 'TXT_SpRa', item: item, question: `Escribe cómo se dice "${item.spanish}" en rarámuri:`, answer: item.raramuri });
        });
        availableImageItems.forEach(item => {
            potentialQuestions.push({ type: 'MC_ImgRa', item: item, question: `¿Qué es esto en rarámuri?`, answer: item.raramuri, image: item.image });
            potentialQuestions.push({ type: 'TXT_ImgRa', item: item, question: `Escribe en rarámuri qué ves en la imagen:`, answer: item.raramuri, image: item.image });
        });

        const shuffledPotentialQuestions = shuffleArray(potentialQuestions);
        const totalPotential = shuffledPotentialQuestions.length;

        if (totalPotential === 0) {
             console.warn(`[Quiz] No se pudieron generar preguntas para la categoría "${selectedCategory}" después de filtrar.`);
             if(quizDataErrorEl) {
                 const categoryDisplayName = selectedCategory === 'all' ? 'estas categorías' : `la categoría "${selectedCategory}"`;
                 quizDataErrorEl.textContent = `No se pudieron generar preguntas con los datos disponibles para ${categoryDisplayName}.`;
                 quizDataErrorEl.style.display = 'block';
             }
             return [];
        }

        let questionsToGenerate = 0;
        if (numQuestions === 'all') { questionsToGenerate = totalPotential; }
        else { questionsToGenerate = Math.min(parseInt(numQuestions), totalPotential); }
        questionsToGenerate = Math.max(1, questionsToGenerate);

        const finalQuestions = shuffledPotentialQuestions.slice(0, questionsToGenerate);

        finalQuestions.forEach(q => {
            if (q.type.startsWith('MC_')) {
                let wrongOptions = [];
                let field = '';
                if (q.type === 'MC_RaSp') field = 'spanish';
                else if (q.type === 'MC_SpRa' || q.type === 'MC_ImgRa') field = 'raramuri';

                if (field && q.item) {
                     // Usar categoryFilteredItems como pool para opciones incorrectas
                     const potentialWrongPool = categoryFilteredItems.filter(item => item && item.id !== q.item.id);
                     wrongOptions = getWrongOptions(q.item, 3, potentialWrongPool, field);

                     // Crear opciones finales (correcta + incorrectas), asegurar unicidad y barajar
                     const allOptionsRaw = [q.answer, ...wrongOptions];
                     const uniqueOptions = Array.from(new Set(allOptionsRaw.filter(opt => opt != null && opt !== ''))); // Filtrar null/undefined/vacío
                     q.options = shuffleArray(uniqueOptions.slice(0, 4)); // Limitar a 4 opciones máx
                } else {
                     q.options = [q.answer]; // Fallback
                     console.warn("[Quiz Warn] No se pudo generar opciones MC para:", q);
                }

                if (!Array.isArray(q.options) || q.options.length < 2) {
                     console.warn("[Quiz Warn] Pregunta MC generada con menos de 2 opciones:", q);
                     // Podrías marcarla como inválida aquí si quieres, e.g., q._invalid = true;
                }
            }
        });
        // Si marcaste preguntas inválidas, podrías filtrarlas aquí:
        // const validFinalQuestions = finalQuestions.filter(q => !q._invalid);
        const validFinalQuestions = finalQuestions;

        console.log("[Quiz] Preguntas generadas:", validFinalQuestions);
        return validFinalQuestions;
     }

    function startQuiz(isRetry = false) {
         quizActive = true; score = 0; currentQuestionIndex = 0;

         if (!isRetry) {
             const selectedLength = quizLengthSelect ? quizLengthSelect.value : '5';
             allQuizQuestions = generateQuizQuestions(selectedLength); // Lee categoría internamente
             currentQuizSet = allQuizQuestions;
             missedQuestions = [];
         }
         else {
             currentQuizSet = shuffleArray([...missedQuestions]);
             missedQuestions = [];
             if (currentQuizSet.length === 0) {
                 alert("¡Felicidades! No hubo preguntas falladas en el último intento.");
                 resetQuizView();
                 return;
             }
             console.log("[Quiz] Reintentando:", currentQuizSet);
              if(quizDataErrorEl) quizDataErrorEl.style.display = 'none'; // Ocultar error al reintentar
         }

         if (!currentQuizSet || currentQuizSet.length === 0) {
             console.log("[Quiz] No hay preguntas disponibles en el set actual.");
             if(quizQuestionArea) quizQuestionArea.style.display = 'none';
             if(quizSetup) quizSetup.style.display = 'block';
             if(quizResultsEl) quizResultsEl.style.display = 'none';
             if(retryMissedQuizBtn) retryMissedQuizBtn.style.display = 'none';
             // El mensaje de error de datos ya se maneja en generateQuizQuestions o en el chequeo de reintento
             quizActive = false;
             return;
         }

         if(quizSetup) quizSetup.style.display = 'none';
         if(quizResultsEl) quizResultsEl.style.display = 'none';
         if(retryMissedQuizBtn) retryMissedQuizBtn.style.display = 'none';
         if(quizQuestionArea) quizQuestionArea.style.display = 'block';
         if(nextQuestionBtn) nextQuestionBtn.style.display = 'none';

         displayQuestion();
     }

    function displayQuestion() {
        if (currentQuestionIndex >= currentQuizSet.length) { showResults(); return; }

        quizActive = true;
        const q = currentQuizSet[currentQuestionIndex];

        if (!q || typeof q.type === 'undefined' || typeof q.question === 'undefined' || typeof q.answer === 'undefined') {
             console.error("[Quiz Error] Pregunta inválida en el set:", q, "en índice:", currentQuestionIndex);
             if(quizFeedbackEl) { quizFeedbackEl.textContent = "Error al cargar pregunta."; quizFeedbackEl.className = 'incorrect'; }
             quizActive = false;
             if(nextQuestionBtn) nextQuestionBtn.style.display = 'inline-block'; // Permitir saltar
             setTimeout(goToNextQuestion, 1500); // Saltar auto después de 1.5s
             return;
        }

        // Reset UI elements
        if(quizQuestionEl) quizQuestionEl.textContent = q.question;
        if(quizImageContainer) quizImageContainer.innerHTML = '';
        if(quizOptionsEl) { quizOptionsEl.innerHTML = ''; quizOptionsEl.style.display = 'none'; }
        if(quizTextInputArea) quizTextInputArea.style.display = 'none';
        if(quizTextAnswerInput) { quizTextAnswerInput.value = ''; quizTextAnswerInput.className = ''; quizTextAnswerInput.disabled = false; }
        if(submitTextAnswerBtn) submitTextAnswerBtn.disabled = false;
        if(quizFeedbackEl) { quizFeedbackEl.textContent = ''; quizFeedbackEl.className = ''; }
        if(nextQuestionBtn) nextQuestionBtn.style.display = 'none';

        // Display image if present
        if (q.image && quizImageContainer) {
             const img = document.createElement('img');
             img.src = q.image;
             img.alt = `Imagen para: ${q.question}`;
             img.loading = 'lazy';
             img.onerror = function() {
                 console.error(`[Quiz Error] IMG no cargada: ${this.src}`);
                 this.alt = 'Error al cargar imagen'; this.src='images/placeholder.png';
             };
             quizImageContainer.appendChild(img);
        }

        // Setup answer options based on type
        if (q.type.startsWith('MC_') && quizOptionsEl) {
            quizOptionsEl.style.display = 'block';
            if (!Array.isArray(q.options) || q.options.length < 2) {
                 console.error("[Quiz Error] Pregunta MC sin opciones válidas en display:", q);
                 quizOptionsEl.innerHTML = '<p style="color:var(--error-red);">Error: Opciones inválidas.</p>';
                 quizActive = false; if(nextQuestionBtn) nextQuestionBtn.style.display = 'inline-block';
            }
            else {
                 q.options.forEach(option => {
                     const button = document.createElement('button');
                     button.textContent = option;
                     button.disabled = false;
                     button.addEventListener('click', handleMCAnswer);
                     quizOptionsEl.appendChild(button);
                 });
            }
        } else if (q.type.startsWith('TXT_') && quizTextInputArea && quizTextAnswerInput && submitTextAnswerBtn) {
            quizTextInputArea.style.display = 'flex';
            setTimeout(() => { if (quizTextAnswerInput) quizTextAnswerInput.focus(); }, 100);
        } else {
             console.error("[Quiz Error] Tipo de pregunta desconocido o elementos DOM faltantes:", q.type, q);
             if(quizFeedbackEl) { quizFeedbackEl.textContent = "Error: Tipo de pregunta no soportado."; quizFeedbackEl.className = 'incorrect'; }
             quizActive = false; if(nextQuestionBtn) nextQuestionBtn.style.display = 'inline-block';
        }
    }

    function handleMCAnswer(event) {
        if (!quizActive || !quizOptionsEl || !quizFeedbackEl || !nextQuestionBtn) return;
        quizActive = false;
        const selectedButton = event.target;
        const selectedAnswer = selectedButton.textContent;
        const currentQuestion = currentQuizSet[currentQuestionIndex];

        if (!currentQuestion || typeof currentQuestion.answer === 'undefined') {
             console.error("[Quiz Error] handleMCAnswer: Pregunta/respuesta inválida.");
             if(quizFeedbackEl) { quizFeedbackEl.textContent = "Error interno."; quizFeedbackEl.className = 'incorrect'; }
             quizOptionsEl.querySelectorAll('button').forEach(btn => btn.disabled = true);
             if(nextQuestionBtn) nextQuestionBtn.style.display = 'inline-block';
             return;
        }

        const correctAnswer = currentQuestion.answer;
        const optionButtons = quizOptionsEl.querySelectorAll('button');
        optionButtons.forEach(btn => btn.disabled = true);

        if (selectedAnswer === correctAnswer) {
            score++;
            selectedButton.classList.add('correct');
            quizFeedbackEl.textContent = '¡Correcto!';
            quizFeedbackEl.className = 'correct';
        } else {
            selectedButton.classList.add('incorrect');
            quizFeedbackEl.innerHTML = `Incorrecto. Correcto: <strong>${correctAnswer}</strong>`;
            quizFeedbackEl.className = 'incorrect';

            if (currentQuestion.item && !missedQuestions.some(mq => mq.item.id === currentQuestion.item.id)) {
                 try { // Use try-catch for JSON operations
                     missedQuestions.push(JSON.parse(JSON.stringify(currentQuestion)));
                 } catch(e) {
                     console.error("Error stringifying/parsing question for missed list:", e, currentQuestion);
                 }
            }

            optionButtons.forEach(btn => {
                if (btn.textContent === correctAnswer) {
                    btn.classList.add('correct'); // Highlight correct answer
                }
            });
        }

        if(nextQuestionBtn) nextQuestionBtn.style.display = 'inline-block';
    }

    function handleTextAnswer() {
         if (!quizActive || !quizTextAnswerInput || !submitTextAnswerBtn || !quizFeedbackEl || !nextQuestionBtn) return;
         quizActive = false;
         const currentQuestion = currentQuizSet[currentQuestionIndex];

         if (!currentQuestion || typeof currentQuestion.answer === 'undefined') {
             console.error("[Quiz Error] handleTextAnswer: Pregunta/respuesta inválida.");
              if(quizFeedbackEl) { quizFeedbackEl.textContent = "Error interno."; quizFeedbackEl.className = 'incorrect'; }
             if (quizTextAnswerInput) quizTextAnswerInput.disabled = true;
             if (submitTextAnswerBtn) submitTextAnswerBtn.disabled = true;
              if(nextQuestionBtn) nextQuestionBtn.style.display = 'inline-block';
             return;
         }

         const userAnswer = normalizeAnswer(quizTextAnswerInput.value);
         const correctAnswerNorm = normalizeAnswer(currentQuestion.answer);
         const originalCorrectAnswer = currentQuestion.answer;

         if (quizTextAnswerInput) quizTextAnswerInput.disabled = true;
         if (submitTextAnswerBtn) submitTextAnswerBtn.disabled = true;

         if (userAnswer === correctAnswerNorm && userAnswer !== '') {
             score++;
             if (quizTextAnswerInput) quizTextAnswerInput.classList.add('correct');
             quizFeedbackEl.textContent = '¡Correcto!';
             quizFeedbackEl.className = 'correct';
         }
         else {
             if (quizTextAnswerInput) quizTextAnswerInput.classList.add('incorrect');
             quizFeedbackEl.innerHTML = `Incorrecto. Correcto: <strong>${originalCorrectAnswer}</strong>`;
             quizFeedbackEl.className = 'incorrect';
             if (currentQuestion.item && !missedQuestions.some(mq => mq.item.id === currentQuestion.item.id)) {
                 try { // Use try-catch for JSON operations
                     missedQuestions.push(JSON.parse(JSON.stringify(currentQuestion)));
                 } catch (e) {
                     console.error("Error stringifying/parsing question for missed list:", e, currentQuestion);
                 }
             }
         }
         if(nextQuestionBtn) nextQuestionBtn.style.display = 'inline-block';
     }

    function goToNextQuestion() {
        currentQuestionIndex++;
        setTimeout(displayQuestion, 50);
    }

    function showResults() {
        if(quizQuestionArea) quizQuestionArea.style.display = 'none';
        if(quizResultsEl) quizResultsEl.style.display = 'block';

        if(quizScoreEl) quizScoreEl.textContent = score;
        if(quizTotalEl && currentQuizSet) quizTotalEl.textContent = currentQuizSet.length;

        quizActive = false;
        const wasMainQuizRound = (currentQuizSet === allQuizQuestions);

        if (missedQuestions.length > 0 && wasMainQuizRound && retryMissedQuizBtn) {
            retryMissedQuizBtn.style.display = 'inline-block';
        } else if(retryMissedQuizBtn) {
            retryMissedQuizBtn.style.display = 'none';
        }
    }

    function resetQuizView() {
        quizActive = false;
        allQuizQuestions = []; currentQuizSet = []; missedQuestions = [];
        score = 0; currentQuestionIndex = 0;

        if(quizSetup) quizSetup.style.display = 'block';
        if(quizQuestionArea) quizQuestionArea.style.display = 'none';
        if(quizResultsEl) quizResultsEl.style.display = 'none';
        if(retryMissedQuizBtn) retryMissedQuizBtn.style.display = 'none';

        if(quizCategorySelect) {
             if(quizCategorySelect.options.length > 0) quizCategorySelect.value = 'all';
             if(lexiconData.length > 0 && quizCategorySelect.options.length <= 1) { // Repopulate if needed
                  const uniqueCategories = getUniqueCategories(lexiconData);
                  populateCategorySelect(quizCategorySelect, uniqueCategories);
             }
             quizCategorySelect.disabled = (quizCategorySelect.options.length <= 1);
        }
        if(quizDataErrorEl) quizDataErrorEl.style.display = 'none'; // Oculta error específico

        // Limpia UI
        if(quizImageContainer) quizImageContainer.innerHTML = '';
        if(quizFeedbackEl) { quizFeedbackEl.textContent = ''; quizFeedbackEl.className = ''; }
        if(quizOptionsEl) quizOptionsEl.innerHTML = '';
        if(quizTextInputArea) quizTextInputArea.style.display = 'none';
        if(quizTextAnswerInput) { quizTextAnswerInput.value = ''; quizTextAnswerInput.className = ''; }
        if(quizQuestionEl) quizQuestionEl.textContent = '';
        if(quizLengthSelect) quizLengthSelect.value = "5"; // Reset a default

        console.log("[Quiz] Vista reseteada.");
    }

    function setupQuizControls() {
        if (!startQuizBtn || !nextQuestionBtn || !restartQuizBtn || !retryMissedQuizBtn || !submitTextAnswerBtn || !quizTextAnswerInput || !quizLengthSelect || !quizCategorySelect || !quizDataErrorEl) {
            console.error("[Quiz Error] Faltan elementos HTML esenciales para controles del Quiz.");
             if (errorMessageEl) {
                 errorMessageEl.textContent = "Error: Controles del Quiz no encontrados. Consulta la consola (F12).";
                 errorMessageEl.style.display = 'block';
             }
            return;
        }
        console.log("[Quiz] Configurando controles.");

        startQuizBtn.addEventListener('click', () => startQuiz(false));
        nextQuestionBtn.addEventListener('click', goToNextQuestion);
        restartQuizBtn.addEventListener('click', resetQuizView);
        retryMissedQuizBtn.addEventListener('click', () => startQuiz(true));
        submitTextAnswerBtn.addEventListener('click', handleTextAnswer);

        quizTextAnswerInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' && !submitTextAnswerBtn.disabled) { handleTextAnswer(); }
        });

        quizCategorySelect.addEventListener('change', () => {
            console.log("[Quiz] Categoría cambiada. Reseteando vista del Quiz.");
            resetQuizView(); // Resetea al cambiar categoría, fuerza re-inicio
        });
    }
    // =============================================
    // ========= FIN SECCIÓN QUIZ ==================
    // =============================================


    // =============================================
    // ========= SECCIÓN FLASHCARDS (con filtro) ===
    // =============================================

    function prepareFlashcardData() {
        if (flashcardsLoadingEl) flashcardsLoadingEl.style.display = 'block';
        if (flashcardAreaEl) flashcardAreaEl.style.display = 'none';
        if (flashcardsErrorEl) flashcardsErrorEl.style.display = 'none';
        if (flashcardsDataErrorEl) flashcardsDataErrorEl.style.display = 'none';

        const selectedCategory = flashcardCategorySelect ? flashcardCategorySelect.value : 'all';
        console.log(`[Flashcards] Preparing cards for category: "${selectedCategory}"`);

        const categoryFilteredLexicon = lexiconData.filter(item =>
            item && item.id != null && item.raramuri && (item.spanish || item.image) &&
            (selectedCategory === 'all' || (item.category && item.category === selectedCategory))
        );

        console.log(`[Flashcards] Items válidos para categoría "${selectedCategory}": ${categoryFilteredLexicon.length}`);

        if (categoryFilteredLexicon.length === 0) {
             console.warn(`[Flashcards] No hay datos disponibles para la categoría "${selectedCategory}".`);
             if (flashcardsDataErrorEl) {
                 const categoryDisplayName = selectedCategory === 'all' ? 'todas las categorías' : `la categoría "${selectedCategory}"`;
                 flashcardsDataErrorEl.textContent = `No hay datos disponibles para ${categoryDisplayName}.`;
                 flashcardsDataErrorEl.style.display = 'block';
             }
             if (flashcardsLoadingEl) flashcardsLoadingEl.style.display = 'none';
             flashcardData = [];
             // Asegurarse de que el contador esté vacío
             if (flashcardCounterEl) flashcardCounterEl.textContent = '';
             return false; // Falló la preparación
        }

        if (flashcardsDataErrorEl) flashcardsDataErrorEl.style.display = 'none'; // Ocultar error si hay datos

        flashcardData = shuffleArray([...categoryFilteredLexicon]);
        currentFlashcardIndex = 0;
        isFlashcardFlipped = false;

        if (flashcardsLoadingEl) flashcardsLoadingEl.style.display = 'none';
        if (flashcardAreaEl) flashcardAreaEl.style.display = 'block';

        return true; // Éxito
    }

     function displayCurrentFlashcard() {
        if (!flashcardData || flashcardData.length === 0 || !flashcardAreaEl || flashcardAreaEl.style.display === 'none') {
             console.log("[Flashcards] No flashcard data to display or display area not visible.");
             if (flashcardCounterEl) flashcardCounterEl.textContent = '';
             return;
        }
        if (currentFlashcardIndex < 0 || currentFlashcardIndex >= flashcardData.length) {
             console.warn(`[Flashcards] Invalid index ${currentFlashcardIndex}. Resetting to 0.`);
             currentFlashcardIndex = 0;
             // Si incluso el índice 0 es inválido después del reset (array vacío), salimos.
             if(!flashcardData[currentFlashcardIndex]) {
                 if (flashcardsErrorEl) { flashcardsErrorEl.textContent = 'Error: No se encontró la tarjeta.'; flashcardsErrorEl.style.display = 'block'; }
                 if (flashcardAreaEl) flashcardAreaEl.style.display = 'none';
                 if (flashcardCounterEl) flashcardCounterEl.textContent = '';
                 return;
             }
        }
        const cardData = flashcardData[currentFlashcardIndex];

        if (flashcardEl) flashcardEl.classList.remove('flipped');
        isFlashcardFlipped = false;

        if (flashcardFrontEl) {
             flashcardFrontEl.innerHTML = '';
            if (cardData.image) {
                const img = document.createElement('img');
                img.src = cardData.image;
                img.alt = cardData.spanish || 'Flashcard Image';
                img.loading = 'lazy';
                img.onerror = function() {
                    console.error(`[Flashcards] Image failed: ${this.src}`);
                    this.alt = 'Error al cargar imagen'; this.src='images/placeholder.png';
                };
                flashcardFrontEl.appendChild(img);
            } else if (cardData.spanish) {
                 flashcardFrontEl.textContent = cardData.spanish;
            }
            else { flashcardFrontEl.textContent = '???'; }
        }

        if (flashcardBackEl) {
             flashcardBackEl.textContent = cardData.raramuri || '???';
        }

        if (flashcardCounterEl) {
             flashcardCounterEl.textContent = `Tarjeta ${currentFlashcardIndex + 1} de ${flashcardData.length}`;
        }
    }

    function flipFlashcard() {
        if (!flashcardEl) return;
        flashcardEl.classList.toggle('flipped');
        isFlashcardFlipped = !isFlashcardFlipped;
    }

    function nextFlashcard() {
        if (!flashcardData || flashcardData.length === 0) return;
        currentFlashcardIndex = (currentFlashcardIndex + 1) % flashcardData.length; // Usa módulo para loop
        displayCurrentFlashcard();
    }

    function prevFlashcard() {
        if (!flashcardData || flashcardData.length === 0) return;
        currentFlashcardIndex = (currentFlashcardIndex - 1 + flashcardData.length) % flashcardData.length; // Usa módulo
        displayCurrentFlashcard();
    }

     function shuffleFlashcards() {
         console.log("[Flashcards] Shuffling cards...");
         if (prepareFlashcardData()) { // Re-prepara y baraja según categoría actual
              displayCurrentFlashcard(); // Muestra la primera nueva
         }
         // Si falla, prepareFlashcardData ya muestra el error
     }

    function setupFlashcardsControls() {
        if (!flashcardEl || !prevFlashcardBtn || !flipFlashcardBtn || !nextFlashcardBtn || !shuffleFlashcardsBtn || !flashcardCategorySelect || !flashcardsSetupControls || !flashcardsDataErrorEl || !flashcardCounterEl || !flashcardAreaEl) {
             console.error("Missing essential Flashcard control/display elements.");
             if (flashcardsErrorEl) {
                 flashcardsErrorEl.textContent = "Error: Controles de Flashcards no encontrados.";
                 flashcardsErrorEl.style.display = 'block';
             }
             if(flashcardsSetupControls) flashcardsSetupControls.style.display = 'none'; // Ocultar setup si faltan elementos
             return;
        }
        console.log("[Flashcards] Configurando controles.");

        flashcardEl.addEventListener('click', flipFlashcard);
        flipFlashcardBtn.addEventListener('click', flipFlashcard);
        nextFlashcardBtn.addEventListener('click', nextFlashcard);
        prevFlashcardBtn.addEventListener('click', prevFlashcard);
        shuffleFlashcardsBtn.addEventListener('click', shuffleFlashcards);

        flashcardCategorySelect.addEventListener('change', () => {
            console.log("[Flashcards] Categoría cambiada. Recargando tarjetas.");
            if (prepareFlashcardData()) { // Prepara datos para la nueva categoría
                 displayCurrentFlashcard(); // Muestra la primera si tuvo éxito
            }
            // Si falla, prepareFlashcardData muestra el error y oculta el área
        });
    }

     function initializeFlashcardsView() {
         console.log("[Flashcards] Initializing view...");

         // Asegurar que el selector esté poblado si hay datos y no lo está ya
         if(lexiconData.length > 0 && flashcardCategorySelect && flashcardCategorySelect.options.length <= 1) {
              const uniqueCategories = getUniqueCategories(lexiconData);
              populateCategorySelect(flashcardCategorySelect, uniqueCategories);
              flashcardCategorySelect.disabled = false;
         } else if (lexiconData.length === 0) {
              console.warn("[Flashcards] No lexicon data available.");
               if(flashcardCategorySelect) flashcardCategorySelect.disabled = true;
               if(flashcardsSetupControls) flashcardsSetupControls.style.display = 'block';
               if (flashcardsDataErrorEl) {
                   flashcardsDataErrorEl.textContent = 'No hay datos léxicos para Flashcards.';
                   flashcardsDataErrorEl.style.display = 'block';
               }
               if (flashcardsLoadingEl) flashcardsLoadingEl.style.display = 'none';
               if (flashcardAreaEl) flashcardAreaEl.style.display = 'none';
               if (flashcardCounterEl) flashcardCounterEl.textContent = ''; // Limpiar contador
               return;
         } else {
              // Si ya estaba poblado, asegurarse de que esté habilitado (si hay opciones > 1)
              if(flashcardCategorySelect) flashcardCategorySelect.disabled = (flashcardCategorySelect.options.length <= 1);
         }

         // Preparar y mostrar tarjetas para la categoría seleccionada actual ('all' por defecto inicial)
         if (prepareFlashcardData()) {
              displayCurrentFlashcard();
         }
         // Si falla, prepareFlashcardData ya maneja los mensajes/UI
     }
    // =============================================
    // ========= FIN SECCIÓN FLASHCARDS ============
    // =============================================


    // --- Initialization Application ---
    function initializeApplication() {
        // *** AÑADIDO memoramaCategorySelect y memoramaDataErrorEl a la verificación ***
        if (!mainContentEl || !navButtons || !contentSections || !lexiconGrid || !phrasesList ||
            !memoramaGrid || !memoramaCategorySelect || !memoramaDataErrorEl ||
            !quizContainer || !quizCategorySelect || !quizDataErrorEl ||
            !flashcardsContainer || !flashcardCategorySelect || !flashcardsDataErrorEl ||
            !categoryFiltersContainer || !flashcardsSetupControls) {
            console.error("Critical Error: Missing essential HTML elements. Check IDs and classes required by JS.");
            if(errorMessageEl) {
                 errorMessageEl.textContent = "Error crítico al iniciar: Elementos HTML faltantes. Consulta la consola (F12).";
                 errorMessageEl.style.display = 'block';
            }
            if(loadingMessageEl) loadingMessageEl.style.display = 'none';
            if(mainContentEl) mainContentEl.style.display = 'none';
            return;
        }
        console.log("HTML elements check passed. Initializing application modules...");

        setupNavigation();
        populatePhrases();

        // Lexicon Setup
        setupSearch();
        populateCategoryFilters();
        filterAndDisplayLexicon(); // Initial display

        // Populate ALL category selectors
        if(lexiconData.length > 0) {
            const uniqueCategories = getUniqueCategories(lexiconData);
            populateCategorySelect(quizCategorySelect, uniqueCategories);
            populateCategorySelect(flashcardCategorySelect, uniqueCategories);
            populateCategorySelect(memoramaCategorySelect, uniqueCategories); // *** AÑADIDO ***

            // Enable selects if they have options
             if(quizCategorySelect) quizCategorySelect.disabled = (quizCategorySelect.options.length <= 1);
             if(flashcardCategorySelect) flashcardCategorySelect.disabled = (flashcardCategorySelect.options.length <= 1);
             if(memoramaCategorySelect) memoramaCategorySelect.disabled = (memoramaCategorySelect.options.length <= 1); // *** AÑADIDO ***

        } else {
             console.warn("No lexicon data available. Category selects disabled.");
             // Disable selects and show errors if no data
             if(quizCategorySelect) quizCategorySelect.disabled = true;
             if(flashcardCategorySelect) flashcardCategorySelect.disabled = true;
             if(memoramaCategorySelect) memoramaCategorySelect.disabled = true; // *** AÑADIDO ***

             if (quizDataErrorEl) { quizDataErrorEl.textContent = 'No hay datos léxicos disponibles.'; quizDataErrorEl.style.display = 'block'; }
             if (flashcardsDataErrorEl) { flashcardsDataErrorEl.textContent = 'No hay datos léxicos disponibles.'; flashcardsDataErrorEl.style.display = 'block'; }
             if (memoramaDataErrorEl) { memoramaDataErrorEl.textContent = 'No hay datos léxicos disponibles.'; memoramaDataErrorEl.style.display = 'block'; } // *** AÑADIDO ***

             // Ensure setup areas are visible to show the error message
             if (flashcardsSetupControls) flashcardsSetupControls.style.display = 'block';
             // No need to force memorama/quiz setup visible here, resetView handles it on tab switch if needed.
        }

        // Setup Controls for Games
        setupMemoramaControls(); // Now includes listener for memoramaCategorySelect
        setupQuizControls();
        setupFlashcardsControls();

        // Initial view for Flashcards is handled by initializeFlashcardsView() when navigating to the tab.
        // Memorama and Quiz default to showing their setup areas.

        console.log("Aplicación inicializada correctamente.");
    }

    // --- Punto de Entrada ---
    loadData();

}); // Fin del evento DOMContentLoaded
