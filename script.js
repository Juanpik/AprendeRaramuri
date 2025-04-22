// --- START OF FILE script.js (Refactored) ---

document.addEventListener('DOMContentLoaded', () => {

    // --- DECLARACIÓN DE VARIABLES PARA DATOS ---
    let lexiconData = [];
    let phrasesData = [];

    // --- ELEMENTOS DEL DOM ---
    // Generales
    const loadingMessageEl = document.getElementById('loading-message');
    const errorMessageEl = document.getElementById('error-message');
    const mainContentEl = document.getElementById('main-content');
    const navButtons = document.querySelectorAll('nav button');
    const contentSections = document.querySelectorAll('.content-section');
    // Léxico
    const lexiconGrid = document.getElementById('lexicon-grid');
    const lexiconSearchInput = document.getElementById('lexicon-search');
    // Frases
    const phrasesList = document.getElementById('phrases-list');
    // Memorama
    const memoramaSetup = document.getElementById('memorama-setup');
    const memoramaGameArea = document.getElementById('memorama-game-area');
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    const memoramaGrid = document.getElementById('memorama-grid');
    const memoramaAttemptsEl = document.getElementById('memorama-attempts');
    const resetMemoramaBtn = document.getElementById('reset-memorama');
    const memoramaWinMessage = document.getElementById('memorama-win-message');
    const memoramaDataErrorEl = document.getElementById('memorama-data-error');
    // Quiz
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
    // Flashcards
    const flashcardsContainer = document.getElementById('flashcards-container');
    const flashcardsLoadingEl = document.getElementById('flashcards-loading');
    const flashcardsErrorEl = document.getElementById('flashcards-error');
    const flashcardAreaEl = document.getElementById('flashcard-area');
    const flashcardCounterEl = document.getElementById('flashcard-counter');
    const flashcardDisplayArea = document.getElementById('flashcard-display-area'); // Contenedor para delegación
    const flashcardEl = document.getElementById('flashcard'); // La tarjeta específica
    const flashcardFrontEl = document.getElementById('flashcard-front');
    const flashcardBackEl = document.getElementById('flashcard-back');
    const prevFlashcardBtn = document.getElementById('prev-flashcard-btn');
    const flipFlashcardBtn = document.getElementById('flip-flashcard-btn');
    const nextFlashcardBtn = document.getElementById('next-flashcard-btn');
    const shuffleFlashcardsBtn = document.getElementById('shuffle-flashcards-btn');

    // --- VARIABLES GLOBALES DE ESTADO ---
    // Memorama State
    const memoramaState = {
        active: false,
        cards: [],
        flippedElements: [],
        matchedPairsCount: 0,
        totalPairs: 0,
        attempts: 0,
        lockBoard: false
    };
    // Quiz State
    const quizState = {
        allQuestions: [],
        currentSet: [],
        currentIndex: 0,
        score: 0,
        active: false,
        missedQuestions: []
    };
    // Flashcards State
    const flashcardState = {
        data: [],
        currentIndex: 0,
        isFlipped: false
    };

    // --- FUNCIONES HELPER ---
    /** Muestra un elemento añadiendo la clase 'hidden' */
    function showElement(element) { if (element) element.classList.remove('hidden'); }
    /** Oculta un elemento añadiendo la clase 'hidden' */
    function hideElement(element) { if (element) element.classList.add('hidden'); }
    /** Resetea un input (valor y clases de validación) */
    function resetInput(inputElement) {
        if (inputElement) {
            inputElement.value = '';
            inputElement.disabled = false;
            inputElement.classList.remove('correct', 'incorrect');
        }
    }
    /** Baraja un array (in-place no, devuelve copia) */
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    /** Normaliza texto para comparación */
    function normalizeAnswer(text) { return text ? text.toLowerCase().trim() : ''; }
    /** Muestra mensaje de error genérico o específico */
    function displayError(message) {
        console.error("Error:", message);
        if (errorMessageEl) {
            errorMessageEl.textContent = message;
            showElement(errorMessageEl);
        }
        hideElement(loadingMessageEl);
        hideElement(mainContentEl);
    }

    // --- CARGA DE DATOS ---
    async function loadData() {
        try {
            showElement(loadingMessageEl);
            hideElement(errorMessageEl);
            hideElement(mainContentEl);

            const response = await fetch('data.json', { cache: 'no-cache' });
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            const data = await response.json();
            if (!data || typeof data !== 'object') throw new Error("JSON inválido.");

            lexiconData = Array.isArray(data.lexicon) ? data.lexicon : [];
            phrasesData = Array.isArray(data.phrases) ? data.phrases : [];
            console.log("Datos cargados:", { lexicon: lexiconData.length, phrases: phrasesData.length });

            if (lexiconData.length === 0) console.warn("Léxico vacío.");
            if (phrasesData.length === 0) console.warn("Frases vacías.");

            hideElement(loadingMessageEl);
            showElement(mainContentEl);
            initializeApplication();

        } catch (error) {
            displayError(`Error cargando datos: ${error.message}. Verifica data.json y la consola (F12).`);
        }
    }

    // --- NAVEGACIÓN ---
    function setupNavigation() {
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const sectionId = button.getAttribute('data-section');
                contentSections.forEach(section => hideElement(section)); // Ocultar todas
                navButtons.forEach(btn => btn.classList.remove('active'));

                const currentSection = document.getElementById(sectionId);
                if (currentSection) showElement(currentSection); // Mostrar la activa
                else console.error(`Sección ${sectionId} no encontrada.`);
                button.classList.add('active');

                // Inicializar o resetear vistas al activar
                if (sectionId === 'memorama') resetMemoramaView();
                else if (sectionId === 'quiz') resetQuizView();
                else if (sectionId === 'flashcards') initializeFlashcardsView();
            });
        });
        // Activar 'About' por defecto
        const aboutButton = document.querySelector('nav button[data-section="about"]');
        const aboutSection = document.getElementById('about');
        if (aboutButton && aboutSection) {
            aboutButton.classList.add('active');
            showElement(aboutSection);
        } else if (navButtons.length > 0 && contentSections.length > 0) {
            navButtons[0].classList.add('active');
            showElement(contentSections[0]);
        }
    }

    // --- LÉXICO ---
    function displayLexiconItems(itemsToShow) {
        if (!lexiconGrid) return;
        lexiconGrid.innerHTML = '';
        if (!itemsToShow || itemsToShow.length === 0) {
            const message = lexiconSearchInput?.value ? 'No se encontraron coincidencias.' : 'No hay datos léxicos.';
            lexiconGrid.innerHTML = `<p class="text-center text-secondary" style="grid-column: 1 / -1;">${message}</p>`;
            return;
        }
        itemsToShow.forEach(item => {
            const div = document.createElement('div'); div.classList.add('lexicon-item');
            const imgSrc = item.image || 'images/placeholder.png';
            const spanishText = item.spanish || '???'; const raramuriText = item.raramuri || '???';
            div.innerHTML = `
                <img src="${imgSrc}" alt="${spanishText || raramuriText}" loading="lazy" onerror="this.onerror=null; this.src='images/placeholder.png'; this.alt='Error al cargar: ${raramuriText}'; this.parentElement.querySelector('.img-error-msg')?.remove(); this.parentElement.insertAdjacentHTML('beforeend', '<p class=\'img-error-msg\' style=\'font-size:0.8em; color:var(--error-red);\'>Error Img</p>');">
                <p class="raramuri-word">${raramuriText}</p>
                <p class="spanish-word">${spanishText}</p>`;
            lexiconGrid.appendChild(div);
        });
    }
    function handleSearch() {
        if (!lexiconSearchInput || !lexiconData) return;
        const searchTerm = lexiconSearchInput.value.toLowerCase().trim();
        const filteredItems = lexiconData.filter(item =>
            ((item.raramuri || '').toLowerCase().includes(searchTerm) || (item.spanish || '').toLowerCase().includes(searchTerm))
        );
        displayLexiconItems(filteredItems);
    }
    function setupSearch() { if (lexiconSearchInput) lexiconSearchInput.addEventListener('input', handleSearch); }

    // --- FRASES ---
    function populatePhrases() {
        if (!phrasesList) return; phrasesList.innerHTML = '';
        if (!phrasesData || phrasesData.length === 0) { phrasesList.innerHTML = '<li class="text-secondary">No hay frases disponibles.</li>'; return; }
        phrasesData.forEach(phrase => {
            if (phrase.raramuri && phrase.spanish) {
                const li = document.createElement('li');
                li.innerHTML = `<span class="raramuri-phrase">${phrase.raramuri}</span><span class="spanish-phrase">${phrase.spanish}</span>`;
                phrasesList.appendChild(li);
            }
        });
    }

    // --- MEMORAMA ---
    function resetMemoramaView() {
        console.log("[Memorama] Reseteando Vista");
        showElement(memoramaSetup); hideElement(memoramaGameArea); hideElement(memoramaWinMessage); hideElement(memoramaDataErrorEl);
        if (memoramaGrid) memoramaGrid.innerHTML = '';
        difficultyButtons.forEach(btn => btn.classList.remove('selected'));
        // Resetear estado
        memoramaState.active = false; memoramaState.cards = []; memoramaState.flippedElements = [];
        memoramaState.matchedPairsCount = 0; memoramaState.totalPairs = 0; memoramaState.attempts = 0; memoramaState.lockBoard = false;
        if (memoramaAttemptsEl) memoramaAttemptsEl.textContent = '0';
    }
    function createMemoramaFaceContent(cardInfo, faceElement) { /* Sin cambios respecto a versión anterior */
        if (!cardInfo || !faceElement) { console.error("[Memorama Critico] Faltan parámetros en createMemoramaFaceContent"); return; }
        faceElement.innerHTML = ''; // Limpiar
        try {
            if (cardInfo.type === 'image' && cardInfo.value) {
                const img = document.createElement('img'); img.src = cardInfo.value; img.alt = cardInfo.altText || "Imagen Memorama"; img.loading = 'lazy';
                img.onerror = function() { console.error(`[Memorama Critico] Falló carga IMG: ${this.src} (ID: ${cardInfo.id})`); this.style.display = 'none'; const errorP = document.createElement('p'); errorP.textContent = 'Error Img!'; errorP.style.color = 'red'; errorP.style.fontSize = '10px'; faceElement.appendChild(errorP); };
                faceElement.appendChild(img);
            } else if (cardInfo.type === 'text' && cardInfo.value) {
                const textP = document.createElement('p'); textP.textContent = cardInfo.value; faceElement.appendChild(textP);
            } else { console.warn(`[Memorama Warn] Contenido inválido (ID: ${cardInfo.id}):`, cardInfo); const fallbackP = document.createElement('p'); fallbackP.textContent = '??'; fallbackP.style.opacity = '0.5'; faceElement.appendChild(fallbackP); }
        } catch (e) { console.error("[Memorama Critico] Excepción en createMemoramaFaceContent:", e, cardInfo); try { faceElement.innerHTML = '<p style="color:red; font-size:10px;">Error JS!</p>'; } catch (fe) {} }
    }
    function prepareCardData(requestedPairs) { /* Sin cambios */
        const validItems = lexiconData.filter(item => item && item.id != null && item.image && item.raramuri && item.spanish);
        if (validItems.length < requestedPairs) { console.warn(`[Memorama] Datos insuficientes: ${validItems.length}/${requestedPairs}`); if (memoramaDataErrorEl) { memoramaDataErrorEl.textContent = `Datos insuficientes (${validItems.length}) para ${requestedPairs} pares.`; showElement(memoramaDataErrorEl); } hideElement(memoramaGameArea); showElement(memoramaSetup); difficultyButtons.forEach(btn => btn.classList.remove('selected')); return null; }
        hideElement(memoramaDataErrorEl); return shuffleArray(validItems).slice(0, requestedPairs);
    }
    function buildMemoramaGrid() { /* Sin cambios, ya usaba createMemoramaFaceContent */
        if (!memoramaGrid) { console.error("[Memorama Error] #memorama-grid no encontrado."); return; }
        memoramaGrid.innerHTML = '';
        memoramaState.cards.forEach((cardData, index) => {
            const cardElement = document.createElement('div'); cardElement.classList.add('memorama-card', 'flippable-card'); // Añadir clase base
            if (cardData.id === undefined || cardData.id === null) { console.error(`[Memorama Error] ID indefinido carta ${index}`, cardData); return; }
            cardElement.dataset.id = cardData.id; cardElement.dataset.index = index;
            const frontFace = document.createElement('div'); frontFace.classList.add('card-face', 'card-front'); createMemoramaFaceContent(cardData, frontFace);
            const backFace = document.createElement('div'); backFace.classList.add('card-face', 'card-back');
            cardElement.appendChild(frontFace); cardElement.appendChild(backFace);
            // Listener se añade al contenedor ahora
            memoramaGrid.appendChild(cardElement);
        });
        let columns = Math.ceil(Math.sqrt(memoramaState.cards.length)); columns = Math.max(2, Math.min(columns, 5));
        memoramaGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`; console.log(`[Memorama] Grid construido con ${columns} columnas.`);
    }
    function startMemorama(numPairs) { /* Usa estado memoramaState */
        console.log(`[Memorama] Iniciando con ${numPairs} pares.`);
        resetMemoramaView();
        const itemsForGame = prepareCardData(numPairs);
        if (!itemsForGame) { memoramaState.active = false; return; }
        memoramaState.totalPairs = itemsForGame.length; memoramaState.active = true; memoramaState.cards = [];
        itemsForGame.forEach(item => { memoramaState.cards.push({ id: item.id, type: 'image', value: item.image, altText: item.spanish }); memoramaState.cards.push({ id: item.id, type: 'text', value: item.raramuri }); });
        memoramaState.cards = shuffleArray(memoramaState.cards);
        buildMemoramaGrid();
        hideElement(memoramaSetup); showElement(memoramaGameArea); console.log(`[Memorama] Juego listo con ${memoramaState.totalPairs} pares.`);
    }
    function handleMemoramaCardClick(event) { /* Delegado */
        if (!memoramaState.active || memoramaState.lockBoard) return;
        const clickedCardElement = event.target.closest('.memorama-card'); // Encuentra la tarjeta clickeada
        if (!clickedCardElement) return; // Click fuera de una tarjeta

        console.log(`[Memorama Delegado] Click Carta ${clickedCardElement.dataset.index} (ID: ${clickedCardElement.dataset.id})`);
        if (clickedCardElement.classList.contains('flipped') || clickedCardElement.classList.contains('matched')) { console.log("[Memorama] Click ignorado."); return; }

        clickedCardElement.classList.add('flipped');
        memoramaState.flippedElements.push(clickedCardElement);
        console.log(`[Memorama] Cartas volteadas: ${memoramaState.flippedElements.length}`);

        if (memoramaState.flippedElements.length === 2) {
            memoramaState.lockBoard = true; memoramaState.attempts++;
            if (memoramaAttemptsEl) memoramaAttemptsEl.textContent = memoramaState.attempts;
            console.log("[Memorama] Dos cartas volteadas, comprobando...");
            checkMemoramaMatch();
        }
    }
    function checkMemoramaMatch() { /* Usa estado memoramaState */
        const [card1, card2] = memoramaState.flippedElements;
        if (!card1 || !card2) { console.error("[Memorama Critico] Faltan cartas."); memoramaState.flippedElements = []; memoramaState.lockBoard = false; return; }
        const isMatch = card1.dataset.id === card2.dataset.id;
        console.log(`[Memorama] Comparando ${card1.dataset.id} vs ${card2.dataset.id}. Match: ${isMatch}`);
        if (isMatch) {
            memoramaState.matchedPairsCount++; console.log(`[Memorama] ¡Par! (${memoramaState.matchedPairsCount}/${memoramaState.totalPairs})`);
            setTimeout(() => {
                card1.classList.add('matched'); card2.classList.add('matched');
                memoramaState.flippedElements = []; memoramaState.lockBoard = false;
                if (memoramaState.matchedPairsCount === memoramaState.totalPairs) {
                    console.log("[Memorama] ¡Ganado!"); if (memoramaWinMessage) { memoramaWinMessage.textContent = `¡Felicidades! ${memoramaState.totalPairs} pares en ${memoramaState.attempts} intentos.`; showElement(memoramaWinMessage); }
                    memoramaState.active = false;
                }
            }, 300);
        } else {
            console.log("[Memorama] No es par.");
            setTimeout(() => {
                card1.classList.remove('flipped'); card2.classList.remove('flipped');
                memoramaState.flippedElements = []; memoramaState.lockBoard = false;
            }, 1000);
        }
    }
    function setupMemoramaControls() { /* Listener delegado al grid */
        if (!memoramaSetup || !resetMemoramaBtn || !difficultyButtons || !memoramaGrid) { console.error("[Memorama Critico] Faltan elementos HTML controles."); return; }
        difficultyButtons.forEach(button => {
            button.addEventListener('click', () => {
                const pairs = parseInt(button.getAttribute('data-pairs'));
                if (isNaN(pairs) || pairs <= 0) { console.error("[Memorama Error] Pares inválidos:", button); return; }
                difficultyButtons.forEach(btn => btn.classList.remove('selected')); button.classList.add('selected');
                startMemorama(pairs);
            });
        });
        resetMemoramaBtn.addEventListener('click', () => {
            const selectedBtn = document.querySelector('#memorama-setup .difficulty-btn.selected');
            if (selectedBtn) { const pairs = parseInt(selectedBtn.getAttribute('data-pairs')); if (!isNaN(pairs) && pairs > 0) startMemorama(pairs); else resetMemoramaView(); }
            else resetMemoramaView();
        });
        // Event Delegation para clicks en las cartas
        memoramaGrid.addEventListener('click', handleMemoramaCardClick);
    }

    // --- QUIZ ---
    // (Funciones getWrongOptions, generateQuizQuestions usan estado global lexiconData)
    // (Funciones startQuiz, displayQuestion, handleMCAnswer, handleTextAnswer, goToNextQuestion, showResults usan estado quizState)
    function getWrongOptions(correctItem, count, sourceData, field) { /* Sin cambios */
        if (!correctItem || !field) return [];
         const correctValueNorm = normalizeAnswer(correctItem[field]);
         const wrongAnswerPool = sourceData.filter(item => item && item.id !== correctItem.id && item[field] && normalizeAnswer(item[field]) !== correctValueNorm );
         const shuffledWrongs = shuffleArray([...wrongAnswerPool]); let options = new Set();
         for (const item of shuffledWrongs) { if (options.size >= count) break; options.add(item[field]); }
         let attempts = 0; const maxAttempts = sourceData.length * 2;
         while (options.size < count && attempts < maxAttempts) {
             const randomItem = sourceData[Math.floor(Math.random() * sourceData.length)];
             if (randomItem && randomItem.id !== correctItem.id && randomItem[field]) { const potentialOption = randomItem[field]; if (normalizeAnswer(potentialOption) !== correctValueNorm) options.add(potentialOption); }
             attempts++;
         } return Array.from(options);
    }
    function generateQuizQuestions(numQuestions) { /* Sin cambios lógicos */
         const availableLexiconItems = lexiconData.filter(item => item && item.raramuri && item.spanish && item.id);
         const availableImageItems = availableLexiconItems.filter(item => item.image);
        if (availableLexiconItems.length < 2) { console.error("Quiz: Min 2 entradas."); if(quizDataErrorEl) { quizDataErrorEl.textContent = "Datos insuficientes (mín 2)."; showElement(quizDataErrorEl); } return []; }
        else { hideElement(quizDataErrorEl); }
        const potentialQuestions = [];
        availableLexiconItems.forEach(item => { potentialQuestions.push({ type: 'MC_RaSp', item: item, question: `¿Qué significa "${item.raramuri}"?`, answer: item.spanish }); potentialQuestions.push({ type: 'MC_SpRa', item: item, question: `¿Cómo se dice "${item.spanish}" en rarámuri?`, answer: item.raramuri }); potentialQuestions.push({ type: 'TXT_SpRa', item: item, question: `Escribe cómo se dice "${item.spanish}" en rarámuri:`, answer: item.raramuri }); });
        availableImageItems.forEach(item => { potentialQuestions.push({ type: 'MC_ImgRa', item: item, question: `¿Qué es esto en rarámuri?`, answer: item.raramuri, image: item.image }); potentialQuestions.push({ type: 'TXT_ImgRa', item: item, question: `Escribe en rarámuri qué ves en la imagen:`, answer: item.raramuri, image: item.image }); });
        const shuffledPotentialQuestions = shuffleArray(potentialQuestions); let questionsToGenerate = 0; const totalPotential = shuffledPotentialQuestions.length;
        if (numQuestions === 'all') questionsToGenerate = totalPotential; else questionsToGenerate = Math.min(parseInt(numQuestions), totalPotential);
        questionsToGenerate = Math.max(1, questionsToGenerate); if (totalPotential === 0) return [];
        const finalQuestions = shuffledPotentialQuestions.slice(0, questionsToGenerate);
        finalQuestions.forEach(q => { if (q.type.startsWith('MC_')) { let wrongOptions = []; let field = ''; let correctLexiconItem = q.item; if (q.type === 'MC_RaSp') field = 'spanish'; else if (q.type === 'MC_SpRa' || q.type === 'MC_ImgRa') field = 'raramuri'; if (field && correctLexiconItem) { wrongOptions = getWrongOptions(correctLexiconItem, 3, availableLexiconItems, field); const allOptions = [q.answer, ...wrongOptions]; const uniqueOptions = Array.from(new Set(allOptions)); q.options = shuffleArray(uniqueOptions.slice(0, 4)); } else { q.options = [q.answer]; console.warn("No opciones MC:", q); } if (q.options.length < 2) console.warn("MC < 2 opc:", q); } });
        const validFinalQuestions = finalQuestions.filter(q => !q.type.startsWith('MC_') || (q.options && q.options.length >= 2));
        console.log("[Quiz] Preguntas generadas:", validFinalQuestions); return validFinalQuestions;
    }
    function startQuiz(isRetry = false) { /* Usa estado quizState y helpers show/hide */
         quizState.active = true; quizState.score = 0; quizState.currentIndex = 0;
         if (!isRetry) { const selectedLength = quizLengthSelect.value; quizState.allQuestions = generateQuizQuestions(selectedLength); quizState.currentSet = quizState.allQuestions; quizState.missedQuestions = []; }
         else { quizState.currentSet = shuffleArray([...quizState.missedQuestions]); quizState.missedQuestions = []; if (quizState.currentSet.length === 0) { alert("¡Felicidades! No hubo falladas."); resetQuizView(); return; } console.log("[Quiz] Reintentando:", quizState.currentSet); }
         if (!quizState.currentSet || quizState.currentSet.length === 0) { console.log("[Quiz] No preguntas."); hideElement(quizQuestionArea); showElement(quizSetup); hideElement(quizResultsEl); hideElement(retryMissedQuizBtn); if(quizDataErrorEl) { quizDataErrorEl.style.display = quizDataErrorEl.textContent ? 'block' : 'none'; if (!quizDataErrorEl.textContent) { quizDataErrorEl.textContent = "No preguntas."; showElement(quizDataErrorEl); } } quizState.active = false; return; }
         hideElement(quizSetup); hideElement(quizResultsEl); hideElement(retryMissedQuizBtn); showElement(quizQuestionArea); hideElement(nextQuestionBtn); hideElement(quizDataErrorEl);
         displayQuestion();
    }
    function displayQuestion() { /* Usa estado quizState y helpers */
        if (quizState.currentIndex >= quizState.currentSet.length) { showResults(); return; }
        quizState.active = true; const q = quizState.currentSet[quizState.currentIndex];
        if (!q || !q.type || !q.question || typeof q.answer === 'undefined') { console.error("[Quiz Error] Pregunta inválida:", q); goToNextQuestion(); return; }
        if(quizQuestionEl) quizQuestionEl.textContent = q.question;
        if(quizImageContainer) quizImageContainer.innerHTML = ''; if(quizOptionsEl) { quizOptionsEl.innerHTML = ''; hideElement(quizOptionsEl); } hideElement(quizTextInputArea); resetInput(quizTextAnswerInput);
        if(submitTextAnswerBtn) submitTextAnswerBtn.disabled = false; if(quizFeedbackEl) { quizFeedbackEl.textContent = ''; quizFeedbackEl.className = 'feedback-inline'; /* Clase base */ } hideElement(nextQuestionBtn);
        if (q.image && quizImageContainer) { const img = document.createElement('img'); img.src = q.image; img.alt = `Imagen pregunta`; img.loading = 'lazy'; img.onerror = function() { console.error(`[Quiz Error] IMG no cargada: ${this.src}`); this.alt = 'Error img'; this.src='images/placeholder.png'; }; quizImageContainer.appendChild(img); }
        if (q.type.startsWith('MC_') && quizOptionsEl) {
            showElement(quizOptionsEl);
            if (!q.options || q.options.length < 2) { console.error("[Quiz Error] MC sin opciones:", q); quizOptionsEl.innerHTML = '<p style="color:var(--error-red);">Error opciones.</p>'; quizState.active = false; showElement(nextQuestionBtn); }
            else { q.options.forEach(option => { const button = document.createElement('button'); button.textContent = option; button.disabled = false; /* Listener delegado ahora */ quizOptionsEl.appendChild(button); }); }
        } else if (q.type.startsWith('TXT_') && quizTextInputArea && quizTextAnswerInput && submitTextAnswerBtn) {
            showElement(quizTextInputArea); setTimeout(() => { if (quizTextAnswerInput) quizTextAnswerInput.focus(); }, 100);
        }
    }
    function handleMCAnswer(event) { /* Delegado, usa estado quizState */
        if (!quizState.active || !quizOptionsEl || !quizFeedbackEl || !nextQuestionBtn) return;
        const selectedButton = event.target.closest('button'); // Asegura que el click fue en un botón
        if (!selectedButton) return; // Salir si no se clickeó un botón

        quizState.active = false; const selectedAnswer = selectedButton.textContent;
        const currentQuestion = quizState.currentSet[quizState.currentIndex];
        if (!currentQuestion || typeof currentQuestion.answer === 'undefined') { console.error("[Quiz Error] MCAnswer Delegado: Pregunta/Resp inválida."); goToNextQuestion(); return; }
        const correctAnswer = currentQuestion.answer; const optionButtons = quizOptionsEl.querySelectorAll('button');
        optionButtons.forEach(btn => btn.disabled = true);
        if (selectedAnswer === correctAnswer) {
            quizState.score++; selectedButton.classList.add('correct');
            quizFeedbackEl.textContent = '¡Correcto!'; quizFeedbackEl.classList.add('correct');
        } else {
            selectedButton.classList.add('incorrect');
            quizFeedbackEl.innerHTML = `Incorrecto. Correcto: <strong>${correctAnswer}</strong>`; quizFeedbackEl.classList.add('incorrect');
            if (currentQuestion.item && !quizState.missedQuestions.some(mq => mq.item.id === currentQuestion.item.id)) { quizState.missedQuestions.push(JSON.parse(JSON.stringify(currentQuestion))); }
            optionButtons.forEach(btn => { if (btn.textContent === correctAnswer) btn.classList.add('correct'); });
        }
        showElement(nextQuestionBtn);
    }
    function handleTextAnswer() { /* Usa estado quizState */
         if (!quizState.active || !quizTextAnswerInput || !submitTextAnswerBtn || !quizFeedbackEl || !nextQuestionBtn) return;
         quizState.active = false; const currentQuestion = quizState.currentSet[quizState.currentIndex];
         if (!currentQuestion || typeof currentQuestion.answer === 'undefined') { console.error("[Quiz Error] TextAnswer: Pregunta/Resp inválida."); goToNextQuestion(); return; }
         const userAnswer = normalizeAnswer(quizTextAnswerInput.value); const correctAnswer = normalizeAnswer(currentQuestion.answer);
         const originalCorrectAnswer = currentQuestion.answer; quizTextAnswerInput.disabled = true; submitTextAnswerBtn.disabled = true;
         if (userAnswer === correctAnswer && userAnswer !== '') {
             quizState.score++; quizTextAnswerInput.classList.add('correct');
             quizFeedbackEl.textContent = '¡Correcto!'; quizFeedbackEl.classList.add('correct');
         } else {
             quizTextAnswerInput.classList.add('incorrect');
             quizFeedbackEl.innerHTML = `Incorrecto. Correcto: <strong>${originalCorrectAnswer}</strong>`; quizFeedbackEl.classList.add('incorrect');
             if (currentQuestion.item && !quizState.missedQuestions.some(mq => mq.item.id === currentQuestion.item.id)) { quizState.missedQuestions.push(JSON.parse(JSON.stringify(currentQuestion))); }
         }
         showElement(nextQuestionBtn);
     }
    function goToNextQuestion() { quizState.currentIndex++; setTimeout(displayQuestion, 50); }
    function showResults() { /* Usa estado quizState */
        hideElement(quizQuestionArea); showElement(quizResultsEl);
        if(quizScoreEl) quizScoreEl.textContent = quizState.score; if(quizTotalEl && quizState.currentSet) quizTotalEl.textContent = quizState.currentSet.length;
        quizState.active = false; const wasMainQuizRound = (quizState.currentSet === quizState.allQuestions);
        if (quizState.missedQuestions.length > 0 && wasMainQuizRound) showElement(retryMissedQuizBtn);
        else hideElement(retryMissedQuizBtn);
    }
    function resetQuizView() { /* Usa estado quizState */
        quizState.active = false; quizState.allQuestions = []; quizState.currentSet = []; quizState.missedQuestions = []; quizState.score = 0; quizState.currentIndex = 0;
        showElement(quizSetup); hideElement(quizQuestionArea); hideElement(quizResultsEl); hideElement(retryMissedQuizBtn); hideElement(quizDataErrorEl);
        if(quizImageContainer) quizImageContainer.innerHTML = ''; if(quizFeedbackEl) { quizFeedbackEl.textContent = ''; quizFeedbackEl.className = 'feedback-inline'; } if(quizOptionsEl) quizOptionsEl.innerHTML = ''; resetInput(quizTextAnswerInput); if(quizQuestionEl) quizQuestionEl.textContent = '';
        if(quizLengthSelect) quizLengthSelect.value = "5";
        console.log("[Quiz] Vista reseteada.");
    }
    function setupQuizControls() { /* Listener delegado para opciones */
        if (!startQuizBtn || !nextQuestionBtn || !restartQuizBtn || !retryMissedQuizBtn || !submitTextAnswerBtn || !quizTextAnswerInput || !quizOptionsEl || !quizLengthSelect) { console.error("[Quiz Error] Faltan elementos control Quiz."); return; }
        startQuizBtn.addEventListener('click', () => startQuiz(false)); nextQuestionBtn.addEventListener('click', goToNextQuestion);
        restartQuizBtn.addEventListener('click', resetQuizView); retryMissedQuizBtn.addEventListener('click', () => startQuiz(true));
        submitTextAnswerBtn.addEventListener('click', handleTextAnswer);
        quizTextAnswerInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !submitTextAnswerBtn.disabled) handleTextAnswer(); });
        // Event Delegation para opciones MC
        quizOptionsEl.addEventListener('click', handleMCAnswer);
    }

    // --- FLASHCARDS ---
    // (Funciones prepareFlashcardData, displayCurrentFlashcard, flipFlashcard, nextFlashcard, prevFlashcard, shuffleFlashcards, setupFlashcardsControls, initializeFlashcardsView usan estado flashcardState)
    function prepareFlashcardData() { /* Usa estado flashcardState */
        showElement(flashcardsLoadingEl); hideElement(flashcardAreaEl); hideElement(flashcardsErrorEl);
        const validLexicon = lexiconData.filter(item => item && item.raramuri && (item.spanish || item.image));
        console.log(`[Flashcards] Datos válidos: ${validLexicon.length}`);
        if (validLexicon.length === 0) {
            if (flashcardsErrorEl) { flashcardsErrorEl.textContent = 'No hay datos para flashcards.'; showElement(flashcardsErrorEl); }
            hideElement(flashcardsLoadingEl); flashcardState.data = []; return false;
        }
        flashcardState.data = shuffleArray([...validLexicon]); flashcardState.currentIndex = 0; flashcardState.isFlipped = false;
        hideElement(flashcardsLoadingEl); showElement(flashcardAreaEl); return true;
    }
    function displayCurrentFlashcard() { /* Usa estado flashcardState */
        if (!flashcardState.data || flashcardState.data.length === 0 || !flashcardAreaEl) return;
        if (flashcardState.currentIndex < 0 || flashcardState.currentIndex >= flashcardState.data.length) { console.error(`[Flashcards] Índice inválido: ${flashcardState.currentIndex}`); flashcardState.currentIndex = 0; }
        const cardData = flashcardState.data[flashcardState.currentIndex];
        if (!cardData) { console.error(`[Flashcards] No datos para índice ${flashcardState.currentIndex}`); if (flashcardsErrorEl) { flashcardsErrorEl.textContent = 'Error datos tarjeta.'; showElement(flashcardsErrorEl); hideElement(flashcardAreaEl); } return; }
        if (flashcardEl) flashcardEl.classList.remove('flipped'); flashcardState.isFlipped = false;
        if (flashcardFrontEl) {
             flashcardFrontEl.innerHTML = '';
            if (cardData.image) {
                const img = document.createElement('img'); img.src = cardData.image; img.alt = cardData.spanish || 'Flashcard Image'; img.loading = 'lazy'; img.onerror = function() { this.alt='Error img'; this.src='images/placeholder.png'; }; flashcardFrontEl.appendChild(img);
                // NO añadir texto español si hay imagen
            } else if (cardData.spanish) { flashcardFrontEl.textContent = cardData.spanish; }
            else { flashcardFrontEl.textContent = '???'; }
        }
        if (flashcardBackEl) { flashcardBackEl.textContent = cardData.raramuri || '???'; }
        if (flashcardCounterEl) { flashcardCounterEl.textContent = `Tarjeta ${flashcardState.currentIndex + 1} de ${flashcardState.data.length}`; }
    }
    function flipFlashcard() { /* Usa estado flashcardState */
        if (!flashcardEl) return;
        flashcardEl.classList.toggle('flipped');
        flashcardState.isFlipped = !flashcardState.isFlipped;
    }
    function handleFlashcardAreaClick(event){ // Delegado para voltear
        if(event.target.closest('.flashcard')){
             flipFlashcard();
        }
    }
    function nextFlashcard() { /* Usa estado flashcardState */
        if (!flashcardState.data || flashcardState.data.length === 0) return;
        flashcardState.currentIndex = (flashcardState.currentIndex + 1) % flashcardState.data.length; // Loop
        displayCurrentFlashcard();
    }
    function prevFlashcard() { /* Usa estado flashcardState */
        if (!flashcardState.data || flashcardState.data.length === 0) return;
        flashcardState.currentIndex = (flashcardState.currentIndex - 1 + flashcardState.data.length) % flashcardState.data.length; // Loop
        displayCurrentFlashcard();
    }
     function shuffleFlashcards() { if (prepareFlashcardData()) displayCurrentFlashcard(); }
    function setupFlashcardsControls() { /* Listener delegado para volteo */
        if (!flashcardDisplayArea || !prevFlashcardBtn || !flipFlashcardBtn || !nextFlashcardBtn || !shuffleFlashcardsBtn) { console.error("Faltan elementos control Flashcards."); return; }
        flashcardDisplayArea.addEventListener('click', handleFlashcardAreaClick); // Delegado para click en tarjeta
        flipFlashcardBtn.addEventListener('click', flipFlashcard); // Botón explícito
        nextFlashcardBtn.addEventListener('click', nextFlashcard);
        prevFlashcardBtn.addEventListener('click', prevFlashcard);
        shuffleFlashcardsBtn.addEventListener('click', shuffleFlashcards);
    }
     function initializeFlashcardsView() { /* Usa estado flashcardState */
         console.log("[Flashcards] Inicializando vista...");
         if (flashcardState.data.length === 0) { if(prepareFlashcardData()){ displayCurrentFlashcard(); } }
         else { displayCurrentFlashcard(); }
     }

    // --- INICIALIZACIÓN APP ---
    function initializeApplication() {
        if (!mainContentEl || !navButtons || !contentSections || !lexiconGrid || !phrasesList || !memoramaGrid || !quizContainer || !flashcardsContainer ) {
            displayError("Error Crítico: Faltan elementos HTML esenciales."); return;
        }
        setupNavigation();
        displayLexiconItems(lexiconData);
        populatePhrases();
        setupSearch();
        setupMemoramaControls();
        setupQuizControls();
        setupFlashcardsControls();
        console.log("Aplicación inicializada.");
    }

    // --- PUNTO DE ENTRADA ---
    loadData();

}); // Fin DOMContentLoaded
// --- END OF FILE script.js (Refactored) ---
