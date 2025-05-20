// script.js (Final version with image border marking for "Repasar" AND AUDIO PLAYBACK)

document.addEventListener('DOMContentLoaded', () => {
    // --- DECLARACIÓN DE VARIABLES PARA DATOS ---
    let lexiconData = [];
    let phrasesData = [];
    let currentCategoryFilter = 'all';
    let repasarLexiconIds = []; // Para guardar IDs de palabras a repasar
    let currentAudio = null; // Para gestionar la reproducción de audio

    // --- MAPEO DE ICONOS PARA CATEGORÍAS ---
    const categoryIcons = {
        'Naturaleza': '🌳', 'Comida y bebida': '🍎', 'Verbos': '🏃‍♂️',
        'Animales': '🐾', 'Partes del cuerpo': '🖐️', 'Objetos': '🔨',
        'Personas': '🧍‍♀️', 'Vestimenta': '🧦', 'Colores': '🎨',
        'Lugares': '🏡', 'Adjetivos': '✨','all': '',
        'repasar': '⭐'
    };
    const defaultCategoryIcon = '🏷️';


    // --- ELEMENTOS DEL DOM ---
    const loadingMessageEl = document.getElementById('loading-message');
    const errorMessageEl = document.getElementById('error-message');
    const mainContentEl = document.getElementById('main-content');
    const navButtons = document.querySelectorAll('nav button');
    const contentSections = document.querySelectorAll('.content-section');

    const lexiconGrid = document.getElementById('lexicon-grid');
    const lexiconSearchInput = document.getElementById('lexicon-search');
    const categoryFiltersContainer = document.getElementById('category-filters');

    const phrasesList = document.getElementById('phrases-list');

    const memoramaSetup = document.getElementById('memorama-setup');
    const memoramaCategorySelect = document.getElementById('memorama-category');
    const memoramaGameArea = document.getElementById('memorama-game-area');
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    const memoramaGrid = document.getElementById('memorama-grid');
    const memoramaAttemptsEl = document.getElementById('memorama-attempts');
    const resetMemoramaBtn = document.getElementById('reset-memorama');
    const memoramaWinMessage = document.getElementById('memorama-win-message');
    const memoramaDataErrorEl = document.getElementById('memorama-data-error');

    const quizContainer = document.getElementById('quiz-container');
    const quizSetup = document.getElementById('quiz-setup');
    const quizLengthSelect = document.getElementById('quiz-length');
    const quizCategorySelect = document.getElementById('quiz-category');
    const startQuizBtn = document.getElementById('start-quiz');
    const quizQuestionArea = document.getElementById('quiz-question-area');
    const quizImageContainer = document.getElementById('quiz-image-container');
    const quizQuestionEl = document.getElementById('quiz-question');
    const quizOptionsEl = document.getElementById('quiz-options');
    const quizTextInputArea = document.getElementById('quiz-text-input-area');
    const quizTextAnswerInput = document.getElementById('quiz-text-answer');
    const submitTextAnswerBtn = document.getElementById('submit-text-answer');
    const quizFeedbackEl = document.getElementById('quiz-feedback');
    const nextQuestionBtn = document = document.getElementById('next-question');
    const quizResultsEl = document.getElementById('quiz-results');
    const quizScoreEl = document.getElementById('quiz-score');
    const quizTotalEl = document.getElementById('quiz-total');
    const restartQuizBtn = document.getElementById('restart-quiz');
    const retryMissedQuizBtn = document.getElementById('retry-missed-quiz');
    const quizDataErrorEl = document.getElementById('quiz-data-error');

    const flashcardsContainer = document.getElementById('flashcards-container');
    const flashcardsSetupControls = document.getElementById('flashcards-setup-controls');
    const flashcardCategorySelect = document.getElementById('flashcard-category');
    const flashcardsDataErrorEl = document.getElementById('flashcards-data-error');
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

    let memoramaActive = false;
    let mCards = [];
    let mFlippedElements = [];
    let mMatchedPairsCount = 0;
    let mTotalPairs = 0;
    let mAttempts = 0;
    let mLockBoard = false;

    let allQuizQuestions = [];
    let currentQuizSet = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let quizActive = false;
    let missedQuestions = [];

    let flashcardData = [];
    let currentFlashcardIndex = 0;
    let isFlashcardFlipped = false;

    // --- FUNCIONES PARA "PALABRAS A REPASAR" (LocalStorage) ---
    const REPASAR_STORAGE_KEY = 'repasarLexiconIds';

    function loadRepasarIds() {
        const storedIds = localStorage.getItem(REPASAR_STORAGE_KEY);
        repasarLexiconIds = storedIds ? JSON.parse(storedIds) : [];
        console.log("[Repasar] IDs cargados:", repasarLexiconIds);
    }

    function saveRepasarIds() {
        localStorage.setItem(REPASAR_STORAGE_KEY, JSON.stringify(repasarLexiconIds));
        updateAllRepasarOptions();
    }

    function addRepasarId(id) {
        if (!repasarLexiconIds.includes(id)) {
            repasarLexiconIds.push(id);
            saveRepasarIds();
        }
    }

    function removeRepasarId(id) {
        repasarLexiconIds = repasarLexiconIds.filter(repasarId => repasarId !== id);
        saveRepasarIds();
    }

    function isRepasarItem(id) {
        return repasarLexiconIds.includes(id);
    }

    function getRepasarItems() {
        return lexiconData.filter(item => repasarLexiconIds.includes(item.id));
    }
    // --- FIN FUNCIONES "PALABRAS A REPASAR" ---

    // --- FUNCIÓN DE REPRODUCCIÓN DE AUDIO ---
    function playAudio(audioSrc) {
        if (!audioSrc) {
            console.warn("No audio source provided.");
            // Aquí podrías mostrar un mensaje al usuario si lo deseas
            return;
        }

        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0; // Rebobina el audio
        }

        currentAudio = new Audio(audioSrc);
        currentAudio.play().catch(error => {
            console.error(`Error playing audio: ${audioSrc}`, error);
            // Opcional: alert(`No se pudo reproducir el audio: ${audioSrc.split('/').pop()}.\nAsegúrate que el archivo existe en la carpeta 'audio'.`);
        });
    }
    // --- FIN FUNCIÓN DE AUDIO ---


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
                throw new Error("El archivo data.json no tiene el formato esperado.");
            }

            lexiconData = data.lexicon;
            phrasesData = data.phrases;
            console.log("Datos cargados:", { lexicon: lexiconData.length, phrases: phrasesData.length });
            
            loadRepasarIds();

            loadingMessageEl.style.display = 'none';
            mainContentEl.style.display = 'block';
            errorMessageEl.style.display = 'none';

            initializeApplication();

        } catch (error) {
            console.error("Error al cargar/procesar datos:", error);
            loadingMessageEl.style.display = 'none';
            errorMessageEl.textContent = `Error cargando datos: ${error.message}. Revisa data.json y la consola.`;
            errorMessageEl.style.display = 'block';
            mainContentEl.style.display = 'none';
        }
    }

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
                else console.error(`Sección ${sectionId} no encontrada.`);
                button.classList.add('active');

                if (currentAudio) { // Detener audio al cambiar de sección
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                }

                if (sectionId === 'memorama') resetMemoramaView();
                else if (sectionId === 'quiz') resetQuizView();
                else if (sectionId === 'flashcards') initializeFlashcardsView();
                if (sectionId === 'lexicon') filterAndDisplayLexicon();
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

    function updateRepasarOptionInSelect(selectElement) {
        if (!selectElement) return;
        let repasarOption = selectElement.querySelector('option[value="repasar"]');
        const repasarCount = repasarLexiconIds.length;
        if (repasarCount > 0) {
            if (!repasarOption) {
                repasarOption = document.createElement('option');
                repasarOption.value = 'repasar';
                const allOption = selectElement.querySelector('option[value="all"]');
                if (allOption && allOption.nextSibling) selectElement.insertBefore(repasarOption, allOption.nextSibling);
                else if (allOption) selectElement.appendChild(repasarOption);
                else selectElement.insertBefore(repasarOption, selectElement.firstChild);
            }
            repasarOption.textContent = `Palabras a Repasar (${repasarCount})`;
            repasarOption.disabled = false;
        } else {
            if (repasarOption) {
                if (selectElement.value === 'repasar') selectElement.value = 'all';
                repasarOption.disabled = true;
                repasarOption.textContent = `Palabras a Repasar (0) - Marca algunas`;
            }
        }
    }

    function updateAllRepasarOptions() {
        [quizCategorySelect, memoramaCategorySelect, flashcardCategorySelect].forEach(sel => {
            updateRepasarOptionInSelect(sel);
        });
    }

    function populateCategorySelect(selectElement, categories) {
        if (!selectElement || !categories) { console.warn("Selector o categorías no disponibles para poblar."); return; }
        const currentValue = selectElement.value;
        selectElement.innerHTML = '';
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = 'Todas las categorías';
        selectElement.appendChild(allOption);
        categories.filter(cat => cat !== 'all' && cat !== 'repasar').forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            selectElement.appendChild(option);
        });
        updateRepasarOptionInSelect(selectElement);
        if (Array.from(selectElement.options).some(opt => opt.value === currentValue)) {
            selectElement.value = currentValue;
        } else if (selectElement.options.length > 0) {
             selectElement.value = selectElement.options[0].value;
        }
        console.log(`Selector ${selectElement.id} poblado. Opción Repasar actualizada.`);
    }

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
            console.warn("Contenedor de filtros de léxico o datos no disponibles.");
            if(categoryFiltersContainer) categoryFiltersContainer.innerHTML = '';
            return;
        }
        const uniqueCategories = getUniqueCategories(lexiconData);
        const categoriesForButtons = ['all', ...uniqueCategories];
        categoryFiltersContainer.innerHTML = '';
        if (categoriesForButtons.length <= 1) {
            console.log("No hay categorías definidas para mostrar filtros de Léxico.");
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
            if (category === currentCategoryFilter) button.classList.add('active');
            button.addEventListener('click', handleCategoryFilterClick);
            categoryFiltersContainer.appendChild(button);
        });
    }

    function handleCategoryFilterClick(event) {
        currentCategoryFilter = event.target.dataset.category;
        document.querySelectorAll('.category-filter-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        filterAndDisplayLexicon();
    }

    function displayLexiconItems(itemsToShow) {
        if (!lexiconGrid) return;
        lexiconGrid.innerHTML = '';

        if (!itemsToShow || itemsToShow.length === 0) {
            const isFiltered = (lexiconSearchInput && lexiconSearchInput.value) || currentCategoryFilter !== 'all';
            const message = isFiltered ? 'No se encontraron coincidencias.' : 'No hay datos léxicos.';
            lexiconGrid.innerHTML = `<p class="text-center text-secondary" style="grid-column: 1 / -1;">${message}</p>`;
            return;
        }

        itemsToShow.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('lexicon-item');
            div.dataset.id = item.id;

            const imgSrc = item.image || 'images/placeholder.png';
            const spanishText = item.spanish || '???';
            const raramuriText = item.raramuri || '???';
            
            div.innerHTML = `
                <img src="${imgSrc}" 
                     alt="${spanishText}" 
                     loading="lazy" 
                     onerror="this.onerror=null; this.src='images/placeholder.png'; this.alt='Error al cargar: ${raramuriText}';"
                     class="${isRepasarItem(item.id) ? 'repasar-image-marked' : ''}" 
                     title="${isRepasarItem(item.id) ? 'Quitar de repasar (clic en imagen)' : 'Marcar para repasar (clic en imagen)'}">
                <div class="lexicon-word-container">
                    <p class="raramuri-word" lang="rar">${raramuriText}</p>
                    ${item.audio ? `<button class="play-audio-btn lexicon-audio-btn" data-audio-src="${item.audio}" aria-label="Reproducir audio de ${raramuriText}">🔊</button>` : ''}
                </div>
                <p class="spanish-word">${spanishText}</p>
            `;
            lexiconGrid.appendChild(div);

            const imageElementInDOM = div.querySelector('img');
            if (imageElementInDOM) {
                imageElementInDOM.addEventListener('click', (e) => {
                    toggleRepasarItemPorImagen(item.id, imageElementInDOM);
                });
            }

            if (item.audio) {
                const audioButtonInDOM = div.querySelector('.play-audio-btn.lexicon-audio-btn');
                if (audioButtonInDOM) {
                    audioButtonInDOM.addEventListener('click', (e) => {
                        e.stopPropagation();
                        playAudio(e.currentTarget.dataset.audio-src);
                    });
                }
            }
        });
    }

    function toggleRepasarItemPorImagen(itemId, imageElement) {
        if (isRepasarItem(itemId)) {
            removeRepasarId(itemId);
            imageElement.classList.remove('repasar-image-marked');
            imageElement.title = "Marcar para repasar (clic en imagen)";
        } else {
            addRepasarId(itemId);
            imageElement.classList.add('repasar-image-marked');
            imageElement.title = "Quitar de repasar (clic en imagen)";
        }
    }

    function filterAndDisplayLexicon() {
        if (!lexiconData) return;
        const searchTerm = lexiconSearchInput ? lexiconSearchInput.value.toLowerCase().trim() : '';
        let filteredItems = lexiconData;

        if (currentCategoryFilter !== 'all') {
            filteredItems = filteredItems.filter(item => item.category && item.category === currentCategoryFilter);
        }
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
                li.innerHTML = `<span class="raramuri-phrase" lang="rar">${phrase.raramuri}</span><span class="spanish-phrase">${phrase.spanish}</span>`;
                phrasesList.appendChild(li);
            }
        });
    }

    function resetMemoramaView() {
        console.log("[Memorama] Reseteando Vista");
        if (memoramaSetup) memoramaSetup.style.display = 'flex';
        if (memoramaGameArea) memoramaGameArea.style.display = 'none';
        if (memoramaWinMessage) memoramaWinMessage.style.display = 'none';
        if (memoramaDataErrorEl) memoramaDataErrorEl.style.display = 'none';
        if (memoramaGrid) memoramaGrid.innerHTML = '';
        difficultyButtons.forEach(btn => btn.classList.remove('selected'));
        updateRepasarOptionInSelect(memoramaCategorySelect);
        memoramaActive = false; mCards = []; mFlippedElements = []; mMatchedPairsCount = 0; mTotalPairs = 0; mAttempts = 0; mLockBoard = false;
        if (memoramaAttemptsEl) memoramaAttemptsEl.textContent = '0';
    }

    function createMemoramaFaceContent(cardInfo, faceElement) {
        if (!cardInfo || !faceElement) { console.error("[Memorama] Faltan parámetros en createMemoramaFaceContent"); return; }
        faceElement.innerHTML = '';
        try {
            if (cardInfo.type === 'image' && cardInfo.value) {
                const img = document.createElement('img'); img.src = cardInfo.value; img.alt = cardInfo.altText || "Imagen Memorama"; img.loading = 'lazy';
                img.onerror = function() { this.style.display = 'none'; const eP = document.createElement('p'); eP.textContent = 'Error Img!'; eP.style.color='red'; faceElement.appendChild(eP); };
                faceElement.appendChild(img);
            } else if (cardInfo.type === 'text' && cardInfo.value) {
                const textP = document.createElement('p'); textP.textContent = cardInfo.value; textP.setAttribute('lang', 'rar'); faceElement.appendChild(textP);
            } else {
                const fallbackP = document.createElement('p'); fallbackP.textContent = '??'; fallbackP.style.opacity='0.5'; faceElement.appendChild(fallbackP);
            }
        } catch (e) {
            console.error("[Memorama] Excepción en createMemoramaFaceContent:", e, cardInfo);
            try { faceElement.innerHTML = '<p style="color:red;">Error JS!</p>'; } catch (fe) {}
        }
    }

    function prepareCardData(requestedPairs) {
        const selectedCategory = memoramaCategorySelect ? memoramaCategorySelect.value : 'all';
        console.log(`[Memorama] Preparando datos para categoría: "${selectedCategory}", pares: ${requestedPairs}`);
        let itemsForCategory;
        if (selectedCategory === 'repasar') {
            itemsForCategory = getRepasarItems();
            if (itemsForCategory.length === 0) {
                console.warn(`[Memorama] No hay palabras marcadas para repasar.`);
                if (memoramaDataErrorEl) { memoramaDataErrorEl.textContent = `No has marcado palabras para repasar. Ve a la sección Léxico y marca algunas haciendo clic en su imagen ⭐.`; memoramaDataErrorEl.style.display = 'block'; }
                if (memoramaGameArea) memoramaGameArea.style.display = 'none'; if (memoramaSetup) memoramaSetup.style.display = 'flex';
                difficultyButtons.forEach(btn => btn.classList.remove('selected')); return null;
            }
        } else if (selectedCategory !== 'all') {
            itemsForCategory = lexiconData.filter(item => item.category && item.category === selectedCategory);
        } else { itemsForCategory = lexiconData; }
        const validItems = itemsForCategory.filter(item => item && item.id != null && item.image && item.raramuri && item.spanish);
        if (validItems.length < requestedPairs) {
            const categoryDisplayName = selectedCategory === 'all' ? "todas las categorías" : selectedCategory === 'repasar' ? "tus palabras a repasar" : `la categoría "${selectedCategory}"`;
            console.warn(`[Memorama] Datos insuficientes: ${validItems.length} items válidos con imagen en ${categoryDisplayName}, se necesitan ${requestedPairs} pares.`);
            if (memoramaDataErrorEl) { memoramaDataErrorEl.textContent = `Datos insuficientes (${validItems.length}) con imagen en ${categoryDisplayName} para ${requestedPairs} pares. Intenta otra categoría/dificultad o marca más palabras para repasar.`; memoramaDataErrorEl.style.display = 'block'; }
            if (memoramaGameArea) memoramaGameArea.style.display = 'none'; if (memoramaSetup) memoramaSetup.style.display = 'flex';
            difficultyButtons.forEach(btn => btn.classList.remove('selected')); return null;
        }
        if (memoramaDataErrorEl) memoramaDataErrorEl.style.display = 'none';
        const shuffledValidItems = shuffleArray(validItems);
        const itemsForGame = shuffledValidItems.slice(0, requestedPairs);
        return itemsForGame;
    }

    function buildMemoramaGrid() {
        if (!memoramaGrid) { console.error("[Memorama Error] #memorama-grid no encontrado."); return; }
        memoramaGrid.innerHTML = '';
        mCards.forEach((cardData, index) => {
            const cardElement = document.createElement('div'); cardElement.classList.add('memorama-card');
            if (cardData.id === undefined || cardData.id === null) { console.error(`[Memorama Error] ID indefinido carta ${index}`, cardData); return; }
            cardElement.dataset.id = cardData.id; cardElement.dataset.index = index;
            const frontFace = document.createElement('div'); frontFace.classList.add('card-face', 'card-front'); createMemoramaFaceContent(cardData, frontFace);
            const backFace = document.createElement('div'); backFace.classList.add('card-face', 'card-back');
            cardElement.appendChild(frontFace); cardElement.appendChild(backFace); cardElement.addEventListener('click', handleMemoramaCardClick);
            memoramaGrid.appendChild(cardElement);
        });
        let columns = Math.ceil(Math.sqrt(mCards.length)); columns = Math.max(2, Math.min(columns, 5));
        memoramaGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        console.log(`[Memorama] Grid construido con ${columns} columnas.`);
    }

    function startMemorama(numPairs) {
        console.log(`[Memorama] Iniciando con ${numPairs} pares.`); resetMemoramaView();
        const itemsForGame = prepareCardData(numPairs); if (!itemsForGame) { memoramaActive = false; return; }
        mTotalPairs = itemsForGame.length; memoramaActive = true; mCards = []; mAttempts = 0; mMatchedPairsCount = 0; mFlippedElements = []; mLockBoard = false;
        if (memoramaAttemptsEl) memoramaAttemptsEl.textContent = mAttempts; if (memoramaWinMessage) memoramaWinMessage.style.display = 'none';
        itemsForGame.forEach(item => {
            mCards.push({ id: item.id, type: 'image', value: item.image, altText: item.spanish });
            mCards.push({ id: item.id, type: 'text', value: item.raramuri });
        });
        mCards = shuffleArray(mCards); buildMemoramaGrid();
        if (memoramaSetup) memoramaSetup.style.display = 'none'; if (memoramaGameArea) memoramaGameArea.style.display = 'block';
        console.log(`[Memorama] Juego listo con ${mTotalPairs} pares y ${mCards.length} cartas.`);
    }

    function handleMemoramaCardClick(event) {
        if (!memoramaActive || mLockBoard || !event.currentTarget) return;
        const clickedCardElement = event.currentTarget;
        if (clickedCardElement.classList.contains('flipped') || clickedCardElement.classList.contains('matched')) return;
        clickedCardElement.classList.add('flipped'); mFlippedElements.push(clickedCardElement);
        if (mFlippedElements.length === 2) { mLockBoard = true; mAttempts++; if (memoramaAttemptsEl) memoramaAttemptsEl.textContent = mAttempts; checkMemoramaMatch(); }
    }

    function checkMemoramaMatch() {
        const [card1, card2] = mFlippedElements;
        if (!card1 || !card2) { console.error("[Memorama Critico] Faltan cartas en checkMemoramaMatch."); mFlippedElements = []; mLockBoard = false; return; }
        const isMatch = card1.dataset.id === card2.dataset.id;
        if (isMatch) {
            mMatchedPairsCount++;
            setTimeout(() => {
                card1.classList.add('matched'); card2.classList.add('matched'); mFlippedElements = []; mLockBoard = false;
                if (mMatchedPairsCount === mTotalPairs) {
                    console.log("[Memorama] ¡Juego Ganado!");
                    if (memoramaWinMessage) { memoramaWinMessage.textContent = `¡Felicidades! ${mTotalPairs} pares en ${mAttempts} intentos.`; memoramaWinMessage.style.display = 'block'; }
                    memoramaActive = false;
                }
            }, 300);
        } else {
            setTimeout(() => { card1.classList.remove('flipped'); card2.classList.remove('flipped'); mFlippedElements = []; mLockBoard = false; }, 1000);
        }
    }

    function setupMemoramaControls() {
        if (!memoramaSetup || !resetMemoramaBtn || difficultyButtons.length === 0 || !memoramaCategorySelect) { console.error("[Memorama Critico] Faltan elementos HTML para controles de Memorama."); return; }
        console.log("[Memorama] Configurando controles.");
        difficultyButtons.forEach(button => {
            button.addEventListener('click', () => {
                const pairs = parseInt(button.getAttribute('data-pairs'));
                if (isNaN(pairs) || pairs <= 0) { console.error("[Memorama Error] data-pairs inválido:", button); return; }
                difficultyButtons.forEach(btn => btn.classList.remove('selected')); button.classList.add('selected'); startMemorama(pairs);
            });
        });
        resetMemoramaBtn.addEventListener('click', () => {
            console.log("[Memorama] Botón Reset presionado.");
            const selectedBtn = document.querySelector('#memorama-setup .difficulty-btn.selected');
            if (selectedBtn) { const pairs = parseInt(selectedBtn.getAttribute('data-pairs')); if (!isNaN(pairs) && pairs > 0) { startMemorama(pairs); } else { resetMemoramaView(); } }
            else { resetMemoramaView(); }
        });
        memoramaCategorySelect.addEventListener('change', () => { console.log("[Memorama] Categoría cambiada. Reseteando vista para que el usuario elija dificultad."); resetMemoramaView(); });
    }

    function getWrongOptions(correctItem, count, sourceData, field) {
        if (!correctItem || !field || !sourceData) return [];
        const correctValueNorm = normalizeAnswer(correctItem[field]);
        const wrongAnswerPool = sourceData.filter(item => item && item.id !== correctItem.id && item[field] && normalizeAnswer(item[field]) !== correctValueNorm);
        const shuffledWrongs = shuffleArray([...wrongAnswerPool]); let options = new Set();
        for (const item of shuffledWrongs) { if (options.size >= count) break; options.add(item[field]); }
        let attempts = 0; const maxAttempts = sourceData.length * 2;
        while (options.size < count && attempts < maxAttempts) {
            const randomItem = sourceData[Math.floor(Math.random() * sourceData.length)];
            if (randomItem && randomItem[field] && normalizeAnswer(randomItem[field]) !== correctValueNorm) { options.add(randomItem[field]); }
            attempts++;
        }
        return Array.from(options);
    }

    function generateQuizQuestions(numQuestions) {
        const selectedCategory = quizCategorySelect ? quizCategorySelect.value : 'all';
        console.log(`[Quiz] Generando preguntas para categoría: "${selectedCategory}"`);
    
        let categoryFilteredItems;
        if (selectedCategory === 'repasar') {
            categoryFilteredItems = getRepasarItems();
            if (categoryFilteredItems.length === 0) {
                console.warn(`[Quiz] No hay palabras marcadas para repasar.`);
                if (quizDataErrorEl) {
                    quizDataErrorEl.textContent = `No has marcado palabras para repasar. Ve a la sección Léxico y marca algunas haciendo clic en su imagen ⭐.`;
                    quizDataErrorEl.style.display = 'block';
                }
                return [];
            }
        } else if (selectedCategory === 'all') {
            categoryFilteredItems = lexiconData.filter(item => item && item.id != null && item.raramuri && item.spanish);
        } else {
            categoryFilteredItems = lexiconData.filter(item =>
                item && item.id != null && item.raramuri && item.spanish &&
                item.category && item.category === selectedCategory
            );
        }
    
        if (categoryFilteredItems.length < 1) { 
            console.warn(`[Quiz] Datos insuficientes para "${selectedCategory}" (${categoryFilteredItems.length}).`);
            if (quizDataErrorEl) {
                const catDisplay = selectedCategory === 'all' ? 'todas las categorías' :
                                 selectedCategory === 'repasar' ? "tus palabras a repasar" :
                                 `la categoría "${selectedCategory}"`;
                quizDataErrorEl.textContent = `Datos insuficientes (${categoryFilteredItems.length}) para ${catDisplay}.`;
                quizDataErrorEl.style.display = 'block';
            }
            return [];
        } else {
            if (quizDataErrorEl) quizDataErrorEl.style.display = 'none';
        }
    
        const availableLexiconItems = categoryFilteredItems;
        const availableImageItems = availableLexiconItems.filter(item => item.image);
        const potentialQuestions = [];
    
        availableLexiconItems.forEach(item => {
            potentialQuestions.push({ type: 'MC_RaSp', item: item, question: `¿Qué significa "${item.raramuri}"?`, answer: item.spanish });
            potentialQuestions.push({ type: 'MC_SpRa', item: item, question: `¿Cómo se dice "${item.spanish}" en rarámuri?`, answer: item.raramuri });
            potentialQuestions.push({ type: 'TXT_SpRa', item: item, question: `Escribe "${item.spanish}" en rarámuri:`, answer: item.raramuri });
        });
        availableImageItems.forEach(item => {
            potentialQuestions.push({ type: 'MC_ImgRa', item: item, question: `¿Qué es esto en rarámuri?`, answer: item.raramuri, image: item.image });
            potentialQuestions.push({ type: 'TXT_ImgRa', item: item, question: `Escribe en rarámuri qué ves:`, answer: item.raramuri, image: item.image });
        });
    
        const shuffledPotentialQuestions = shuffleArray(potentialQuestions);
        let questionsToGenerate = 0;
        const totalPotential = shuffledPotentialQuestions.length;
    
        if (totalPotential === 0) {
            console.warn(`[Quiz] No se pudieron generar preguntas para "${selectedCategory}".`);
            if (quizDataErrorEl) {
                const catDisplay = selectedCategory === 'all' ? 'estas categorías' :
                                 selectedCategory === 'repasar' ? "tus palabras a repasar" :
                                 `la categoría "${selectedCategory}"`;
                quizDataErrorEl.textContent = `No se pudieron generar preguntas para ${catDisplay}.`;
                quizDataErrorEl.style.display = 'block';
            }
            return [];
        }
    
        if (numQuestions === 'all') { questionsToGenerate = totalPotential; }
        else { questionsToGenerate = Math.min(parseInt(numQuestions), totalPotential); }
        questionsToGenerate = Math.max(1, questionsToGenerate);
        const finalQuestions = shuffledPotentialQuestions.slice(0, questionsToGenerate);
    
        finalQuestions.forEach(q => {
            if (q.type.startsWith('MC_')) {
                let wrongOptions = []; let field = '';
                if (q.type === 'MC_RaSp') field = 'spanish';
                else if (q.type === 'MC_SpRa' || q.type === 'MC_ImgRa') field = 'raramuri';
    
                if (field && q.item) {
                    const potentialWrongPool = availableLexiconItems.filter(item => item && item.id !== q.item.id);
                    wrongOptions = getWrongOptions(q.item, 3, potentialWrongPool, field);
                    const allOptions = [q.answer, ...wrongOptions];
                    const uniqueOptions = Array.from(new Set(allOptions.filter(opt => opt && opt.trim() !== '')));
                    q.options = shuffleArray(uniqueOptions.slice(0, 4));
                } else { q.options = [q.answer]; console.warn("No se pudieron generar opciones MC válidas para:", q); }
                
                while(q.options.length < 2 && q.options.length < availableLexiconItems.length && availableLexiconItems.length >= 2) {
                    let randomItem = availableLexiconItems[Math.floor(Math.random() * availableLexiconItems.length)];
                    if (randomItem && randomItem[field] && randomItem[field] !== q.answer && !q.options.includes(randomItem[field])) {
                        q.options.push(randomItem[field]);
                    } else { 
                        break;
                    }
                }
                 if (q.options.length < 2) {
                     console.warn("Pregunta MC con <2 opciones:", q);
                 }
            }
        });
        console.log("[Quiz] Preguntas generadas:", finalQuestions);
        return finalQuestions;
    }
    
    function startQuiz(isRetry = false) {
        quizActive = true; score = 0; currentQuestionIndex = 0;
        if(quizDataErrorEl) quizDataErrorEl.style.display = 'none';

        if (!isRetry) {
            const selectedLength = quizLengthSelect ? quizLengthSelect.value : '5';
            allQuizQuestions = generateQuizQuestions(selectedLength);
            currentQuizSet = allQuizQuestions;
            missedQuestions = [];
        } else {
            currentQuizSet = shuffleArray([...missedQuestions]);
            missedQuestions = [];
            if (currentQuizSet.length === 0) { alert("¡Felicidades! No hubo preguntas falladas."); resetQuizView(); return; }
            console.log("[Quiz] Reintentando:", currentQuizSet);
        }

        if (!currentQuizSet || currentQuizSet.length === 0) {
            console.log("[Quiz] No hay preguntas en el set actual.");
            if(quizQuestionArea) quizQuestionArea.style.display = 'none';
            if(quizSetup) quizSetup.style.display = 'flex'; 
            if(quizResultsEl) quizResultsEl.style.display = 'none';
            if(retryMissedQuizBtn) retryMissedQuizBtn.style.display = 'none';
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
            console.error("[Quiz Error] Pregunta inválida:", q);
            if(quizFeedbackEl) { quizFeedbackEl.textContent = "Error al cargar pregunta."; quizFeedbackEl.className = 'incorrect'; }
            quizActive = false; if(nextQuestionBtn) nextQuestionBtn.style.display = 'inline-block';
            setTimeout(goToNextQuestion, 1000);
            return;
        }

        if(quizQuestionEl) quizQuestionEl.textContent = q.question;
        if(quizImageContainer) quizImageContainer.innerHTML = '';
        if(quizOptionsEl) { quizOptionsEl.innerHTML = ''; quizOptionsEl.style.display = 'none'; }
        if(quizTextInputArea) quizTextInputArea.style.display = 'none';
        if(quizTextAnswerInput) { quizTextAnswerInput.value = ''; quizTextAnswerInput.className = ''; quizTextAnswerInput.disabled = false; }
        if(submitTextAnswerBtn) submitTextAnswerBtn.disabled = false;
        if(quizFeedbackEl) { quizFeedbackEl.textContent = ''; quizFeedbackEl.className = ''; }
        if(nextQuestionBtn) nextQuestionBtn.style.display = 'none';

        if (q.image && quizImageContainer) {
            const img = document.createElement('img'); img.src = q.image; img.alt = `Imagen: ${q.question}`; img.loading = 'lazy';
            img.onerror = function() { this.alt = 'Error img'; this.src='images/placeholder.png'; };
            quizImageContainer.appendChild(img);
        }

        if (q.type.startsWith('MC_') && quizOptionsEl) {
            quizOptionsEl.style.display = 'block';
            if (!Array.isArray(q.options) || q.options.length === 0 ) { 
                console.error("[Quiz Error] MC sin opciones válidas:", q);
                quizOptionsEl.innerHTML = '<p style="color:var(--error-red);">Error opciones.</p>';
                if(q.options.length === 1) {
                    const button = document.createElement('button'); button.textContent = q.options[0]; button.disabled = false;
                    button.addEventListener('click', handleMCAnswer);
                    quizOptionsEl.appendChild(button);
                } else {
                    quizActive = false; if(nextQuestionBtn) nextQuestionBtn.style.display = 'inline-block';
                }

            } else {
                q.options.forEach(option => {
                    const button = document.createElement('button'); button.textContent = option; button.disabled = false;
                    button.addEventListener('click', handleMCAnswer);
                    quizOptionsEl.appendChild(button);
                });
            }
        } else if (q.type.startsWith('TXT_') && quizTextInputArea && quizTextAnswerInput && submitTextAnswerBtn) {
            quizTextInputArea.style.display = 'flex';
            if (q.answer) quizTextAnswerInput.setAttribute('lang', 'rar'); else quizTextAnswerInput.removeAttribute('lang');
            setTimeout(() => { if (quizTextAnswerInput) quizTextAnswerInput.focus(); }, 100);
        } else {
            console.error("[Quiz Error] Tipo de pregunta desconocido o elementos faltantes:", q.type, q);
            if(quizFeedbackEl) { quizFeedbackEl.textContent = "Error: Tipo desconocido."; quizFeedbackEl.className = 'incorrect'; }
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
            if(quizFeedbackEl) { quizFeedbackEl.textContent = "Error verificando respuesta."; quizFeedbackEl.className = 'incorrect'; }
            quizOptionsEl.querySelectorAll('button').forEach(btn => btn.disabled = true);
            if(nextQuestionBtn) nextQuestionBtn.style.display = 'inline-block';
            return;
        }
        const correctAnswer = currentQuestion.answer;
        const optionButtons = quizOptionsEl.querySelectorAll('button');
        optionButtons.forEach(btn => btn.disabled = true);

        if (selectedAnswer === correctAnswer) {
            score++; selectedButton.classList.add('correct');
            quizFeedbackEl.textContent = '¡Correcto!'; quizFeedbackEl.className = 'correct';
        } else {
            selectedButton.classList.add('incorrect');
            quizFeedbackEl.innerHTML = `Incorrecto. Correcto: <strong lang="${currentQuestion.answer.includes(' ') ? 'es' : 'rar'}">${correctAnswer}</strong>`; quizFeedbackEl.className = 'incorrect';
            if (currentQuestion.item && !missedQuestions.some(mq => mq.item.id === currentQuestion.item.id)) {
                missedQuestions.push(JSON.parse(JSON.stringify(currentQuestion)));
            }
            optionButtons.forEach(btn => { if (btn.textContent === correctAnswer) btn.classList.add('correct'); });
        }
        if(nextQuestionBtn) nextQuestionBtn.style.display = 'inline-block';
    }

    function handleTextAnswer() {
        if (!quizActive || !quizTextAnswerInput || !submitTextAnswerBtn || !quizFeedbackEl || !nextQuestionBtn) return;
        quizActive = false;
        const currentQuestion = currentQuizSet[currentQuestionIndex];
        if (!currentQuestion || typeof currentQuestion.answer === 'undefined') {
            console.error("[Quiz Error] handleTextAnswer: Pregunta/respuesta inválida.");
            if(quizFeedbackEl) { quizFeedbackEl.textContent = "Error verificando respuesta."; quizFeedbackEl.className = 'incorrect'; }
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
            score++; if (quizTextAnswerInput) quizTextAnswerInput.classList.add('correct');
            quizFeedbackEl.textContent = '¡Correcto!'; quizFeedbackEl.className = 'correct';
        } else {
            if (quizTextAnswerInput) quizTextAnswerInput.classList.add('incorrect');
            quizFeedbackEl.innerHTML = `Incorrecto. Correcto: <strong lang="rar">${originalCorrectAnswer}</strong>`; quizFeedbackEl.className = 'incorrect';
            if (currentQuestion.item && !missedQuestions.some(mq => mq.item.id === currentQuestion.item.id)) {
                missedQuestions.push(JSON.parse(JSON.stringify(currentQuestion)));
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
        quizActive = false; allQuizQuestions = []; currentQuizSet = []; missedQuestions = [];
        score = 0; currentQuestionIndex = 0;

        if(quizSetup) quizSetup.style.display = 'flex';
        if(quizQuestionArea) quizQuestionArea.style.display = 'none';
        if(quizResultsEl) quizResultsEl.style.display = 'none';
        if(retryMissedQuizBtn) retryMissedQuizBtn.style.display = 'none';

        if(quizCategorySelect) {
            if(quizCategorySelect.options.length > 0) quizCategorySelect.value = 'all';
            if(lexiconData.length > 0 && quizCategorySelect.options.length <= 1) { 
                const uniqueCategories = getUniqueCategories(lexiconData);
                populateCategorySelect(quizCategorySelect, uniqueCategories);
            } else {
                updateRepasarOptionInSelect(quizCategorySelect); 
            }
             // Deshabilitar si solo hay "all" Y no hay items para repasar
            quizCategorySelect.disabled = (Array.from(quizCategorySelect.options).filter(opt => opt.value !== 'repasar').length <= 1) && repasarLexiconIds.length === 0;
        }
        if(quizDataErrorEl) quizDataErrorEl.style.display = 'none';

        if(quizImageContainer) quizImageContainer.innerHTML = '';
        if(quizFeedbackEl) { quizFeedbackEl.textContent = ''; quizFeedbackEl.className = ''; }
        if(quizOptionsEl) quizOptionsEl.innerHTML = '';
        if(quizTextInputArea) quizTextInputArea.style.display = 'none';
        if(quizTextAnswerInput) { quizTextAnswerInput.value = ''; quizTextAnswerInput.className = ''; quizTextAnswerInput.removeAttribute('lang'); }
        if(quizQuestionEl) quizQuestionEl.textContent = '';
        if(quizLengthSelect) quizLengthSelect.value = "5";
        console.log("[Quiz] Vista reseteada.");
    }

    function setupQuizControls() {
        if (!startQuizBtn || !nextQuestionBtn || !restartQuizBtn || !retryMissedQuizBtn || !submitTextAnswerBtn || !quizTextAnswerInput || !quizLengthSelect || !quizCategorySelect) {
            console.error("[Quiz Error] Faltan elementos HTML esenciales para Quiz.");
            return;
        }
        console.log("[Quiz] Configurando controles.");
        startQuizBtn.addEventListener('click', () => startQuiz(false));
        nextQuestionBtn.addEventListener('click', goToNextQuestion);
        restartQuizBtn.addEventListener('click', resetQuizView);
        retryMissedQuizBtn.addEventListener('click', () => startQuiz(true));
        submitTextAnswerBtn.addEventListener('click', handleTextAnswer);
        quizTextAnswerInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' && !submitTextAnswerBtn.disabled) handleTextAnswer();
        });
        quizCategorySelect.addEventListener('change', () => {
            if(quizDataErrorEl) quizDataErrorEl.style.display = 'none';
        });
    }


    function prepareFlashcardData() {
        if (flashcardsLoadingEl) flashcardsLoadingEl.style.display = 'block';
        if (flashcardAreaEl) flashcardAreaEl.style.display = 'none';
        if (flashcardsErrorEl) flashcardsErrorEl.style.display = 'none';
        if (flashcardsDataErrorEl) flashcardsDataErrorEl.style.display = 'none';
    
        const selectedCategory = flashcardCategorySelect ? flashcardCategorySelect.value : 'all';
        console.log(`[Flashcards] Preparando para categoría: "${selectedCategory}"`);
    
        let categoryFilteredLexicon;
    
        if (selectedCategory === 'repasar') {
            categoryFilteredLexicon = getRepasarItems();
            if (categoryFilteredLexicon.length === 0) {
                console.warn(`[Flashcards] No hay palabras marcadas para repasar.`);
                if (flashcardsDataErrorEl) {
                    flashcardsDataErrorEl.textContent = `No has marcado palabras para repasar. Ve a la sección Léxico y marca algunas haciendo clic en su imagen ⭐.`;
                    flashcardsDataErrorEl.style.display = 'block';
                }
                if (flashcardsLoadingEl) flashcardsLoadingEl.style.display = 'none';
                flashcardData = [];
                return false;
            }
        } else if (selectedCategory === 'all') {
            categoryFilteredLexicon = lexiconData.filter(item =>
                item && item.id != null && item.raramuri && (item.spanish || item.image)
            );
        } else {
            categoryFilteredLexicon = lexiconData.filter(item =>
                item && item.id != null && item.raramuri && (item.spanish || item.image) &&
                (item.category && item.category === selectedCategory)
            );
        }
    
        console.log(`[Flashcards] Items válidos para "${selectedCategory}": ${categoryFilteredLexicon.length}`);
        if (categoryFilteredLexicon.length === 0) {
            console.warn(`[Flashcards] No hay datos para "${selectedCategory}".`);
            if (flashcardsDataErrorEl) {
                const catDisplay = selectedCategory === 'all' ? 'todas las categorías' :
                                 selectedCategory === 'repasar' ? "tus palabras a repasar" :
                                 `la categoría "${selectedCategory}"`;
                flashcardsDataErrorEl.textContent = `No hay datos para ${catDisplay}.`;
                flashcardsDataErrorEl.style.display = 'block';
            }
            if (flashcardsLoadingEl) flashcardsLoadingEl.style.display = 'none';
            flashcardData = [];
            return false;
        }
        if (flashcardsDataErrorEl) flashcardsDataErrorEl.style.display = 'none';
    
        flashcardData = shuffleArray([...categoryFilteredLexicon]);
        currentFlashcardIndex = 0;
        isFlashcardFlipped = false;
    
        if (flashcardsLoadingEl) flashcardsLoadingEl.style.display = 'none';
        if (flashcardAreaEl) flashcardAreaEl.style.display = 'block';
        return true;
    }
    

    function displayCurrentFlashcard() {
        if (!flashcardData || flashcardData.length === 0 || !flashcardAreaEl || flashcardAreaEl.style.display === 'none') {
            console.log("[Flashcards] No hay datos o área no visible.");
            if (flashcardCounterEl) flashcardCounterEl.textContent = '';
            if (flashcardAreaEl && (!flashcardData || flashcardData.length === 0)) {
                 flashcardAreaEl.style.display = 'none';
            }
            return;
        } else if (flashcardAreaEl && flashcardAreaEl.style.display === 'none') {
            flashcardAreaEl.style.display = 'block';
        }

        if (currentFlashcardIndex < 0 || currentFlashcardIndex >= flashcardData.length) {
            console.error(`[Flashcards] Índice inválido: ${currentFlashcardIndex}. Reseteando.`);
            currentFlashcardIndex = 0;
            if (!flashcardData[currentFlashcardIndex]) {
                console.error("[Flashcards] Datos faltan incluso en índice 0.");
                if (flashcardsErrorEl) { flashcardsErrorEl.textContent = 'Error al mostrar tarjeta.'; flashcardsErrorEl.style.display = 'block'; }
                if (flashcardAreaEl) flashcardAreaEl.style.display = 'none';
                return;
            }
        }
        const cardData = flashcardData[currentFlashcardIndex];
        if (flashcardEl) flashcardEl.classList.remove('flipped');
        isFlashcardFlipped = false;

        if (flashcardFrontEl) {
            flashcardFrontEl.innerHTML = '';
            let frontContentHTML = '';
            if (cardData.image) {
                frontContentHTML += `<img src="${cardData.image}" alt="${cardData.spanish || 'Flashcard Image'}" loading="lazy" onerror="this.onerror=null; this.src='images/placeholder.png';">`;
            } else if (cardData.spanish) {
                 frontContentHTML += `<p class="flashcard-text-content">${cardData.spanish}</p>`;
            } else { frontContentHTML += '<p class="flashcard-text-content">???</p>'; }
            flashcardFrontEl.innerHTML = frontContentHTML;
        }
         // La cara trasera SIEMPRE es rarámuri
        if (flashcardBackEl) {
            flashcardBackEl.innerHTML = '';
            let backHTML = `<p class="flashcard-text-content" lang="rar">${cardData.raramuri || '???'}</p>`;
            if (cardData.audio) {
                backHTML += `<button class="play-audio-btn flashcard-audio-btn" data-audio-src="${cardData.audio}" aria-label="Reproducir audio de ${cardData.raramuri}">🔊</button>`;
            }
            flashcardBackEl.innerHTML = backHTML;

            if (cardData.audio) {
                const audioButtonInDOM = flashcardBackEl.querySelector('.play-audio-btn.flashcard-audio-btn');
                if (audioButtonInDOM) {
                    audioButtonInDOM.addEventListener('click', (e) => {
                        e.stopPropagation(); // Prevent card from flipping when clicking the audio button
                        playAudio(e.currentTarget.dataset.audio-src);
                    });
                }
            }
        }
        
        if (flashcardCounterEl) flashcardCounterEl.textContent = `Tarjeta ${currentFlashcardIndex + 1} de ${flashcardData.length}`;
    }

    function flipFlashcard() {
        if (!flashcardEl || !flashcardData || flashcardData.length === 0) return; 
        flashcardEl.classList.toggle('flipped');
        isFlashcardFlipped = !isFlashcardFlipped;
    }

    function nextFlashcard() {
        if (!flashcardData || flashcardData.length === 0) return;
        currentFlashcardIndex++;
        if (currentFlashcardIndex >= flashcardData.length) currentFlashcardIndex = 0;
        displayCurrentFlashcard();
    }

    function prevFlashcard() {
        if (!flashcardData || flashcardData.length === 0) return;
        currentFlashcardIndex--;
        if (currentFlashcardIndex < 0) currentFlashcardIndex = flashcardData.length - 1;
        displayCurrentFlashcard();
    }

    function shuffleFlashcards() {
        console.log("[Flashcards] Barajando...");
        if (prepareFlashcardData()) {
            displayCurrentFlashcard();
        } else {
            if (flashcardAreaEl) flashcardAreaEl.style.display = 'none';
            if (flashcardCounterEl) flashcardCounterEl.textContent = '';
        }
    }

    function setupFlashcardsControls() {
        if (!flashcardEl || !prevFlashcardBtn || !flipFlashcardBtn || !nextFlashcardBtn || !shuffleFlashcardsBtn || !flashcardCategorySelect || !flashcardsSetupControls || !flashcardsDataErrorEl) {
            console.error("Faltan elementos de control Flashcards.");
            if (flashcardsErrorEl) { flashcardsErrorEl.textContent = "Error: Controles Flashcards no encontrados."; flashcardsErrorEl.style.display = 'block'; }
            if(flashcardsSetupControls) flashcardsSetupControls.style.display = 'none';
            return;
        }
        console.log("[Flashcards] Configurando controles.");
        // Añadido listener click al flashcardAreaEl para voltear, o podrías ponerlo en flashcardEl
        if(flashcardAreaEl) flashcardAreaEl.addEventListener('click', (e) => {
             // Asegúrate de no voltear si haces clic en los botones de control o en el botón de audio
             if (!e.target.closest('#flashcard-controls') && !e.target.classList.contains('play-audio-btn')) {
                  flipFlashcard();
             }
        });
        flipFlashcardBtn.addEventListener('click', flipFlashcard);
        nextFlashcardBtn.addEventListener('click', nextFlashcard);
        prevFlashcardBtn.addEventListener('click', prevFlashcard);
        shuffleFlashcardsBtn.addEventListener('click', shuffleFlashcards);
        
        flashcardCategorySelect.addEventListener('change', () => {
            console.log("[Flashcards] Categoría cambiada. Recargando.");
            if (prepareFlashcardData()) {
                displayCurrentFlashcard();
            } else {
                if (flashcardAreaEl) flashcardAreaEl.style.display = 'none';
                if (flashcardCounterEl) flashcardCounterEl.textContent = '';
            }
        });
    }

    function initializeFlashcardsView() {
        console.log("[Flashcards] Inicializando vista...");
        if(flashcardsDataErrorEl) flashcardsDataErrorEl.style.display = 'none'; 

        if(lexiconData.length > 0 && flashcardCategorySelect) {
            if (flashcardCategorySelect.options.length <=1 ) {
                const uniqueCategories = getUniqueCategories(lexiconData);
                populateCategorySelect(flashcardCategorySelect, uniqueCategories);
            } else { 
                updateRepasarOptionInSelect(flashcardCategorySelect);
            }
            // Deshabilitar si solo hay "all" Y no hay items para repasar
            flashcardCategorySelect.disabled = (Array.from(flashcardCategorySelect.options).filter(opt => opt.value !== 'repasar').length <= 1) && repasarLexiconIds.length === 0;

        } else if (lexiconData.length === 0) {
            console.warn("[Flashcards] No hay datos léxicos. Flashcards no pueden inicializar.");
            if(flashcardCategorySelect) flashcardCategorySelect.disabled = true;
            if(flashcardsSetupControls) flashcardsSetupControls.style.display = 'flex';
            if (flashcardsDataErrorEl) {
                flashcardsDataErrorEl.textContent = 'No hay datos léxicos para Flashcards.';
                flashcardsDataErrorEl.style.display = 'block';
            }
            if (flashcardsLoadingEl) flashcardsLoadingEl.style.display = 'none';
            if (flashcardAreaEl) flashcardAreaEl.style.display = 'none';
            return;
        }

        if(prepareFlashcardData()) {
            displayCurrentFlashcard();
        } else {
            if (flashcardAreaEl) flashcardAreaEl.style.display = 'none';
        }
    }


    function initializeApplication() {
        if (!mainContentEl || !navButtons || !contentSections || !lexiconGrid || !phrasesList || !memoramaGrid || !quizContainer || !flashcardsContainer || !categoryFiltersContainer || !quizCategorySelect || !flashcardCategorySelect || !memoramaCategorySelect || !flashcardsSetupControls || !flashcardsDataErrorEl || !quizDataErrorEl ) {
            console.error("Error Crítico: Faltan elementos HTML esenciales. Revisa IDs en index.html.");
            if(errorMessageEl) { errorMessageEl.textContent = "Error crítico al iniciar: Elementos faltantes. Consulta la consola."; errorMessageEl.style.display = 'block'; }
            if(loadingMessageEl) loadingMessageEl.style.display = 'none';
            if(mainContentEl) mainContentEl.style.display = 'none';
            return;
        }
        console.log("Chequeo de elementos HTML OK. Inicializando módulos...");

        setupNavigation();
        populatePhrases();
        setupSearch();
        populateCategoryFilters();
        // filterAndDisplayLexicon(); // Se llama al cargar la página y al cambiar filtro/buscar


        if(lexiconData.length > 0) {
            const uniqueCategories = getUniqueCategories(lexiconData);
            populateCategorySelect(quizCategorySelect, uniqueCategories);
            populateCategorySelect(flashcardCategorySelect, uniqueCategories);
            populateCategorySelect(memoramaCategorySelect, uniqueCategories);

            // Deshabilitar selectores si solo tienen "all" Y no hay items para repasar
             [quizCategorySelect, flashcardCategorySelect, memoramaCategorySelect].forEach(sel => {
                if (sel) {
                    const nonRepasarOptionsCount = Array.from(sel.options).filter(opt => opt.value !== 'repasar').length;
                     sel.disabled = nonRepasarOptionsCount <= 1 && repasarLexiconIds.length === 0;
                }
            });

        } else {
            console.warn("No hay datos léxicos. Selectores de categoría deshabilitados.");
            [quizCategorySelect, flashcardCategorySelect, memoramaCategorySelect].forEach(sel => {
                if (sel) sel.disabled = true;
            });

            const noDataMsg = 'No hay datos léxicos disponibles.';
            if (flashcardsDataErrorEl && flashcardsSetupControls) { flashcardsSetupControls.style.display = 'flex'; flashcardsDataErrorEl.textContent = noDataMsg; flashcardsDataErrorEl.style.display = 'block'; if(flashcardAreaEl) flashcardAreaEl.style.display='none'; }
            if (quizDataErrorEl && quizSetup) { quizSetup.style.display = 'flex'; quizDataErrorEl.textContent = noDataMsg; quizDataErrorEl.style.display = 'block'; if(quizQuestionArea) quizQuestionArea.style.display='none'; if(quizResultsEl) quizResultsEl.style.display='none'; }
            if (memoramaDataErrorEl && memoramaSetup) { memoramaSetup.style.display = 'flex'; memoramaDataErrorEl.textContent = noDataMsg; memoramaDataErrorEl.style.display = 'block'; if(memoramaGameArea) memoramaGameArea.style.display='none'; }
        }

        setupMemoramaControls();
        setupQuizControls();
        setupFlashcardsControls();
        
        updateAllRepasarOptions(); // Asegura que los selectores muestren el conteo correcto al inicio
        filterAndDisplayLexicon(); // Muestra el léxico inicial con los bordes correctos


        console.log("Aplicación inicializada.");
    }
    loadData();
});
