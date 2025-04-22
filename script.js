// script.js

document.addEventListener('DOMContentLoaded', () => {

    // --- DECLARACIÓN DE VARIABLES PARA DATOS ---
    let lexiconData = [];
    let phrasesData = [];
    let currentCategoryFilter = 'all'; // Variable para filtro de categoría

    // --- ELEMENTOS DEL DOM ---
    const loadingMessageEl = document.getElementById('loading-message');
    const errorMessageEl = document.getElementById('error-message');
    const mainContentEl = document.getElementById('main-content');
    const navButtons = document.querySelectorAll('nav button');
    const contentSections = document.querySelectorAll('.content-section');
    const lexiconGrid = document.getElementById('lexicon-grid');
    const lexiconSearchInput = document.getElementById('lexicon-search');
    const phrasesList = document.getElementById('phrases-list');
    const categoryFiltersContainer = document.getElementById('category-filters'); // Contenedor para filtros

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
            loadingMessageEl.style.display = 'block';
            errorMessageEl.style.display = 'none';
            mainContentEl.style.display = 'none';

            const response = await fetch('data.json', { cache: 'no-cache' });
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            const data = await response.json();
            if (!data || typeof data !== 'object') throw new Error("JSON inválido.");
            lexiconData = Array.isArray(data.lexicon) ? data.lexicon : [];
            phrasesData = Array.isArray(data.phrases) ? data.phrases : [];
            console.log("Datos cargados:", { lexicon: lexiconData.length, phrases: phrasesData.length });

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
                else if (sectionId === 'flashcards') initializeFlashcardsView();

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

    // =============================================
    // ========= SECCIÓN LÉXICO (con filtros) ======
    // =============================================

    // Obtener categorías únicas del léxico
    function getUniqueCategories(data) {
        const categories = new Set();
        data.forEach(item => {
            if (item.category && item.category.trim() !== '') {
                categories.add(item.category.trim());
            }
        });
        return ['all', ...Array.from(categories).sort()];
    }

    // Crear y mostrar los botones de filtro de categoría
    function populateCategoryFilters() {
        if (!categoryFiltersContainer || !lexiconData) {
            console.warn("Contenedor de filtros o datos de léxico no disponibles.");
            if(categoryFiltersContainer) categoryFiltersContainer.innerHTML = '';
            return;
        }

        const uniqueCategories = getUniqueCategories(lexiconData);
        categoryFiltersContainer.innerHTML = '';

        if (uniqueCategories.length <= 1) {
             console.log("No hay categorías definidas para mostrar filtros.");
             categoryFiltersContainer.style.display = 'none';
             return;
        }
         categoryFiltersContainer.style.display = 'flex';

        uniqueCategories.forEach(category => {
            const button = document.createElement('button');
            button.textContent = category === 'all' ? 'Todos' : category;
            button.dataset.category = category;
            button.classList.add('category-filter-btn');

            if (category === currentCategoryFilter) {
                button.classList.add('active');
            }

            button.addEventListener('click', handleCategoryFilterClick);
            categoryFiltersContainer.appendChild(button);
        });
    }

    // Manejar el clic en un botón de filtro de categoría
    function handleCategoryFilterClick(event) {
        currentCategoryFilter = event.target.dataset.category;

        document.querySelectorAll('.category-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        // Volver a filtrar y mostrar
        filterAndDisplayLexicon();
    }

    // Mostrar los items del léxico en el grid
    function displayLexiconItems(itemsToShow) {
        if (!lexiconGrid) return;
        lexiconGrid.innerHTML = '';
        if (!itemsToShow || itemsToShow.length === 0) {
             const message = (lexiconSearchInput && lexiconSearchInput.value) || currentCategoryFilter !== 'all'
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
                <img src="${imgSrc}" alt="${spanishText || raramuriText}" loading="lazy" onerror="this.onerror=null; this.src='images/placeholder.png'; this.alt='Error al cargar: ${raramuriText}'; this.parentElement.querySelector('.img-error-msg')?.remove(); this.parentElement.insertAdjacentHTML('beforeend', '<p class=\'img-error-msg\' style=\'font-size:0.8em; color:var(--error-red);\'>Error Img</p>');">
                <p class="raramuri-word">${raramuriText}</p>
                <p class="spanish-word">${spanishText}</p>`;
            lexiconGrid.appendChild(div);
        });
    }

    // Filtrar léxico por categoría y búsqueda, y luego mostrar
    function filterAndDisplayLexicon() {
        if (!lexiconData) return;

        const searchTerm = lexiconSearchInput ? lexiconSearchInput.value.toLowerCase().trim() : '';
        let filteredItems = lexiconData;

        // 1. Filtrar por Categoría
        if (currentCategoryFilter !== 'all') {
            filteredItems = filteredItems.filter(item => item.category === currentCategoryFilter);
        }

        // 2. Filtrar por Término de Búsqueda
        if (searchTerm) {
            filteredItems = filteredItems.filter(item =>
                ((item.raramuri || '').toLowerCase().includes(searchTerm) ||
                 (item.spanish || '').toLowerCase().includes(searchTerm))
            );
        }

        displayLexiconItems(filteredItems);
    }

    // Configurar el input de búsqueda
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
        faceElement.innerHTML = '';
        try {
            if (cardInfo.type === 'image' && cardInfo.value) {
                const img = document.createElement('img');
                img.src = cardInfo.value;
                img.alt = cardInfo.altText || "Imagen Memorama";
                img.loading = 'lazy';
                img.onerror = function() {
                    console.error(`[Memorama Critico] Falló carga IMG: ${this.src} (ID: ${cardInfo.id})`);
                    this.style.display = 'none';
                    const errorP = document.createElement('p'); errorP.textContent = 'Error Img!'; errorP.style.color = 'red'; errorP.style.fontSize = '10px';
                    faceElement.appendChild(errorP);
                };
                faceElement.appendChild(img);
            } else if (cardInfo.type === 'text' && cardInfo.value) {
                const textP = document.createElement('p');
                textP.textContent = cardInfo.value;
                faceElement.appendChild(textP);
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
             if (memoramaGameArea) memoramaGameArea.style.display = 'none';
             if (memoramaSetup) memoramaSetup.style.display = 'block';
             difficultyButtons.forEach(btn => btn.classList.remove('selected'));
            return null;
        }
        if (memoramaDataErrorEl) memoramaDataErrorEl.style.display = 'none';
        return shuffleArray(validItems).slice(0, requestedPairs);
    }

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

    function startMemorama(numPairs) {
        console.log(`[Memorama] Iniciando startMemorama con ${numPairs} pares.`);
        resetMemoramaView();
        const itemsForGame = prepareCardData(numPairs);

        if (!itemsForGame) {
            memoramaActive = false;
            return;
        }

        mTotalPairs = itemsForGame.length;
        memoramaActive = true;
        mCards = [];
        mAttempts = 0;
        mMatchedPairsCount = 0;
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
        console.log(`[Memorama] Juego listo con ${mTotalPairs} pares.`);
    }

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

    function checkMemoramaMatch() {
        const [card1, card2] = mFlippedElements;

        if (!card1 || !card2) {
            console.error("[Memorama Critico] Faltan cartas en checkMemoramaMatch.");
            mFlippedElements = [];
            mLockBoard = false;
            return;
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

    function setupMemoramaControls() {
        if (!memoramaSetup || !resetMemoramaBtn || difficultyButtons.length === 0) {
            console.error("[Memorama Critico] Faltan elementos HTML para controles de Memorama.");
            return;
        }
        difficultyButtons.forEach(button => {
            button.addEventListener('click', () => {
                const pairs = parseInt(button.getAttribute('data-pairs'));
                if (isNaN(pairs) || pairs <= 0) {
                    console.error("[Memorama Error] Atributo data-pairs inválido:", button);
                    return;
                }
                difficultyButtons.forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');
                startMemorama(pairs);
            });
        });
        resetMemoramaBtn.addEventListener('click', () => {
            const selectedBtn = document.querySelector('#memorama-setup .difficulty-btn.selected');
            if (selectedBtn) {
                const pairs = parseInt(selectedBtn.getAttribute('data-pairs'));
                if (!isNaN(pairs) && pairs > 0) { startMemorama(pairs); }
                else { resetMemoramaView(); }
            } else { resetMemoramaView(); }
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
         const wrongAnswerPool = sourceData.filter(item =>
             item && item.id !== correctItem.id && item[field] &&
             normalizeAnswer(item[field]) !== correctValueNorm
         );
         const shuffledWrongs = shuffleArray([...wrongAnswerPool]);
         let options = new Set();
         for (const item of shuffledWrongs) {
             if (options.size >= count) break; options.add(item[field]);
         }
         let attempts = 0; const maxAttempts = sourceData.length * 2;
         while (options.size < count && attempts < maxAttempts) {
             const randomItem = sourceData[Math.floor(Math.random() * sourceData.length)];
             if (randomItem && randomItem.id !== correctItem.id && randomItem[field]) {
                  const potentialOption = randomItem[field];
                  if (normalizeAnswer(potentialOption) !== correctValueNorm) { options.add(potentialOption); }
             }
             attempts++;
         }
         return Array.from(options);
     }
    function generateQuizQuestions(numQuestions) {
         const availableLexiconItems = lexiconData.filter(item => item && item.raramuri && item.spanish && item.id);
         const availableImageItems = availableLexiconItems.filter(item => item.image);
        if (availableLexiconItems.length < 2) {
            console.error("Quiz: Se necesitan al menos 2 entradas léxicas completas.");
            if(quizDataErrorEl) { quizDataErrorEl.textContent = "Datos insuficientes (mínimo 2 entradas léxicas completas)."; quizDataErrorEl.style.display = 'block'; }
            return [];
        } else { if(quizDataErrorEl) quizDataErrorEl.style.display = 'none'; }
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
        const shuffledPotentialQuestions = shuffleArray(potentialQuestions); let questionsToGenerate = 0; const totalPotential = shuffledPotentialQuestions.length;
        if (numQuestions === 'all') { questionsToGenerate = totalPotential; } else { questionsToGenerate = Math.min(parseInt(numQuestions), totalPotential); }
        questionsToGenerate = Math.max(1, questionsToGenerate); if (totalPotential === 0) return [];
        const finalQuestions = shuffledPotentialQuestions.slice(0, questionsToGenerate);
        finalQuestions.forEach(q => {
            if (q.type.startsWith('MC_')) {
                let wrongOptions = []; let field = ''; let correctLexiconItem = q.item;
                if (q.type === 'MC_RaSp') field = 'spanish'; else if (q.type === 'MC_SpRa' || q.type === 'MC_ImgRa') field = 'raramuri';
                if (field && correctLexiconItem) { wrongOptions = getWrongOptions(correctLexiconItem, 3, availableLexiconItems, field); const allOptions = [q.answer, ...wrongOptions]; const uniqueOptions = Array.from(new Set(allOptions)); q.options = shuffleArray(uniqueOptions.slice(0, 4)); }
                else { q.options = [q.answer]; console.warn("No se generaron opciones MC:", q); }
                if (q.options.length < 2) console.warn("Pregunta MC < 2 opciones:", q);
            }
        });
         const validFinalQuestions = finalQuestions.filter(q => !q.type.startsWith('MC_') || (q.options && q.options.length >= 2));
        console.log("[Quiz] Preguntas generadas:", validFinalQuestions); return validFinalQuestions;
     }
    function startQuiz(isRetry = false) {
         quizActive = true; score = 0; currentQuestionIndex = 0;
         if (!isRetry) { const selectedLength = quizLengthSelect.value; allQuizQuestions = generateQuizQuestions(selectedLength); currentQuizSet = allQuizQuestions; missedQuestions = []; }
         else { currentQuizSet = shuffleArray([...missedQuestions]); missedQuestions = []; if (currentQuizSet.length === 0) { alert("¡Felicidades! No hubo preguntas falladas."); resetQuizView(); return; } console.log("[Quiz] Reintentando:", currentQuizSet); }
         if (!currentQuizSet || currentQuizSet.length === 0) { console.log("[Quiz] No preguntas."); if(quizQuestionArea) quizQuestionArea.style.display = 'none'; if(quizSetup) quizSetup.style.display = 'block'; if(quizResultsEl) quizResultsEl.style.display = 'none'; if(retryMissedQuizBtn) retryMissedQuizBtn.style.display = 'none'; if(quizDataErrorEl) { quizDataErrorEl.style.display = quizDataErrorEl.textContent ? 'block' : 'none'; if (!quizDataErrorEl.textContent) { quizDataErrorEl.textContent = "No preguntas."; quizDataErrorEl.style.display = 'block'; } } quizActive = false; return; }
         if(quizSetup) quizSetup.style.display = 'none'; if(quizResultsEl) quizResultsEl.style.display = 'none'; if(retryMissedQuizBtn) retryMissedQuizBtn.style.display = 'none'; if(quizQuestionArea) quizQuestionArea.style.display = 'block'; if(nextQuestionBtn) nextQuestionBtn.style.display = 'none'; if(quizDataErrorEl) quizDataErrorEl.style.display = 'none';
         displayQuestion();
     }
    function displayQuestion() {
        if (currentQuestionIndex >= currentQuizSet.length) { showResults(); return; }
        quizActive = true; const q = currentQuizSet[currentQuestionIndex];
        if (!q || !q.type || !q.question || typeof q.answer === 'undefined') { console.error("[Quiz Error] Pregunta inválida:", q); goToNextQuestion(); return; }
        if(quizQuestionEl) quizQuestionEl.textContent = q.question; if(quizImageContainer) quizImageContainer.innerHTML = ''; if(quizOptionsEl) { quizOptionsEl.innerHTML = ''; quizOptionsEl.style.display = 'none'; } if(quizTextInputArea) quizTextInputArea.style.display = 'none'; if(quizTextAnswerInput) { quizTextAnswerInput.value = ''; quizTextAnswerInput.className = ''; quizTextAnswerInput.disabled = false; } if(submitTextAnswerBtn) submitTextAnswerBtn.disabled = false; if(quizFeedbackEl) { quizFeedbackEl.textContent = ''; quizFeedbackEl.className = ''; } if(nextQuestionBtn) nextQuestionBtn.style.display = 'none';
        if (q.image && quizImageContainer) { const img = document.createElement('img'); img.src = q.image; img.alt = `Imagen pregunta`; img.loading = 'lazy'; img.onerror = function() { console.error(`[Quiz Error] IMG no cargada: ${this.src}`); this.alt = 'Error img'; this.src='images/placeholder.png'; }; quizImageContainer.appendChild(img); }
        if (q.type.startsWith('MC_') && quizOptionsEl) {
            quizOptionsEl.style.display = 'block';
            if (!q.options || q.options.length < 2) { console.error("[Quiz Error] MC sin opciones:", q); quizOptionsEl.innerHTML = '<p style="color:var(--error-red);">Error opciones.</p>'; quizActive = false; if(nextQuestionBtn) nextQuestionBtn.style.display = 'inline-block'; }
            else { q.options.forEach(option => { const button = document.createElement('button'); button.textContent = option; button.disabled = false; button.addEventListener('click', handleMCAnswer); quizOptionsEl.appendChild(button); }); }
        } else if (q.type.startsWith('TXT_') && quizTextInputArea && quizTextAnswerInput && submitTextAnswerBtn) {
            quizTextInputArea.style.display = 'flex'; setTimeout(() => { if (quizTextAnswerInput) quizTextAnswerInput.focus(); }, 100);
        }
    }
    function handleMCAnswer(event) {
        if (!quizActive || !quizOptionsEl || !quizFeedbackEl || !nextQuestionBtn) return;
        quizActive = false; const selectedButton = event.target; const selectedAnswer = selectedButton.textContent; const currentQuestion = currentQuizSet[currentQuestionIndex];
        if (!currentQuestion || typeof currentQuestion.answer === 'undefined') { console.error("[Quiz Error] MCAnswer: Pregunta/Resp inválida."); goToNextQuestion(); return; }
        const correctAnswer = currentQuestion.answer; const optionButtons = quizOptionsEl.querySelectorAll('button');
        optionButtons.forEach(btn => btn.disabled = true);
        if (selectedAnswer === correctAnswer) {
            score++; selectedButton.classList.add('correct'); quizFeedbackEl.textContent = '¡Correcto!'; quizFeedbackEl.className = 'correct';
        } else {
            selectedButton.classList.add('incorrect'); quizFeedbackEl.innerHTML = `Incorrecto. Correcto: <strong>${correctAnswer}</strong>`; quizFeedbackEl.className = 'incorrect';
            if (currentQuestion.item && !missedQuestions.some(mq => mq.item.id === currentQuestion.item.id)) { missedQuestions.push(JSON.parse(JSON.stringify(currentQuestion))); }
            optionButtons.forEach(btn => { if (btn.textContent === correctAnswer) btn.classList.add('correct'); });
        }
        nextQuestionBtn.style.display = 'inline-block';
    }
    function handleTextAnswer() {
         if (!quizActive || !quizTextAnswerInput || !submitTextAnswerBtn || !quizFeedbackEl || !nextQuestionBtn) return;
         quizActive = false; const currentQuestion = currentQuizSet[currentQuestionIndex];
         if (!currentQuestion || typeof currentQuestion.answer === 'undefined') { console.error("[Quiz Error] TextAnswer: Pregunta/Resp inválida."); goToNextQuestion(); return; }
         const userAnswer = normalizeAnswer(quizTextAnswerInput.value); const correctAnswer = normalizeAnswer(currentQuestion.answer); const originalCorrectAnswer = currentQuestion.answer; quizTextAnswerInput.disabled = true; submitTextAnswerBtn.disabled = true;
         if (userAnswer === correctAnswer && userAnswer !== '') { score++; quizTextAnswerInput.classList.add('correct'); quizFeedbackEl.textContent = '¡Correcto!'; quizFeedbackEl.className = 'correct'; }
         else { quizTextAnswerInput.classList.add('incorrect'); quizFeedbackEl.innerHTML = `Incorrecto. Correcto: <strong>${originalCorrectAnswer}</strong>`; quizFeedbackEl.className = 'incorrect'; if (currentQuestion.item && !missedQuestions.some(mq => mq.item.id === currentQuestion.item.id)) { missedQuestions.push(JSON.parse(JSON.stringify(currentQuestion))); } }
         nextQuestionBtn.style.display = 'inline-block';
     }
    function goToNextQuestion() { currentQuestionIndex++; setTimeout(displayQuestion, 50); }
    function showResults() {
        if(quizQuestionArea) quizQuestionArea.style.display = 'none'; if(quizResultsEl) quizResultsEl.style.display = 'block';
        if(quizScoreEl) quizScoreEl.textContent = score; if(quizTotalEl && currentQuizSet) quizTotalEl.textContent = currentQuizSet.length;
        quizActive = false; const wasMainQuizRound = (currentQuizSet === allQuizQuestions);
        if (missedQuestions.length > 0 && wasMainQuizRound && retryMissedQuizBtn) retryMissedQuizBtn.style.display = 'inline-block';
        else if(retryMissedQuizBtn) retryMissedQuizBtn.style.display = 'none';
    }
    function resetQuizView() {
        quizActive = false; allQuizQuestions = []; currentQuizSet = []; missedQuestions = []; score = 0; currentQuestionIndex = 0;
        if(quizSetup) quizSetup.style.display = 'block'; if(quizQuestionArea) quizQuestionArea.style.display = 'none'; if(quizResultsEl) quizResultsEl.style.display = 'none'; if(retryMissedQuizBtn) retryMissedQuizBtn.style.display = 'none'; if(quizDataErrorEl) quizDataErrorEl.style.display = 'none'; if(quizImageContainer) quizImageContainer.innerHTML = '';
        if(quizFeedbackEl) { quizFeedbackEl.textContent = ''; quizFeedbackEl.className = ''; } if(quizOptionsEl) quizOptionsEl.innerHTML = ''; if(quizTextAnswerInput) { quizTextAnswerInput.value = ''; quizTextAnswerInput.className = ''; } if(quizQuestionEl) quizQuestionEl.textContent = '';
        if(quizLengthSelect) quizLengthSelect.value = "5";
        console.log("[Quiz] Vista reseteada.");
    }
    function setupQuizControls() {
        if (!startQuizBtn || !nextQuestionBtn || !restartQuizBtn || !retryMissedQuizBtn || !submitTextAnswerBtn || !quizTextAnswerInput || !quizLengthSelect) { console.error("[Quiz Error] Faltan elementos control Quiz."); return; }
        startQuizBtn.addEventListener('click', () => startQuiz(false)); nextQuestionBtn.addEventListener('click', goToNextQuestion);
        restartQuizBtn.addEventListener('click', resetQuizView); retryMissedQuizBtn.addEventListener('click', () => startQuiz(true));
        submitTextAnswerBtn.addEventListener('click', handleTextAnswer);
        quizTextAnswerInput.addEventListener('keypress', function (e) { if (e.key === 'Enter' && !submitTextAnswerBtn.disabled) handleTextAnswer(); });
    }
    // =============================================
    // ========= FIN SECCIÓN QUIZ ==================
    // =============================================


    // =============================================
    // ========= SECCIÓN FLASHCARDS ================
    // =============================================
    function prepareFlashcardData() {
        if (flashcardsLoadingEl) flashcardsLoadingEl.style.display = 'block'; if (flashcardAreaEl) flashcardAreaEl.style.display = 'none'; if (flashcardsErrorEl) flashcardsErrorEl.style.display = 'none';
        const validLexicon = lexiconData.filter(item => item && item.raramuri && (item.spanish || item.image));
        console.log(`[Flashcards] Datos válidos: ${validLexicon.length}`);
        if (validLexicon.length === 0) { if (flashcardsErrorEl) { flashcardsErrorEl.textContent = 'No hay datos para flashcards.'; flashcardsErrorEl.style.display = 'block'; } if (flashcardsLoadingEl) flashcardsLoadingEl.style.display = 'none'; flashcardData = []; return false; }
        flashcardData = shuffleArray([...validLexicon]); currentFlashcardIndex = 0; isFlashcardFlipped = false;
        if (flashcardsLoadingEl) flashcardsLoadingEl.style.display = 'none'; if (flashcardAreaEl) flashcardAreaEl.style.display = 'block'; return true;
    }
    function displayCurrentFlashcard() {
        if (!flashcardData || flashcardData.length === 0 || !flashcardAreaEl || flashcardAreaEl.style.display === 'none') { console.log("[Flashcards] No hay datos o área no visible."); return; }
        if (currentFlashcardIndex < 0 || currentFlashcardIndex >= flashcardData.length) { console.error(`[Flashcards] Índice inválido: ${currentFlashcardIndex}.`); currentFlashcardIndex = 0; }
        const cardData = flashcardData[currentFlashcardIndex];
        if (!cardData) { console.error(`[Flashcards] Error: No datos índice ${currentFlashcardIndex}`); if (flashcardsErrorEl) { flashcardsErrorEl.textContent = 'Error datos tarjeta.'; flashcardsErrorEl.style.display = 'block'; flashcardAreaEl.style.display = 'none'; } return; }
        if (flashcardEl) flashcardEl.classList.remove('flipped'); isFlashcardFlipped = false;
        if (flashcardFrontEl) {
             flashcardFrontEl.innerHTML = '';
            if (cardData.image) {
                const img = document.createElement('img'); img.src = cardData.image; img.alt = cardData.spanish || 'Flashcard Image'; img.loading = 'lazy'; img.onerror = function() { this.alt='Error img'; this.src='images/placeholder.png'; }; flashcardFrontEl.appendChild(img);
            } else if (cardData.spanish) { flashcardFrontEl.textContent = cardData.spanish; }
            else { flashcardFrontEl.textContent = '???'; }
        }
        if (flashcardBackEl) { flashcardBackEl.textContent = cardData.raramuri || '???'; }
        if (flashcardCounterEl) { flashcardCounterEl.textContent = `Tarjeta ${currentFlashcardIndex + 1} de ${flashcardData.length}`; }
    }
    function flipFlashcard() { if (!flashcardEl) return; flashcardEl.classList.toggle('flipped'); isFlashcardFlipped = !isFlashcardFlipped; }
    function nextFlashcard() { if (!flashcardData || flashcardData.length === 0) return; currentFlashcardIndex++; if (currentFlashcardIndex >= flashcardData.length) currentFlashcardIndex = 0; displayCurrentFlashcard(); }
    function prevFlashcard() { if (!flashcardData || flashcardData.length === 0) return; currentFlashcardIndex--; if (currentFlashcardIndex < 0) currentFlashcardIndex = flashcardData.length - 1; displayCurrentFlashcard(); }
     function shuffleFlashcards() { console.log("[Flashcards] Barajando tarjetas..."); if (prepareFlashcardData()) displayCurrentFlashcard(); }
    function setupFlashcardsControls() {
        if (!flashcardEl || !prevFlashcardBtn || !flipFlashcardBtn || !nextFlashcardBtn || !shuffleFlashcardsBtn) { console.error("Faltan elementos control Flashcards."); return; }
        flashcardEl.addEventListener('click', flipFlashcard); flipFlashcardBtn.addEventListener('click', flipFlashcard);
        nextFlashcardBtn.addEventListener('click', nextFlashcard); prevFlashcardBtn.addEventListener('click', prevFlashcard);
        shuffleFlashcardsBtn.addEventListener('click', shuffleFlashcards);
    }
     function initializeFlashcardsView() {
         console.log("[Flashcards] Inicializando vista...");
         if (flashcardData.length === 0) { if(prepareFlashcardData()){ displayCurrentFlashcard(); } }
         else { displayCurrentFlashcard(); }
     }
    // =============================================
    // ========= FIN SECCIÓN FLASHCARDS ============
    // =============================================

    // --- Inicialización App ---
    function initializeApplication() {
        // Comprobación de elementos esenciales (incluido el de filtros)
        if (!mainContentEl || !navButtons || !contentSections || !lexiconGrid || !phrasesList || !memoramaGrid || !quizContainer || !flashcardsContainer || !categoryFiltersContainer ) {
            console.error("Error Crítico: Faltan elementos HTML esenciales.");
            if(errorMessageEl) { errorMessageEl.textContent = "Error: Faltan elementos HTML."; errorMessageEl.style.display = 'block'; }
            if(loadingMessageEl) loadingMessageEl.style.display = 'none';
            if(mainContentEl) mainContentEl.style.display = 'none';
            return;
        }
        // Configurar navegación
        setupNavigation();
        // Poblar frases
        populatePhrases();
        // Configurar búsqueda (que ahora llama a filterAndDisplayLexicon)
        setupSearch();
        // Poblar botones de filtro de categoría
        populateCategoryFilters();
        // Mostrar léxico inicial (ya filtrado por defecto)
        filterAndDisplayLexicon();
        // Configurar controles de los juegos
        setupMemoramaControls();
        setupQuizControls();
        setupFlashcardsControls();

        console.log("Aplicación inicializada correctamente.");
    }

    // --- Punto de Entrada ---
    loadData(); // Iniciar carga de datos

}); // Fin DOMContentLoaded
