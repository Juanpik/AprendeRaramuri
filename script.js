// --- START OF FILE script.js ---

document.addEventListener('DOMContentLoaded', () => {

    // --- DECLARACIÓN DE VARIABLES PARA DATOS (se llenarán después) ---
    let lexiconData = [];
    let phrasesData = [];

    // --- ELEMENTOS DEL DOM ---
    const loadingMessageEl = document.getElementById('loading-message');
    const errorMessageEl = document.getElementById('error-message');
    const mainContentEl = document.getElementById('main-content');
    const navButtons = document.querySelectorAll('nav button');
    const contentSections = document.querySelectorAll('.content-section');
    const lexiconGrid = document.getElementById('lexicon-grid');
    const lexiconSearchInput = document.getElementById('lexicon-search');
    const phrasesList = document.getElementById('phrases-list');

    // Memorama Elements
    const memoramaSetup = document.getElementById('memorama-setup');
    const memoramaGameArea = document.getElementById('memorama-game-area');
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    const memoramaGrid = document.getElementById('memorama-grid');
    const memoramaAttemptsEl = document.getElementById('memorama-attempts');
    const resetMemoramaBtn = document.getElementById('reset-memorama');
    const memoramaWinMessage = document.getElementById('memorama-win-message');
    const memoramaDataErrorEl = document.getElementById('memorama-data-error');

    // Quiz Elements
    const quizContainer = document.getElementById('quiz-container');
    const quizSetup = document.getElementById('quiz-setup');
    const quizLengthSelect = document.getElementById('quiz-length');
    const startQuizBtn = document.getElementById('start-quiz');
    const quizQuestionArea = document.getElementById('quiz-question-area');
    const quizImageContainer = document.getElementById('quiz-image-container');
    const quizQuestionEl = document.getElementById('quiz-question');
    const quizOptionsEl = document.getElementById('quiz-options');
    const quizTextInputArea = document.getElementById('quiz-text-input-area');
    const quizTextAnswerInput = document.getElementById('quiz-text-answer');
    const submitTextAnswerBtn = document.getElementById('submit-text-answer');
    const quizFeedbackEl = document.getElementById('quiz-feedback');
    const nextQuestionBtn = document.getElementById('next-question');
    const quizResultsEl = document.getElementById('quiz-results');
    const quizScoreEl = document.getElementById('quiz-score');
    const quizTotalEl = document.getElementById('quiz-total');
    const restartQuizBtn = document.getElementById('restart-quiz');
    const retryMissedQuizBtn = document.getElementById('retry-missed-quiz');
    const quizDataErrorEl = document.getElementById('quiz-data-error');

    // Flashcards Elements
    const flashcardsContainer = document.getElementById('flashcards-container');
    const flashcardsLoadingEl = document.getElementById('flashcards-loading');
    const flashcardsErrorEl = document.getElementById('flashcards-error');
    const flashcardAreaEl = document.getElementById('flashcard-area');
    const flashcardCounterEl = document.getElementById('flashcard-counter');
    const flashcardEl = document.getElementById('flashcard');
    const flashcardFrontEl = document.getElementById('flashcard-front');
    const flashcardBackEl = document.getElementById('flashcard-back');
    const prevFlashcardBtn = document.getElementById('prev-flashcard-btn');
    const flipFlashcardBtn = document.getElementById('flip-flashcard-btn');
    const nextFlashcardBtn = document.getElementById('next-flashcard-btn');
    const shuffleFlashcardsBtn = document.getElementById('shuffle-flashcards-btn');


    // --- VARIABLES GLOBALES JUEGOS ---
    // Memorama
    let memoramaActive = false;
    let mCards = [];
    let mFlippedElements = [];
    let mMatchedPairsCount = 0;
    let mTotalPairs = 0;
    let mAttempts = 0;
    let mLockBoard = false;
    // Quiz
    let allQuizQuestions = [];
    let currentQuizSet = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let quizActive = false;
    let missedQuestions = [];
    // Flashcards State
    let flashcardData = [];
    let currentFlashcardIndex = 0;
    let isFlashcardFlipped = false;


    // --- FUNCIÓN PARA CARGAR DATOS ---
    async function loadData() {
        try {
            loadingMessageEl.style.display = 'block'; // Asegurar que se muestra al inicio
            errorMessageEl.style.display = 'none';
            mainContentEl.style.display = 'none';

            const response = await fetch('data.json', { cache: 'no-cache' });
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            const data = await response.json();
            if (!data || typeof data !== 'object') throw new Error("JSON inválido.");
            lexiconData = Array.isArray(data.lexicon) ? data.lexicon : [];
            phrasesData = Array.isArray(data.phrases) ? data.phrases : [];
            console.log("Datos cargados:", { lexicon: lexiconData.length, phrases: phrasesData.length });

            // Validar datos mínimos para funcionalidad básica
            if (lexiconData.length === 0) {
                 console.warn("Advertencia: El array 'lexicon' en data.json está vacío o no es un array.");
            }
             if (phrasesData.length === 0) {
                 console.warn("Advertencia: El array 'phrases' en data.json está vacío o no es un array.");
            }

            loadingMessageEl.style.display = 'none';
            mainContentEl.style.display = 'block';
            errorMessageEl.style.display = 'none';
            initializeApplication();

        } catch (error) {
            console.error("Error al cargar/procesar datos:", error);
            loadingMessageEl.style.display = 'none';
            errorMessageEl.textContent = `Error cargando datos: ${error.message}. Verifica data.json y la consola (F12).`;
            errorMessageEl.style.display = 'block';
            mainContentEl.style.display = 'none';
        }
    }

    // --- FUNCIONES DE LA APLICACIÓN ---
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    function normalizeAnswer(text) { return text ? text.toLowerCase().trim() : ''; }

    // -- Navegación --
    function setupNavigation() {
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const sectionId = button.getAttribute('data-section');
                contentSections.forEach(section => section.classList.remove('active'));
                navButtons.forEach(btn => btn.classList.remove('active'));
                const currentSection = document.getElementById(sectionId);
                if (currentSection) currentSection.classList.add('active');
                else console.error(`Sección ${sectionId} no encontrada.`);
                button.classList.add('active');

                // Resetear vistas o inicializar según la sección
                if (sectionId === 'memorama') resetMemoramaView();
                else if (sectionId === 'quiz') resetQuizView();
                else if (sectionId === 'flashcards') initializeFlashcardsView(); // Inicializar Flashcards

            });
        });
        // Activar la primera sección por defecto ('About')
        const aboutButton = document.querySelector('nav button[data-section="about"]');
        const aboutSection = document.getElementById('about');
        if (aboutButton && aboutSection) {
            aboutButton.classList.add('active');
            aboutSection.classList.add('active');
        } else if (navButtons.length > 0 && contentSections.length > 0) {
             // Fallback si 'About' no existe: activar el primer botón/sección
            navButtons[0].classList.add('active');
            contentSections[0].classList.add('active');
        }
    }

    // -- Léxico --
    function displayLexiconItems(itemsToShow) {
        if (!lexiconGrid) return;
        lexiconGrid.innerHTML = ''; // Limpiar grid
        if (!itemsToShow || itemsToShow.length === 0) {
            // Mostrar mensaje si no hay items (o no hay coincidencias de búsqueda)
            const message = lexiconSearchInput && lexiconSearchInput.value ? 'No se encontraron coincidencias.' : 'No hay datos léxicos para mostrar.';
            lexiconGrid.innerHTML = `<p class="text-center text-secondary" style="grid-column: 1 / -1;">${message}</p>`; // Ocupar todo el ancho
            return;
        }
        itemsToShow.forEach(item => {
            const div = document.createElement('div'); div.classList.add('lexicon-item');
            const imgSrc = item.image || 'images/placeholder.png'; // Usa placeholder si no hay imagen
            const spanishText = item.spanish || '???';
            const raramuriText = item.raramuri || '???';

            // Manejador de error más robusto para imágenes
            div.innerHTML = `
                <img src="${imgSrc}" alt="${spanishText}" loading="lazy" onerror="this.onerror=null; this.src='images/placeholder.png'; this.alt='Error al cargar: ${raramuriText}'; this.parentElement.querySelector('.img-error-msg')?.remove(); this.parentElement.insertAdjacentHTML('beforeend', '<p class=\'img-error-msg\' style=\'font-size:0.8em; color:var(--error-red);\'>Error Img</p>');">
                <p class="raramuri-word">${raramuriText}</p>
                <p class="spanish-word">${spanishText}</p>`;
            lexiconGrid.appendChild(div);
        });
    }
    function handleSearch() {
        if (!lexiconSearchInput || !lexiconData) return;
        const searchTerm = lexiconSearchInput.value.toLowerCase().trim();
        const filteredItems = lexiconData.filter(item =>
            ((item.raramuri || '').toLowerCase().includes(searchTerm) ||
             (item.spanish || '').toLowerCase().includes(searchTerm))
        );
        displayLexiconItems(filteredItems);
    }
    function setupSearch() {
        if (lexiconSearchInput) {
            lexiconSearchInput.addEventListener('input', handleSearch);
        } else {
            console.error("Elemento #lexicon-search no encontrado.");
        }
    }

    // -- Frases --
    function populatePhrases() {
        if (!phrasesList) return;
        phrasesList.innerHTML = ''; // Limpiar lista
        if (!phrasesData || phrasesData.length === 0) {
            phrasesList.innerHTML = '<li class="text-secondary">No hay frases disponibles.</li>';
            return;
        }
        phrasesData.forEach(phrase => {
            // Asegurarse que ambas frases existen antes de añadir
            if (phrase.raramuri && phrase.spanish) {
                const li = document.createElement('li');
                li.innerHTML = `<span class="raramuri-phrase">${phrase.raramuri}</span><span class="spanish-phrase">${phrase.spanish}</span>`;
                phrasesList.appendChild(li);
            }
        });
    }

   // =============================================
    // ========= SECCIÓN MEMORAMA ==================
    // =============================================
    function resetMemoramaView() {
        console.log("[Memorama] Reseteando Vista");
        if (memoramaSetup) memoramaSetup.style.display = 'block';
        if (memoramaGameArea) memoramaGameArea.style.display = 'none';
        if (memoramaWinMessage) memoramaWinMessage.style.display = 'none';
        if (memoramaDataErrorEl) memoramaDataErrorEl.style.display = 'none';
        if (memoramaGrid) memoramaGrid.innerHTML = '';

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

    function createMemoramaFaceContent(cardInfo, faceElement) {
        if (!cardInfo || !faceElement) {
            console.error("[Memorama Critico] Faltan parámetros en createMemoramaFaceContent"); return;
        }
        faceElement.innerHTML = ''; // Limpiar
        console.log(`[Memorama DEBUG] Creando contenido para Cara (ID: ${cardInfo.id}, Tipo: ${cardInfo.type})`);
        try {
            if (cardInfo.type === 'image' && cardInfo.value) {
                const img = document.createElement('img');
                img.src = cardInfo.value;
                img.alt = cardInfo.altText || "Imagen Memorama";
                img.loading = 'lazy';
                img.onerror = function() {
                    console.error(`[Memorama Critico] Falló carga IMG: ${this.src} (ID: ${cardInfo.id})`);
                    this.style.display = 'none'; // Ocultar imagen rota
                    const errorP = document.createElement('p'); errorP.textContent = 'Error Img!'; errorP.style.color = 'red'; errorP.style.fontSize = '10px';
                    faceElement.appendChild(errorP);
                };
                faceElement.appendChild(img);
                console.log(`[Memorama DEBUG] IMG ${cardInfo.value} añadida.`);
            } else if (cardInfo.type === 'text' && cardInfo.value) {
                const textP = document.createElement('p');
                textP.textContent = cardInfo.value;
                faceElement.appendChild(textP);
                console.log(`[Memorama DEBUG] TEXT "${cardInfo.value}" añadido.`);
            } else {
                console.warn(`[Memorama Warn] Contenido inválido (ID: ${cardInfo.id}):`, cardInfo);
                const fallbackP = document.createElement('p'); fallbackP.textContent = '??'; fallbackP.style.opacity = '0.5';
                faceElement.appendChild(fallbackP);
            }
        } catch (e) {
            console.error("[Memorama Critico] Excepción en createMemoramaFaceContent:", e, cardInfo);
            try { faceElement.innerHTML = '<p style="color:red; font-size:10px;">Error JS!</p>'; } catch (fe) {}
        }
    }

    function prepareCardData(requestedPairs) {
        const validItems = lexiconData.filter(item => item && item.id != null && item.image && item.raramuri && item.spanish);
        if (validItems.length < requestedPairs) {
            console.warn(`[Memorama] Datos insuficientes: ${validItems.length} items válidos, se necesitan ${requestedPairs} pares.`);
            if (memoramaDataErrorEl) {
                memoramaDataErrorEl.textContent = `Datos insuficientes (${validItems.length}) para ${requestedPairs} pares. Añade más entradas con imagen al léxico.`;
                memoramaDataErrorEl.style.display = 'block';
            }
             if (memoramaGameArea) memoramaGameArea.style.display = 'none'; // Ocultar área de juego
             if (memoramaSetup) memoramaSetup.style.display = 'block'; // Mostrar setup
             difficultyButtons.forEach(btn => btn.classList.remove('selected'));
            return null;
        }
        if (memoramaDataErrorEl) memoramaDataErrorEl.style.display = 'none'; // Ocultar error si hay datos
        return shuffleArray(validItems).slice(0, requestedPairs);
    }

    function buildMemoramaGrid() {
        if (!memoramaGrid) { console.error("[Memorama Error] #memorama-grid no encontrado."); return; }
        memoramaGrid.innerHTML = ''; // Limpiar
        mCards.forEach((cardData, index) => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('memorama-card');
            if (cardData.id === undefined || cardData.id === null) {
                console.error(`[Memorama Error] ID indefinido carta ${index}`, cardData); return;
            }
            cardElement.dataset.id = cardData.id; // ID para matching
            cardElement.dataset.index = index; // Índice único para debug

            // Crear ambas caras
            const frontFace = document.createElement('div');
            frontFace.classList.add('card-face', 'card-front');
            createMemoramaFaceContent(cardData, frontFace); // Llenar contenido cara frontal

            const backFace = document.createElement('div');
            backFace.classList.add('card-face', 'card-back');
            // El ::before en CSS se encarga del '?'

            cardElement.appendChild(frontFace);
            cardElement.appendChild(backFace);

            cardElement.addEventListener('click', handleMemoramaCardClick);
            memoramaGrid.appendChild(cardElement);
        });

        // Ajustar columnas del grid dinámicamente
        let columns;
        if (mCards.length <= 8) columns = 4; // 4 pares o menos
        else if (mCards.length <= 12) columns = 4; // 6 pares
        else columns = 4; // 8 pares (o más, si se añaden) - mantener 4 columnas máx
        // O intentar hacerlo más cuadrado:
        // columns = Math.ceil(Math.sqrt(mCards.length));
        // columns = Math.max(2, Math.min(columns, 5)); // Limitar entre 2 y 5

        memoramaGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        console.log(`[Memorama] Grid construido con ${columns} columnas.`);
    }

    function startMemorama(numPairs) {
        console.log(`[Memorama] Iniciando startMemorama con ${numPairs} pares.`);
        resetMemoramaView(); // Limpiar todo primero
        const itemsForGame = prepareCardData(numPairs);

        if (!itemsForGame) { // Si prepareCardData devolvió null (error de datos)
            memoramaActive = false;
            return; // Salir, ya se mostró el error
        }

        mTotalPairs = itemsForGame.length;
        memoramaActive = true;
        mCards = []; // Resetear array de cartas
        mAttempts = 0; // Resetear intentos
        mMatchedPairsCount = 0; // Resetear pares encontrados
        if (memoramaAttemptsEl) memoramaAttemptsEl.textContent = mAttempts; // Actualizar UI intentos
        if (memoramaWinMessage) memoramaWinMessage.style.display = 'none'; // Ocultar mensaje de victoria

        // Crear pares de cartas (imagen + texto raramuri)
        itemsForGame.forEach(item => {
            mCards.push({ id: item.id, type: 'image', value: item.image, altText: item.spanish });
            mCards.push({ id: item.id, type: 'text', value: item.raramuri });
        });

        mCards = shuffleArray(mCards); // Barajar las cartas
        buildMemoramaGrid(); // Construir el grid en el DOM

        if (memoramaSetup) memoramaSetup.style.display = 'none'; // Ocultar setup
        if (memoramaGameArea) memoramaGameArea.style.display = 'block'; // Mostrar área de juego
        console.log(`[Memorama] Juego listo con ${mTotalPairs} pares.`);
    }

    function handleMemoramaCardClick(event) {
        if (!memoramaActive || mLockBoard || !event.currentTarget) return; // Si juego no activo, tablero bloqueado o no hay target, salir

        const clickedCardElement = event.currentTarget;
        console.log(`[Memorama] Click Carta ${clickedCardElement.dataset.index} (ID: ${clickedCardElement.dataset.id})`);

        // Ignorar click si la carta ya está volteada o emparejada
        if (clickedCardElement.classList.contains('flipped') || clickedCardElement.classList.contains('matched')) {
            console.log("[Memorama] Click ignorado (carta ya volteada o emparejada).");
            return;
        }

        // Voltear la carta
        clickedCardElement.classList.add('flipped');
        mFlippedElements.push(clickedCardElement); // Añadir a la lista de volteadas
        console.log(`[Memorama] Cartas volteadas actualmente: ${mFlippedElements.length}`);

        // Si hay dos cartas volteadas, revisar si son par
        if (mFlippedElements.length === 2) {
            mLockBoard = true; // Bloquear el tablero para evitar más clicks
            mAttempts++; // Incrementar contador de intentos
            if (memoramaAttemptsEl) memoramaAttemptsEl.textContent = mAttempts; // Actualizar UI
            console.log("[Memorama] Dos cartas volteadas, comprobando par...");
            checkMemoramaMatch();
        }
    }

    function checkMemoramaMatch() {
        const [card1, card2] = mFlippedElements; // Obtener las dos cartas volteadas

        if (!card1 || !card2) {
            console.error("[Memorama Critico] Faltan cartas en checkMemoramaMatch.");
            mFlippedElements = []; // Limpiar array
            mLockBoard = false; // Desbloquear tablero
            return;
        }

        // Comprobar si los IDs (data-id) coinciden
        const isMatch = card1.dataset.id === card2.dataset.id;
        console.log(`[Memorama] Comparando ${card1.dataset.id} vs ${card2.dataset.id}. Coinciden: ${isMatch}`);

        if (isMatch) {
            // Es un par
            mMatchedPairsCount++;
            console.log(`[Memorama] ¡Par encontrado! (${mMatchedPairsCount}/${mTotalPairs})`);
            // Dejar las cartas volteadas y marcarlas como emparejadas (después de una pequeña pausa)
            setTimeout(() => {
                card1.classList.add('matched');
                card2.classList.add('matched');
                mFlippedElements = []; // Limpiar array de volteadas
                mLockBoard = false; // Desbloquear tablero

                // Comprobar si se ha ganado el juego
                if (mMatchedPairsCount === mTotalPairs) {
                    console.log("[Memorama] ¡Juego Ganado!");
                    if (memoramaWinMessage) {
                        memoramaWinMessage.textContent = `¡Felicidades! Encontraste ${mTotalPairs} pares en ${mAttempts} intentos.`;
                        memoramaWinMessage.style.display = 'block'; // Mostrar mensaje de victoria
                    }
                    memoramaActive = false; // Desactivar juego
                }
            }, 300); // Pausa corta antes de marcar como matched
        } else {
            // No es un par
            console.log("[Memorama] No es par.");
            // Voltear las cartas de nuevo después de una pausa más larga
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                mFlippedElements = []; // Limpiar array de volteadas
                mLockBoard = false; // Desbloquear tablero
            }, 1000); // Pausa de 1 segundo para que el usuario vea las cartas
        }
    }

    function setupMemoramaControls() {
        if (!memoramaSetup || !resetMemoramaBtn || difficultyButtons.length === 0) {
            console.error("[Memorama Critico] Faltan elementos HTML para controles de Memorama.");
            return;
        }
        console.log("[Memorama] Configurando controles.");
        // Botones de dificultad
        difficultyButtons.forEach(button => {
            button.addEventListener('click', () => {
                const pairs = parseInt(button.getAttribute('data-pairs'));
                if (isNaN(pairs) || pairs <= 0) {
                    console.error("[Memorama Error] Atributo data-pairs inválido:", button);
                    return;
                }
                // Marcar botón como seleccionado
                difficultyButtons.forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');
                // Iniciar juego con el número de pares seleccionado
                startMemorama(pairs);
            });
        });
        // Botón de reiniciar
        resetMemoramaBtn.addEventListener('click', () => {
            console.log("[Memorama] Botón Reset presionado.");
            // Reiniciar con la dificultad actual seleccionada, si hay una
            const selectedBtn = document.querySelector('#memorama-setup .difficulty-btn.selected');
            if (selectedBtn) {
                const pairs = parseInt(selectedBtn.getAttribute('data-pairs'));
                if (!isNaN(pairs) && pairs > 0) {
                    startMemorama(pairs); // Reiniciar con la misma dificultad
                } else {
                    resetMemoramaView(); // Si no hay dificultad válida, solo resetear vista
                }
            } else {
                resetMemoramaView(); // Si no había ninguna seleccionada, solo resetear vista
            }
        });
    }
    // =============================================
    // ===== FIN SECCIÓN MEMORAMA ==================
    // =============================================


    // =============================================
    // ========= SECCIÓN QUIZ ======================
    // =============================================
    function getWrongOptions(correctItem, count, sourceData, field) {
        if (!correctItem || !field) return [];
         const correctValueNorm = normalizeAnswer(correctItem[field]);
         // Crear un pool de respuestas incorrectas válidas
         const wrongAnswerPool = sourceData.filter(item =>
             item && item.id !== correctItem.id && // No ser el item correcto
             item[field] && // Tener el campo necesario
             normalizeAnswer(item[field]) !== correctValueNorm // No ser la respuesta correcta (normalizada)
         );
         const shuffledWrongs = shuffleArray([...wrongAnswerPool]);
         let options = new Set(); // Usar Set para evitar duplicados fácilmente

         // Intentar llenar con respuestas únicas del pool
         for (const item of shuffledWrongs) {
             if (options.size >= count) break;
             const potentialOption = item[field];
             options.add(potentialOption); // Set maneja duplicados automáticamente
         }

         // Si aún faltan, intentar con elementos aleatorios (menos ideal, pero asegura el conteo)
         let attempts = 0;
         const maxAttempts = sourceData.length * 2; // Límite para evitar bucles infinitos
         while (options.size < count && attempts < maxAttempts) {
             const randomItem = sourceData[Math.floor(Math.random() * sourceData.length)];
             if (randomItem && randomItem.id !== correctItem.id && randomItem[field]) {
                  const potentialOption = randomItem[field];
                  if (normalizeAnswer(potentialOption) !== correctValueNorm) {
                      options.add(potentialOption);
                  }
             }
             attempts++;
         }
         return Array.from(options); // Convertir Set a Array
     }

    function generateQuizQuestions(numQuestions) {
         const availableLexiconItems = lexiconData.filter(item => item && item.raramuri && item.spanish && item.id);
         const availableImageItems = availableLexiconItems.filter(item => item.image);

        if (availableLexiconItems.length < 2) { // Necesitamos al menos 2 para generar opciones incorrectas
            console.error("Quiz: Se necesitan al menos 2 entradas léxicas con español y rarámuri.");
            if(quizDataErrorEl) {
                 quizDataErrorEl.textContent = "Datos insuficientes (mínimo 2 entradas léxicas completas).";
                 quizDataErrorEl.style.display = 'block';
            }
            return []; // Retornar array vacío si no hay suficientes datos
        } else {
             if(quizDataErrorEl) quizDataErrorEl.style.display = 'none'; // Ocultar mensaje de error si hay datos
        }

        // Generar todos los tipos posibles de preguntas
        const potentialQuestions = [];
        availableLexiconItems.forEach(item => {
            // Rarámuri -> Español (Opción Múltiple)
            potentialQuestions.push({ type: 'MC_RaSp', item: item, question: `¿Qué significa "${item.raramuri}"?`, answer: item.spanish });
            // Español -> Rarámuri (Opción Múltiple)
            potentialQuestions.push({ type: 'MC_SpRa', item: item, question: `¿Cómo se dice "${item.spanish}" en rarámuri?`, answer: item.raramuri });
             // Español -> Rarámuri (Texto Input)
            potentialQuestions.push({ type: 'TXT_SpRa', item: item, question: `Escribe cómo se dice "${item.spanish}" en rarámuri:`, answer: item.raramuri });
        });
        availableImageItems.forEach(item => {
             // Imagen -> Rarámuri (Opción Múltiple)
            potentialQuestions.push({ type: 'MC_ImgRa', item: item, question: `¿Qué es esto en rarámuri?`, answer: item.raramuri, image: item.image });
            // Imagen -> Rarámuri (Texto Input)
            potentialQuestions.push({ type: 'TXT_ImgRa', item: item, question: `Escribe en rarámuri qué ves en la imagen:`, answer: item.raramuri, image: item.image });
        });

        const shuffledPotentialQuestions = shuffleArray(potentialQuestions);
        let questionsToGenerate = 0;
        const totalPotential = shuffledPotentialQuestions.length;

        if (numQuestions === 'all') {
            questionsToGenerate = totalPotential;
        } else {
            questionsToGenerate = Math.min(parseInt(numQuestions), totalPotential);
        }
        questionsToGenerate = Math.max(1, questionsToGenerate); // Asegurar al menos 1 pregunta si es posible

        if (totalPotential === 0) return []; // Si no se pudo generar ninguna potencial

        const finalQuestions = shuffledPotentialQuestions.slice(0, questionsToGenerate);

        // Generar opciones para preguntas de opción múltiple
        finalQuestions.forEach(q => {
            if (q.type.startsWith('MC_')) {
                let wrongOptions = [];
                let field = ''; // Campo del que se sacarán las opciones incorrectas (spanish o raramuri)
                let correctLexiconItem = q.item; // El item léxico asociado a la pregunta

                if (q.type === 'MC_RaSp') { // Pregunta Rarámuri, respuesta Español
                    field = 'spanish';
                } else if (q.type === 'MC_SpRa' || q.type === 'MC_ImgRa') { // Pregunta Español/Imagen, respuesta Rarámuri
                    field = 'raramuri';
                }

                if (field && correctLexiconItem) {
                    // Obtener 3 opciones incorrectas
                    wrongOptions = getWrongOptions(correctLexiconItem, 3, availableLexiconItems, field);
                    // Combinar correcta + incorrectas
                    const allOptions = [q.answer, ...wrongOptions];
                     // Asegurar que las opciones sean únicas (por si acaso)
                    const uniqueOptions = Array.from(new Set(allOptions));
                    // Barajar y tomar máximo 4 opciones
                    q.options = shuffleArray(uniqueOptions.slice(0, 4));
                } else {
                    // Fallback si algo falla (no debería pasar con las validaciones previas)
                    q.options = [q.answer];
                    console.warn("No se pudieron generar opciones MC para:", q);
                }
                // Validar que tengamos al menos 2 opciones para MC
                if (q.options.length < 2) {
                    console.warn("Pregunta MC generada con menos de 2 opciones:", q);
                    // Podríamos intentar regenerarla o marcarla como inválida, por ahora solo advertencia
                }
            }
        });

        // Filtrar cualquier pregunta que haya quedado inválida (ej. MC sin opciones suficientes)
         const validFinalQuestions = finalQuestions.filter(q => !q.type.startsWith('MC_') || (q.options && q.options.length >= 2));

        console.log("[Quiz] Preguntas generadas:", validFinalQuestions);
        return validFinalQuestions;
     }

    function startQuiz(isRetry = false) {
         quizActive = true; score = 0; currentQuestionIndex = 0; // Resetear estado

         if (!isRetry) { // Si es un quiz nuevo
             const selectedLength = quizLengthSelect.value;
             allQuizQuestions = generateQuizQuestions(selectedLength); // Generar nuevas preguntas
             currentQuizSet = allQuizQuestions; // Usar el set completo generado
             missedQuestions = []; // Resetear preguntas falladas
         } else { // Si es reintento de falladas
             currentQuizSet = shuffleArray([...missedQuestions]); // Usar las falladas como set actual
             missedQuestions = []; // Resetear para el nuevo intento
             if (currentQuizSet.length === 0) {
                 alert("¡Felicidades! No hubo preguntas falladas en la ronda anterior.");
                 resetQuizView(); // Volver a la vista de setup
                 return;
             }
             console.log("[Quiz] Reintentando preguntas falladas:", currentQuizSet);
         }

        // Verificar si se pudieron generar preguntas o si hay preguntas para reintentar
         if (!currentQuizSet || currentQuizSet.length === 0) {
             console.log("[Quiz] No hay preguntas para iniciar.");
             if(quizQuestionArea) quizQuestionArea.style.display = 'none';
             if(quizSetup) quizSetup.style.display = 'block';
             if(quizResultsEl) quizResultsEl.style.display = 'none';
             if(retryMissedQuizBtn) retryMissedQuizBtn.style.display = 'none';
             // Mostrar error si existía desde la generación
             if(quizDataErrorEl) {
                 quizDataErrorEl.style.display = quizDataErrorEl.textContent ? 'block' : 'none';
                 if (!quizDataErrorEl.textContent) { // Poner mensaje genérico si no había uno específico
                      quizDataErrorEl.textContent = "No se pudieron generar preguntas.";
                      quizDataErrorEl.style.display = 'block';
                 }
             }
             quizActive = false;
             return; // Salir si no hay preguntas
         }

         // Ocultar/Mostrar secciones correspondientes
         if(quizSetup) quizSetup.style.display = 'none';
         if(quizResultsEl) quizResultsEl.style.display = 'none';
         if(retryMissedQuizBtn) retryMissedQuizBtn.style.display = 'none'; // Ocultar botón reintentar
         if(quizQuestionArea) quizQuestionArea.style.display = 'block';
         if(nextQuestionBtn) nextQuestionBtn.style.display = 'none'; // Ocultar botón siguiente inicialmente
         if(quizDataErrorEl) quizDataErrorEl.style.display = 'none'; // Ocultar mensaje de error

         displayQuestion(); // Mostrar la primera pregunta
     }

    function displayQuestion() {
        // Si ya no hay más preguntas, mostrar resultados
        if (currentQuestionIndex >= currentQuizSet.length) {
            showResults();
            return;
        }

        quizActive = true; // Activar quiz para recibir respuesta
        const q = currentQuizSet[currentQuestionIndex]; // Obtener pregunta actual

        // Validar que la pregunta tenga la estructura mínima necesaria
        if (!q || !q.type || !q.question || typeof q.answer === 'undefined') {
            console.error("[Quiz Error] Pregunta inválida encontrada en el índice:", currentQuestionIndex, q);
            goToNextQuestion(); // Saltar a la siguiente pregunta si esta es inválida
            return;
        }

        // Resetear elementos de la UI antes de mostrar la nueva pregunta
        if(quizQuestionEl) quizQuestionEl.textContent = q.question;
        if(quizImageContainer) quizImageContainer.innerHTML = ''; // Limpiar contenedor de imagen
        if(quizOptionsEl) { quizOptionsEl.innerHTML = ''; quizOptionsEl.style.display = 'none'; } // Limpiar y ocultar opciones MC
        if(quizTextInputArea) quizTextInputArea.style.display = 'none'; // Ocultar input de texto
        if(quizTextAnswerInput) { quizTextAnswerInput.value = ''; quizTextAnswerInput.className = ''; quizTextAnswerInput.disabled = false; } // Limpiar, resetear clase y habilitar input texto
        if(submitTextAnswerBtn) submitTextAnswerBtn.disabled = false; // Habilitar botón de texto
        if(quizFeedbackEl) { quizFeedbackEl.textContent = ''; quizFeedbackEl.className = ''; } // Limpiar feedback
        if(nextQuestionBtn) nextQuestionBtn.style.display = 'none'; // Ocultar botón siguiente

        // Mostrar imagen si existe en la pregunta
        if (q.image && quizImageContainer) {
            const img = document.createElement('img');
            img.src = q.image;
            img.alt = `Imagen para la pregunta`;
            img.loading = 'lazy';
            img.onerror = function() {
                console.error(`[Quiz Error] Imagen no cargada: ${this.src}`);
                this.alt = 'Error al cargar imagen';
                this.src='images/placeholder.png'; // Mostrar placeholder en caso de error
            };
            quizImageContainer.appendChild(img);
        }

        // Configurar UI según el tipo de pregunta
        if (q.type.startsWith('MC_') && quizOptionsEl) { // Opción Múltiple
            quizOptionsEl.style.display = 'block'; // Mostrar contenedor de opciones
            if (!q.options || q.options.length < 2) { // Validar que haya opciones
                console.error("[Quiz Error] Pregunta MC sin opciones suficientes:", q);
                quizOptionsEl.innerHTML = '<p style="color:var(--error-red);">Error: Opciones no disponibles.</p>';
                quizActive = false; // Desactivar para evitar interacción rota
                if(nextQuestionBtn) nextQuestionBtn.style.display = 'inline-block'; // Permitir saltar
            } else {
                // Crear y añadir botones de opción
                q.options.forEach(option => {
                    const button = document.createElement('button');
                    button.textContent = option;
                    button.disabled = false; // Asegurar que estén habilitados
                    button.addEventListener('click', handleMCAnswer);
                    quizOptionsEl.appendChild(button);
                });
            }
        } else if (q.type.startsWith('TXT_') && quizTextInputArea && quizTextAnswerInput && submitTextAnswerBtn) { // Input de Texto
            quizTextInputArea.style.display = 'flex'; // Mostrar área de input
             // Enfocar el input para facilitar escritura
             setTimeout(() => {
                 if (quizTextAnswerInput) quizTextAnswerInput.focus();
             }, 100); // Pequeño delay para asegurar que esté visible
        }
    }

    function handleMCAnswer(event) {
        if (!quizActive || !quizOptionsEl || !quizFeedbackEl || !nextQuestionBtn) return; // Salir si no está activo o faltan elementos

        quizActive = false; // Desactivar para evitar doble respuesta
        const selectedButton = event.target;
        const selectedAnswer = selectedButton.textContent;
        const currentQuestion = currentQuizSet[currentQuestionIndex];

        if (!currentQuestion || typeof currentQuestion.answer === 'undefined') {
            console.error("[Quiz Error] MCAnswer: Pregunta o respuesta correcta inválida.");
            goToNextQuestion();
            return;
        }

        const correctAnswer = currentQuestion.answer;
        const optionButtons = quizOptionsEl.querySelectorAll('button');

        // Deshabilitar todos los botones de opción
        optionButtons.forEach(btn => btn.disabled = true);

        // Comparar respuesta seleccionada con la correcta
        if (selectedAnswer === correctAnswer) {
            // Respuesta Correcta
            score++;
            selectedButton.classList.add('correct');
            quizFeedbackEl.textContent = '¡Correcto!';
            quizFeedbackEl.className = 'correct';
        } else {
            // Respuesta Incorrecta
            selectedButton.classList.add('incorrect');
            quizFeedbackEl.innerHTML = `Incorrecto. La respuesta correcta es: <strong>${correctAnswer}</strong>`;
            quizFeedbackEl.className = 'incorrect';
            // Añadir a preguntas falladas (si tiene item asociado y no está ya en la lista)
            if (currentQuestion.item && !missedQuestions.some(mq => mq.item.id === currentQuestion.item.id)) {
                 // Copia profunda para evitar modificaciones accidentales
                missedQuestions.push(JSON.parse(JSON.stringify(currentQuestion)));
            }
            // Resaltar la respuesta correcta
            optionButtons.forEach(btn => {
                if (btn.textContent === correctAnswer) {
                    btn.classList.add('correct');
                }
            });
        }

        // Mostrar botón para ir a la siguiente pregunta
        nextQuestionBtn.style.display = 'inline-block';
    }

    function handleTextAnswer() {
         if (!quizActive || !quizTextAnswerInput || !submitTextAnswerBtn || !quizFeedbackEl || !nextQuestionBtn) return;

         quizActive = false; // Desactivar
         const currentQuestion = currentQuizSet[currentQuestionIndex];

         if (!currentQuestion || typeof currentQuestion.answer === 'undefined') {
             console.error("[Quiz Error] TextAnswer: Pregunta o respuesta correcta inválida.");
             goToNextQuestion();
             return;
         }

         // Obtener y normalizar respuestas
         const userAnswer = normalizeAnswer(quizTextAnswerInput.value);
         const correctAnswer = normalizeAnswer(currentQuestion.answer); // Normalizar la correcta para comparar
         const originalCorrectAnswer = currentQuestion.answer; // Guardar la original para mostrarla

         // Deshabilitar input y botón
         quizTextAnswerInput.disabled = true;
         submitTextAnswerBtn.disabled = true;

         // Comparar respuestas normalizadas
         if (userAnswer === correctAnswer && userAnswer !== '') { // Asegurar que no esté vacía
             // Respuesta Correcta
             score++;
             quizTextAnswerInput.classList.add('correct');
             quizFeedbackEl.textContent = '¡Correcto!';
             quizFeedbackEl.className = 'correct';
         } else {
             // Respuesta Incorrecta
             quizTextAnswerInput.classList.add('incorrect');
             quizFeedbackEl.innerHTML = `Incorrecto. La respuesta correcta es: <strong>${originalCorrectAnswer}</strong>`;
             quizFeedbackEl.className = 'incorrect';
             // Añadir a preguntas falladas
             if (currentQuestion.item && !missedQuestions.some(mq => mq.item.id === currentQuestion.item.id)) {
                 missedQuestions.push(JSON.parse(JSON.stringify(currentQuestion)));
             }
         }

         // Mostrar botón siguiente
         nextQuestionBtn.style.display = 'inline-block';
     }

    function goToNextQuestion() {
        currentQuestionIndex++; // Avanzar al siguiente índice
        // Usar setTimeout para permitir que el navegador refresque la UI antes de mostrar la siguiente pregunta
        setTimeout(displayQuestion, 50);
    }

    function showResults() {
        if(quizQuestionArea) quizQuestionArea.style.display = 'none'; // Ocultar área de preguntas
        if(quizResultsEl) quizResultsEl.style.display = 'block'; // Mostrar área de resultados
        if(quizScoreEl) quizScoreEl.textContent = score; // Mostrar puntaje
        if(quizTotalEl && currentQuizSet) quizTotalEl.textContent = currentQuizSet.length; // Mostrar total

        quizActive = false; // Marcar quiz como inactivo

        // Decidir si mostrar el botón de reintentar falladas
        const wasMainQuizRound = (currentQuizSet === allQuizQuestions); // Verificar si era la ronda principal
        if (missedQuestions.length > 0 && wasMainQuizRound && retryMissedQuizBtn) {
            retryMissedQuizBtn.style.display = 'inline-block'; // Mostrar botón
        } else if(retryMissedQuizBtn) {
            retryMissedQuizBtn.style.display = 'none'; // Ocultar botón
        }
    }

    function resetQuizView() {
        quizActive = false;
        allQuizQuestions = []; // Limpiar preguntas generadas
        currentQuizSet = []; // Limpiar set actual
        missedQuestions = []; // Limpiar falladas
        score = 0;
        currentQuestionIndex = 0;

        // Resetear UI a la vista inicial de Setup
        if(quizSetup) quizSetup.style.display = 'block';
        if(quizQuestionArea) quizQuestionArea.style.display = 'none';
        if(quizResultsEl) quizResultsEl.style.display = 'none';
        if(retryMissedQuizBtn) retryMissedQuizBtn.style.display = 'none';
        if(quizDataErrorEl) quizDataErrorEl.style.display = 'none';
        if(quizImageContainer) quizImageContainer.innerHTML = '';
        if(quizFeedbackEl) { quizFeedbackEl.textContent = ''; quizFeedbackEl.className = ''; }
        if(quizOptionsEl) quizOptionsEl.innerHTML = '';
        if(quizTextAnswerInput) { quizTextAnswerInput.value = ''; quizTextAnswerInput.className = ''; }
        if(quizQuestionEl) quizQuestionEl.textContent = '';
        if(quizLengthSelect) quizLengthSelect.value = "5"; // Resetear selección de longitud

        console.log("[Quiz] Vista reseteada.");
    }

    function setupQuizControls() {
        // Verificar existencia de elementos clave
        if (!startQuizBtn || !nextQuestionBtn || !restartQuizBtn || !retryMissedQuizBtn || !submitTextAnswerBtn || !quizTextAnswerInput || !quizLengthSelect) {
            console.error("[Quiz Error] Faltan elementos de control del Quiz en el DOM.");
            return;
        }
        // Añadir listeners
        startQuizBtn.addEventListener('click', () => startQuiz(false)); // Iniciar nuevo quiz
        nextQuestionBtn.addEventListener('click', goToNextQuestion); // Ir a siguiente pregunta
        restartQuizBtn.addEventListener('click', resetQuizView); // Volver a empezar (setup)
        retryMissedQuizBtn.addEventListener('click', () => startQuiz(true)); // Reintentar falladas
        submitTextAnswerBtn.addEventListener('click', handleTextAnswer); // Enviar respuesta de texto
        // Permitir enviar respuesta de texto con Enter
        quizTextAnswerInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' && !submitTextAnswerBtn.disabled) { // Solo si el botón no está deshabilitado
                handleTextAnswer();
            }
        });
    }
    // =============================================
    // ========= FIN SECCIÓN QUIZ ==================
    // =============================================


    // =============================================
    // ========= SECCIÓN FLASHCARDS ================
    // =============================================

    function prepareFlashcardData() {
        if (flashcardsLoadingEl) flashcardsLoadingEl.style.display = 'block';
        if (flashcardAreaEl) flashcardAreaEl.style.display = 'none';
        if (flashcardsErrorEl) flashcardsErrorEl.style.display = 'none';

        // Filtrar lexiconData para asegurar que tenemos lo necesario (raramuri Y (español O imagen))
        const validLexicon = lexiconData.filter(item => item && item.raramuri && (item.spanish || item.image));
        console.log(`[Flashcards] Datos léxicos válidos para flashcards: ${validLexicon.length}`);

        if (validLexicon.length === 0) {
            if (flashcardsErrorEl) {
                flashcardsErrorEl.textContent = 'No hay suficientes datos en el léxico para las flashcards.';
                flashcardsErrorEl.style.display = 'block';
            }
            if (flashcardsLoadingEl) flashcardsLoadingEl.style.display = 'none';
            flashcardData = []; // Asegurarse que esté vacío
            return false; // Indicar fallo
        }

        flashcardData = shuffleArray([...validLexicon]); // Crear copia barajada
        currentFlashcardIndex = 0; // Empezar desde el principio
        isFlashcardFlipped = false; // Tarjeta empieza sin voltear

        if (flashcardsLoadingEl) flashcardsLoadingEl.style.display = 'none';
        if (flashcardAreaEl) flashcardAreaEl.style.display = 'block'; // Mostrar área de tarjeta
        return true; // Indicar éxito
    }

    function displayCurrentFlashcard() {
        // Salir si no hay datos o el área no es visible
        if (!flashcardData || flashcardData.length === 0 || !flashcardAreaEl || flashcardAreaEl.style.display === 'none') {
            console.log("[Flashcards] No hay datos o área no visible, no se muestra tarjeta.");
            return;
        }
        // Validar índice (aunque los controles deberían prevenir esto)
        if (currentFlashcardIndex < 0 || currentFlashcardIndex >= flashcardData.length) {
            console.error(`[Flashcards] Índice inválido: ${currentFlashcardIndex}. Reseteando a 0.`);
            currentFlashcardIndex = 0;
        }

        const cardData = flashcardData[currentFlashcardIndex];
        if (!cardData) {
            console.error(`[Flashcards] Error: No se encontraron datos para el índice ${currentFlashcardIndex}`);
            if (flashcardsErrorEl) {
                flashcardsErrorEl.textContent = 'Error al cargar datos de la tarjeta.';
                flashcardsErrorEl.style.display = 'block';
                flashcardAreaEl.style.display = 'none'; // Ocultar área si hay error grave
            }
            return;
        }

        // Resetear estado visual de la tarjeta (asegurar que no esté volteada)
        if (flashcardEl) flashcardEl.classList.remove('flipped');
        isFlashcardFlipped = false;

        // Poblar Cara Frontal (Imagen > Español > Placeholder)
        if (flashcardFrontEl) {
             flashcardFrontEl.innerHTML = ''; // Limpiar contenido anterior
            if (cardData.image) {
                const img = document.createElement('img');
                img.src = cardData.image;
                img.alt = cardData.spanish || 'Flashcard Image'; // Alt text descriptivo
                img.loading = 'lazy';
                img.onerror = function() { this.alt='Error img'; this.src='images/placeholder.png'; };
                flashcardFrontEl.appendChild(img);
                // Añadir texto español debajo si existe
                if (cardData.spanish) {
                    const p = document.createElement('p');
                    p.textContent = cardData.spanish;
                    // Estilo aplicado directamente o preferiblemente con CSS
                    p.style.fontSize = '0.8em';
                    p.style.marginTop = 'var(--space-sm)';
                    p.style.color = 'var(--text-secondary)'; // Texto secundario
                    flashcardFrontEl.appendChild(p);
                }
            } else if (cardData.spanish) {
                flashcardFrontEl.textContent = cardData.spanish;
            } else {
                 flashcardFrontEl.textContent = '???'; // Si no hay ni imagen ni español
            }
        }

        // Poblar Cara Trasera (Rarámuri)
        if (flashcardBackEl) {
            flashcardBackEl.textContent = cardData.raramuri || '???'; // Mostrar Rarámuri o placeholder
        }

        // Actualizar Contador
        if (flashcardCounterEl) {
            flashcardCounterEl.textContent = `Tarjeta ${currentFlashcardIndex + 1} de ${flashcardData.length}`;
        }
    }

    function flipFlashcard() {
        if (!flashcardEl) return;
        flashcardEl.classList.toggle('flipped'); // Alternar clase para animación CSS
        isFlashcardFlipped = !isFlashcardFlipped; // Actualizar estado
    }

    function nextFlashcard() {
        if (!flashcardData || flashcardData.length === 0) return; // No hacer nada si no hay datos
        currentFlashcardIndex++;
        if (currentFlashcardIndex >= flashcardData.length) {
            currentFlashcardIndex = 0; // Volver al principio (loop)
        }
        displayCurrentFlashcard(); // Mostrar la nueva tarjeta
    }

    function prevFlashcard() {
        if (!flashcardData || flashcardData.length === 0) return; // No hacer nada si no hay datos
        currentFlashcardIndex--;
        if (currentFlashcardIndex < 0) {
            currentFlashcardIndex = flashcardData.length - 1; // Ir al final (loop)
        }
        displayCurrentFlashcard(); // Mostrar la nueva tarjeta
    }

     function shuffleFlashcards() {
         console.log("[Flashcards] Barajando tarjetas...");
         if (prepareFlashcardData()) { // Repreparar y barajar datos
             displayCurrentFlashcard(); // Mostrar la nueva primera tarjeta
         }
     }


    function setupFlashcardsControls() {
        // Verificar elementos
        if (!flashcardEl || !prevFlashcardBtn || !flipFlashcardBtn || !nextFlashcardBtn || !shuffleFlashcardsBtn) {
            console.error("Faltan elementos de control de Flashcards en el DOM.");
            return;
        }
        // Añadir listeners
        flashcardEl.addEventListener('click', flipFlashcard); // Voltear al hacer clic en la tarjeta
        flipFlashcardBtn.addEventListener('click', flipFlashcard);
        nextFlashcardBtn.addEventListener('click', nextFlashcard);
        prevFlashcardBtn.addEventListener('click', prevFlashcard);
        shuffleFlashcardsBtn.addEventListener('click', shuffleFlashcards);
    }

     // Inicializa la vista de flashcards, prepara datos si es necesario
     function initializeFlashcardsView() {
         console.log("[Flashcards] Inicializando vista/datos...");
         // Siempre intentar preparar/re-barajar datos al entrar a la sección? O solo si está vacío?
         // Opción 1: Siempre re-barajar al entrar
         // if(prepareFlashcardData()){
         //      displayCurrentFlashcard();
         // }

         // Opción 2: Preparar solo si está vacío, sino mostrar la actual
         if (flashcardData.length === 0) {
            if(prepareFlashcardData()){ // Prepara si no hay datos
                 displayCurrentFlashcard();
            }
         } else {
             displayCurrentFlashcard(); // Muestra la que estaba si ya hay datos
         }
     }

    // =============================================
    // ========= FIN SECCIÓN FLASHCARDS ============
    // =============================================


    // --- Inicialización App ---
    function initializeApplication() {
        // Verificar elementos esenciales del DOM
        if (!mainContentEl || !navButtons || !contentSections || !lexiconGrid || !phrasesList || !memoramaGrid || !quizContainer || !flashcardsContainer ) {
            console.error("Error Crítico: Faltan elementos HTML esenciales para inicializar la aplicación.");
            if(errorMessageEl) {
                 errorMessageEl.textContent = "Error: Faltan elementos HTML esenciales. Revisa la estructura de index.html.";
                 errorMessageEl.style.display = 'block';
            }
             if(loadingMessageEl) loadingMessageEl.style.display = 'none';
             if(mainContentEl) mainContentEl.style.display = 'none';
            return; // Detener inicialización
        }

        setupNavigation(); // Configurar navegación entre secciones
        displayLexiconItems(lexiconData); // Mostrar léxico inicial
        populatePhrases(); // Mostrar frases iniciales
        setupSearch(); // Configurar búsqueda de léxico
        setupMemoramaControls(); // Configurar controles de Memorama
        setupQuizControls(); // Configurar controles de Quiz
        setupFlashcardsControls(); // Configurar controles de Flashcards

        console.log("Aplicación inicializada correctamente.");
    }

    // --- Punto de Entrada ---
    loadData(); // Iniciar carga de datos al cargar el script

}); // Fin DOMContentLoaded
// --- END OF FILE script.js ---
