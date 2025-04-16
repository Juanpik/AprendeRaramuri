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


    // --- VARIABLES GLOBALES JUEGOS ---
    // Memorama
    let memoramaActive = false; // Indica si un juego está en curso
    let mCards = []; // Array para los datos de las cartas (id, type, value)
    let mFlippedElements = []; // Array para los ELEMENTOS DOM volteados (máx 2)
    let mMatchedPairsCount = 0;
    let mTotalPairs = 0;
    let mAttempts = 0;
    let mLockBoard = false; // Para prevenir clicks rápidos
    // Quiz
    let allQuizQuestions = [];
    let currentQuizSet = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let quizActive = false;
    let missedQuestions = [];

    // --- FUNCIÓN PARA CARGAR DATOS ---
    async function loadData() {
        try {
            const response = await fetch('data.json', { cache: 'no-cache' });
            if (!response.ok) {
                throw new Error(`Error al cargar data.json: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            if (!data || typeof data !== 'object') {
                throw new Error("El archivo data.json no contiene un objeto JSON válido.");
            }
            lexiconData = Array.isArray(data.lexicon) ? data.lexicon : [];
            phrasesData = Array.isArray(data.phrases) ? data.phrases : [];

            console.log("Datos cargados:", { lexicon: lexiconData.length, phrases: phrasesData.length });

            loadingMessageEl.style.display = 'none';
            mainContentEl.style.display = 'block';
            errorMessageEl.style.display = 'none';

            initializeApplication();

        } catch (error) {
            console.error("Error al cargar o procesar los datos:", error);
            loadingMessageEl.style.display = 'none';
            errorMessageEl.textContent = `Error al cargar los datos de la aplicación: ${error.message}. Por favor, verifica que el archivo 'data.json' existe, está en la misma carpeta y tiene el formato JSON correcto. Revisa la consola del navegador (F12) para más detalles.`;
            errorMessageEl.style.display = 'block';
            mainContentEl.style.display = 'none';
        }
    }

    // --- FUNCIONES DE LA APLICACIÓN ---

    // -- Utilidades --
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    function normalizeAnswer(text) {
        if (!text) return '';
        return text.toLowerCase().trim();
    }

    // -- Navegación --
    function setupNavigation() {
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const sectionId = button.getAttribute('data-section');
                contentSections.forEach(section => section.classList.remove('active'));
                navButtons.forEach(btn => btn.classList.remove('active'));
                const currentSection = document.getElementById(sectionId);
                if (currentSection) {
                     currentSection.classList.add('active');
                } else {
                    console.error(`Sección con ID '${sectionId}' no encontrada.`);
                }
                button.classList.add('active');

                if (sectionId === 'memorama') resetMemoramaView();
                else if (sectionId === 'quiz') resetQuizView();
            });
        });
        const aboutButton = document.querySelector('nav button[data-section="about"]');
        const aboutSection = document.getElementById('about');
        if (aboutButton && aboutSection) {
            aboutButton.classList.add('active');
            aboutSection.classList.add('active');
        } else {
            if (navButtons.length > 0 && contentSections.length > 0) {
                navButtons[0].classList.add('active');
                contentSections[0].classList.add('active');
            }
        }
    }

    // -- Léxico --
    function displayLexiconItems(itemsToShow) {
        if (!lexiconGrid) return;
        lexiconGrid.innerHTML = '';
        if (!itemsToShow || itemsToShow.length === 0) {
             lexiconGrid.innerHTML = '<p style="text-align: center; color: var(--grey-dark);">No se encontraron coincidencias.</p>';
             return;
        }
        itemsToShow.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('lexicon-item');
            const imgSrc = item.image || 'images/placeholder.png';
            const spanishText = item.spanish || '???';
            const raramuriText = item.raramuri || '???';
            div.innerHTML = `
                <img src="${imgSrc}" alt="${spanishText}" loading="lazy" onerror="this.onerror=null; this.src='images/placeholder.png'; this.alt='Error al cargar ${raramuriText}'; this.parentElement.insertAdjacentHTML('beforeend', '<p style=\'font-size:0.8em; color:var(--error-red);\'>Img error</p>');">
                <p class="raramuri-word">${raramuriText}</p>
                <p class="spanish-word">${spanishText}</p>
            `;
            lexiconGrid.appendChild(div);
        });
    }
    function handleSearch() {
        if (!lexiconSearchInput) return;
        const searchTerm = lexiconSearchInput.value.toLowerCase().trim();
        const filteredItems = lexiconData.filter(item => {
            const raramuriMatch = (item.raramuri || '').toLowerCase().includes(searchTerm);
            const spanishMatch = (item.spanish || '').toLowerCase().includes(searchTerm);
            return raramuriMatch || spanishMatch;
        });
        displayLexiconItems(filteredItems);
    }
    function setupSearch() {
        if (lexiconSearchInput) {
            lexiconSearchInput.addEventListener('input', handleSearch);
        } else {
            console.error("Elemento de búsqueda del léxico no encontrado.");
        }
    }

    // -- Frases --
    function populatePhrases() {
        if (!phrasesList) return;
        phrasesList.innerHTML = '';
        if (!phrasesData || phrasesData.length === 0) {
             phrasesList.innerHTML = '<li>No hay frases disponibles.</li>';
             return;
        }
        phrasesData.forEach(phrase => {
            if (phrase.raramuri && phrase.spanish) {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="raramuri-phrase">${phrase.raramuri}</span>
                    <span class="spanish-phrase">${phrase.spanish}</span>
                `;
                phrasesList.appendChild(li);
            }
        });
    }

    // =============================================
    // ========= SECCIÓN MEMORAMA (Desde Cero V2 - Reforzado) =========
    // =============================================

    /**
     * Reinicia la vista del memorama, mostrando la selección de dificultad.
     */
    function resetMemoramaView() {
        console.log("[Memorama V2] Reseteando Vista");
        if(memoramaSetup) memoramaSetup.style.display = 'block';
        if(memoramaGameArea) memoramaGameArea.style.display = 'none';
        if(memoramaWinMessage) memoramaWinMessage.style.display = 'none';
        if(memoramaDataErrorEl) memoramaDataErrorEl.style.display = 'none';
        if(memoramaGrid) memoramaGrid.innerHTML = '';
        difficultyButtons.forEach(btn => btn.classList.remove('selected'));
        memoramaActive = false;
        mCards = [];
        mFlippedElements = [];
        mMatchedPairsCount = 0;
        mTotalPairs = 0;
        mAttempts = 0;
        mLockBoard = false;
        if(memoramaAttemptsEl) memoramaAttemptsEl.textContent = '0';
    }

     /**
     * Función auxiliar para crear y añadir contenido a la cara frontal
     */
     function createFrontFaceContent(cardInfo, frontFaceElement) {
        if (!cardInfo || !frontFaceElement) {
            console.error("[Memorama Error Critico] Faltan parámetros en createFrontFaceContent");
            return;
        }
        frontFaceElement.innerHTML = '';
        let contentAdded = false;

        try {
            if (cardInfo.type === 'image' && cardInfo.value) {
                // console.log(`[Memorama V2 DEBUG] Intentando añadir IMG: ${cardInfo.value} a frontFace`);
                const img = document.createElement('img');
                img.src = cardInfo.value;
                img.alt = cardInfo.altText || "Memorama Img";
                img.loading = 'lazy';
                img.onerror = function() {
                    console.error(`[Memorama Error Critico] Falló la carga de IMG: ${this.src} (ID: ${cardInfo.id})`);
                    this.style.display='none';
                    const errorP = document.createElement('p');
                    errorP.textContent = 'Error Img!';
                    errorP.style.color = 'red';
                    errorP.style.fontSize = '10px';
                    frontFaceElement.appendChild(errorP);
                    contentAdded = true;
                };
                img.onload = function() {
                     // console.log(`[Memorama DEBUG] Imagen ${this.src} CARGADA OK.`);
                };
                frontFaceElement.appendChild(img);
                contentAdded = true;

            } else if (cardInfo.type === 'text' && cardInfo.value) {
                // console.log(`[Memorama V2 DEBUG] Intentando añadir TEXT: ${cardInfo.value} a frontFace`);
                const textP = document.createElement('p');
                textP.textContent = cardInfo.value;
                frontFaceElement.appendChild(textP);
                contentAdded = true;

            } else {
                console.warn(`[Memorama V2 Warn] Contenido inválido para carta (ID: ${cardInfo.id}):`, cardInfo);
                const fallbackP = document.createElement('p');
                fallbackP.textContent = '??';
                fallbackP.style.opacity = '0.5';
                frontFaceElement.appendChild(fallbackP);
                contentAdded = true;
            }

            if (!contentAdded || frontFaceElement.children.length === 0) {
                 console.warn(`[Memorama V2 Warn Critico] frontFaceElement (ID: ${cardInfo.id}) quedó vacío.`);
            }

        } catch (e) {
             console.error("[Memorama Error Critico] Excepción en createFrontFaceContent:", e, cardInfo);
             try { frontFaceElement.innerHTML = '<p style="color:red; font-size:10px;">Error JS!</p>'; } catch (finalError) {}
        }
    }


    /**
     * Selecciona los items del léxico y valida si hay suficientes.
     * @param {number} requestedPairs Pares solicitados.
     * @returns {Array|null} Array de items léxicos para el juego o null si no hay suficientes.
     */
    function prepareCardData(requestedPairs) {
        const validItems = lexiconData.filter(item =>
            item && item.id != null && item.image && item.raramuri && item.spanish
        );

        if (validItems.length < requestedPairs) {
            console.warn(`[Memorama V2] Datos insuficientes. Necesarios: ${requestedPairs}, Disponibles: ${validItems.length}`);
            if(memoramaDataErrorEl) {
                memoramaDataErrorEl.textContent = `No hay suficientes datos léxicos completos (${validItems.length}) para ${requestedPairs} pares.`;
                memoramaDataErrorEl.style.display = 'block';
            }
             if(memoramaSetup) memoramaSetup.style.display = 'block';
             difficultyButtons.forEach(btn => btn.classList.remove('selected'));
            return null;
        }
        return shuffleArray(validItems).slice(0, requestedPairs);
    }


     /**
     * Construye el grid de cartas en el DOM.
     */
    function buildMemoramaGrid() {
        if (!memoramaGrid) {
            console.error("[Memorama V2 Error] Elemento #memorama-grid no encontrado.");
            return;
        }
        memoramaGrid.innerHTML = '';

        mCards.forEach((cardData, index) => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('memorama-card');
            if (cardData.id === undefined || cardData.id === null) {
                console.error(`[Memorama V2 Error] ID indefinido para carta ${index}`, cardData);
                return; // Saltar esta carta
            }
            cardElement.dataset.id = cardData.id;
            cardElement.dataset.index = index;

            const frontFace = document.createElement('div');
            frontFace.classList.add('card-face', 'card-front');

            const backFace = document.createElement('div');
            backFace.classList.add('card-face', 'card-back');

            // Poblar cara frontal ANTES de añadir al DOM principal
            createFrontFaceContent(cardData, frontFace);

            cardElement.appendChild(frontFace);
            cardElement.appendChild(backFace);
            cardElement.addEventListener('click', handleMemoramaCardClick);
            memoramaGrid.appendChild(cardElement);
        });

        // Ajustar columnas CSS
        let columns = 4;
        const numCards = mCards.length;
        if (numCards <= 6) columns = 3;
        else if (numCards <= 9) columns = 3;
        else if (numCards <= 12) columns = 4;
        else if (numCards <= 16) columns = 4;
        else columns = 5;
        memoramaGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    }

    /**
     * Inicia un nuevo juego de Memorama.
     * @param {number} numPairs Número de pares deseado.
     */
    function startMemorama(numPairs) {
        console.log(`[Memorama V2] Iniciando startMemorama con ${numPairs} pares.`);
        resetMemoramaView(); // Siempre resetear vista primero

        const itemsForGame = prepareCardData(numPairs);
        if (!itemsForGame) {
            memoramaActive = false;
            return; // Detener si no hay datos
        }

        mTotalPairs = itemsForGame.length;
        memoramaActive = true;
        mCards = [];

        itemsForGame.forEach(item => {
            mCards.push({ id: item.id, type: 'image', value: item.image, altText: item.spanish });
            mCards.push({ id: item.id, type: 'text', value: item.raramuri });
        });

        mCards = shuffleArray(mCards);
        buildMemoramaGrid(); // Construir el grid

        // Mostrar área de juego sólo si todo fue bien
        if(memoramaSetup) memoramaSetup.style.display = 'none';
        if(memoramaGameArea) memoramaGameArea.style.display = 'block';
        console.log(`[Memorama V2] Juego listo con ${mTotalPairs} pares.`);
    }


    /**
     * Manejador de click en una carta.
     * @param {Event} event
     */
    function handleMemoramaCardClick(event) {
        if (!memoramaActive || mLockBoard) return;

        const clickedCardElement = event.currentTarget;

        if (clickedCardElement.classList.contains('flipped') || clickedCardElement.classList.contains('matched')) {
            return;
        }

        // Voltear
        clickedCardElement.classList.add('flipped');
        mFlippedElements.push(clickedCardElement);
        console.log(`[Memorama V2] Carta ${clickedCardElement.dataset.index} volteada. Flipped: ${mFlippedElements.length}`);

        // Comprobar si hay 2 volteadas
        if (mFlippedElements.length === 2) {
            mLockBoard = true;
            mAttempts++;
            if (memoramaAttemptsEl) memoramaAttemptsEl.textContent = mAttempts;
            checkMemoramaMatch();
        }
    }

    /**
     * Comprueba si las dos cartas en mFlippedElements coinciden.
     */
    function checkMemoramaMatch() {
        console.log("[Memorama V2] checkMemoramaMatch");
        const [card1, card2] = mFlippedElements;
        if (!card1 || !card2) {
            console.error("[Memorama V2 Error Critico] Faltan cartas en checkMemoramaMatch");
            mFlippedElements = []; mLockBoard = false; return;
        }
        const isMatch = card1.dataset.id === card2.dataset.id;
        console.log(`[Memorama V2] Comparando ${card1.dataset.id} vs ${card2.dataset.id}. Coinciden: ${isMatch}`);

        if (isMatch) {
            // Es un par
            mMatchedPairsCount++;
            console.log(`[Memorama V2] ¡Par! (${mMatchedPairsCount}/${mTotalPairs})`);
             // Aplicar 'matched' y desbloquear después de un pequeño delay
            setTimeout(() => {
                card1.classList.add('matched');
                card2.classList.add('matched');
                mFlippedElements = [];
                mLockBoard = false;
                // Comprobar victoria
                if (mMatchedPairsCount === mTotalPairs) {
                    console.log("[Memorama V2] ¡Juego Completado!");
                    if(memoramaWinMessage) {
                        memoramaWinMessage.textContent = `¡Felicidades! Encontraste ${mTotalPairs} pares en ${mAttempts} intentos.`;
                        memoramaWinMessage.style.display = 'block';
                    }
                    memoramaActive = false;
                }
            }, 200);
        } else {
            // No es par, voltear de nuevo
            console.log("[Memorama V2] No es par.");
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                mFlippedElements = [];
                mLockBoard = false;
            }, 1000); // Delay más largo para verlas
        }
    }


    /**
     * Configura los listeners para los botones de control del memorama.
     */
    function setupMemoramaControls() {
        if (!memoramaSetup || !resetMemoramaBtn || difficultyButtons.length === 0) {
             console.error("[Memorama V2 Error Critico] Faltan elementos HTML para controles.");
             return;
        }
        console.log("[Memorama V2] Configurando controles.");

        difficultyButtons.forEach(button => {
            button.addEventListener('click', () => {
                const pairs = parseInt(button.getAttribute('data-pairs'));
                if (isNaN(pairs) || pairs <= 0) {
                    console.error("[Memorama V2 Error] Pares inválidos en botón:", button);
                    return;
                }
                difficultyButtons.forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');
                startMemorama(pairs);
            });
        });

        resetMemoramaBtn.addEventListener('click', () => {
             console.log("[Memorama V2] Botón Reset presionado.");
             const selectedBtn = document.querySelector('#memorama-setup .difficulty-btn.selected');
             if (selectedBtn) {
                 const pairs = parseInt(selectedBtn.getAttribute('data-pairs'));
                  if (!isNaN(pairs) && pairs > 0) {
                    startMemorama(pairs);
                  } else { resetMemoramaView(); }
             } else { resetMemoramaView(); }
        });
    }

    // =============================================
    // ========= FIN SECCIÓN MEMORAMA (Desde Cero V2) =========
    // =============================================


    // --- Quiz ---
    function getWrongOptions(correctItem, count, sourceData, field) {
        if (!correctItem || !field) return [];
         const correctValueNorm = normalizeAnswer(correctItem[field]);
         const wrongAnswerPool = sourceData.filter(item =>
             item && item.id !== correctItem.id && item[field] &&
             normalizeAnswer(item[field]) !== correctValueNorm
         );
         const shuffledWrongs = shuffleArray([...wrongAnswerPool]);
         let options = [];
         let addedValues = new Set();

         for (const item of shuffledWrongs) {
             if (options.length >= count) break;
             const potentialOption = item[field];
             const potentialOptionNorm = normalizeAnswer(potentialOption);
             if (!addedValues.has(potentialOptionNorm)) {
                 options.push(potentialOption);
                 addedValues.add(potentialOptionNorm);
             }
         }

         let attempts = 0;
         const maxAttempts = sourceData.length * 2;
         while (options.length < count && attempts < maxAttempts) {
             const randomItem = sourceData[Math.floor(Math.random() * sourceData.length)];
             if (randomItem && randomItem.id !== correctItem.id && randomItem[field]) {
                  const potentialOption = randomItem[field];
                  const potentialOptionNorm = normalizeAnswer(potentialOption);
                  if (potentialOptionNorm !== correctValueNorm && !addedValues.has(potentialOptionNorm)) {
                     options.push(potentialOption);
                     addedValues.add(potentialOptionNorm);
                  }
             }
             attempts++;
         }
         return options;
     }
    function generateQuizQuestions(numQuestions) {
         const availableLexiconItems = lexiconData.filter(item => item && item.raramuri && item.spanish && item.id);
         const availableImageItems = availableLexiconItems.filter(item => item.image);

        if (availableLexiconItems.length < 2) {
             console.error("Quiz: Se necesitan al menos 2 entradas léxicas completas.");
             if(quizDataErrorEl) {
                 quizDataErrorEl.textContent = "No hay suficientes datos léxicos para generar el quiz (se necesitan al menos 2 entradas completas).";
                 quizDataErrorEl.style.display = 'block';
             }
             return [];
        } else {
            if(quizDataErrorEl) quizDataErrorEl.style.display = 'none';
        }

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
        let questionsToGenerate = 0;
        const totalPotential = shuffledPotentialQuestions.length;
        if (numQuestions === 'all') {
            questionsToGenerate = totalPotential;
        } else {
            questionsToGenerate = Math.min(parseInt(numQuestions), totalPotential);
        }
        questionsToGenerate = Math.max(1, questionsToGenerate);
        if (totalPotential === 0) return [];

        const finalQuestions = shuffledPotentialQuestions.slice(0, questionsToGenerate);

        finalQuestions.forEach(q => {
            if (q.type.startsWith('MC_')) {
                let wrongOptions = [];
                let field = '';
                let correctLexiconItem = q.item;

                if (q.type === 'MC_RaSp') field = 'spanish';
                else if (q.type === 'MC_SpRa' || q.type === 'MC_ImgRa') field = 'raramuri';

                if (field && correctLexiconItem) {
                     wrongOptions = getWrongOptions(correctLexiconItem, 3, lexiconData, field);
                     const allOptions = [q.answer, ...wrongOptions];
                     const uniqueOptions = Array.from(new Set(allOptions));
                     q.options = shuffleArray(uniqueOptions.slice(0, 4));
                 } else {
                     q.options = [q.answer];
                     console.warn("No se pudieron generar opciones para la pregunta MC:", q);
                 }
                 if (q.options.length < 2) {
                     console.warn("Pregunta MC generada con menos de 2 opciones únicas:", q);
                 }
            }
        });

        const validFinalQuestions = finalQuestions.filter(q => !q.options || q.options.length >= 1);
        console.log("[Quiz] Generated Valid Questions:", validFinalQuestions);
        return validFinalQuestions;
     }
    function startQuiz(isRetry = false) {
         quizActive = true;
         score = 0;
         currentQuestionIndex = 0;

         if (!isRetry) {
             const selectedLength = quizLengthSelect.value;
             allQuizQuestions = generateQuizQuestions(selectedLength);
             currentQuizSet = allQuizQuestions;
             missedQuestions = [];
         } else {
             currentQuizSet = shuffleArray([...missedQuestions]);
             missedQuestions = [];
             if (currentQuizSet.length === 0) {
                 alert("¡No hubo preguntas falladas para reintentar!");
                 resetQuizView();
                 return;
             }
             console.log("[Quiz] Retrying missed questions:", currentQuizSet);
         }

         if (!currentQuizSet || currentQuizSet.length === 0) {
             if(quizQuestionArea) quizQuestionArea.style.display = 'none';
             if(quizSetup) quizSetup.style.display = 'block';
             if(quizResultsEl) quizResultsEl.style.display = 'none';
             if(retryMissedQuizBtn) retryMissedQuizBtn.style.display = 'none';
             if(quizDataErrorEl) {
                 quizDataErrorEl.style.display = quizDataErrorEl.textContent ? 'block' : 'none';
                 if (!quizDataErrorEl.textContent) {
                     quizDataErrorEl.textContent = "No se pudieron generar preguntas.";
                     quizDataErrorEl.style.display = 'block';
                 }
             }
             quizActive = false;
             return;
         }

         if(quizSetup) quizSetup.style.display = 'none';
         if(quizResultsEl) quizResultsEl.style.display = 'none';
         if(retryMissedQuizBtn) retryMissedQuizBtn.style.display = 'none';
         if(quizQuestionArea) quizQuestionArea.style.display = 'block';
         if(nextQuestionBtn) nextQuestionBtn.style.display = 'none';
         if(quizDataErrorEl) quizDataErrorEl.style.display = 'none';

         displayQuestion();
     }
    function displayQuestion() {
        if (currentQuestionIndex >= currentQuizSet.length) {
            showResults();
            return;
        }
        quizActive = true;
        const q = currentQuizSet[currentQuestionIndex];

        if (!q || !q.type || !q.question || typeof q.answer === 'undefined') {
            console.error("[Quiz Error] Pregunta inválida en displayQuestion:", q);
            goToNextQuestion();
            return;
        }

        if(quizQuestionEl) quizQuestionEl.textContent = q.question;
        if(quizImageContainer) quizImageContainer.innerHTML = '';
        if(quizOptionsEl) {
            quizOptionsEl.innerHTML = '';
            quizOptionsEl.style.display = 'none';
        }
        if(quizTextInputArea) quizTextInputArea.style.display = 'none';
        if(quizTextAnswerInput) {
            quizTextAnswerInput.value = '';
            quizTextAnswerInput.className = '';
        }
        if(quizFeedbackEl) {
            quizFeedbackEl.textContent = '';
            quizFeedbackEl.className = '';
        }
        if(nextQuestionBtn) nextQuestionBtn.style.display = 'none';

        if (q.image && quizImageContainer) {
            const img = document.createElement('img');
            img.src = q.image;
            img.alt = `Imagen para la pregunta`;
            img.loading = 'lazy';
            img.onerror = function() {
                console.error(`[Quiz Error] No se pudo cargar imagen: ${this.src}`);
                this.alt = 'Error img';
                this.src='images/placeholder.png';
            };
            quizImageContainer.appendChild(img);
        }

        if (q.type.startsWith('MC_') && quizOptionsEl) {
            quizOptionsEl.style.display = 'block';
            if (!q.options || q.options.length === 0) {
                 console.error("[Quiz Error] Pregunta MC sin opciones:", q);
                 quizOptionsEl.innerHTML = '<p style="color:var(--error-red)">Error: Faltan opciones.</p>';
            } else {
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
            quizTextAnswerInput.disabled = false;
            submitTextAnswerBtn.disabled = false;
            setTimeout(() => quizTextAnswerInput.focus(), 100);
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
            goToNextQuestion(); return;
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
            quizFeedbackEl.innerHTML = `Incorrecto. La respuesta correcta es: <strong>${correctAnswer}</strong>`;
            quizFeedbackEl.className = 'incorrect';
            if (currentQuestion.item) {
                if (!missedQuestions.some(mq => mq.item.id === currentQuestion.item.id)) {
                    missedQuestions.push(JSON.parse(JSON.stringify(currentQuestion)));
                }
            }
            optionButtons.forEach(btn => {
                if (btn.textContent === correctAnswer) {
                    btn.classList.add('correct');
                }
            });
        }
        nextQuestionBtn.style.display = 'inline-block';
    }
    function handleTextAnswer() {
         if (!quizActive || !quizTextAnswerInput || !submitTextAnswerBtn || !quizFeedbackEl || !nextQuestionBtn) return;
         quizActive = false;
         const currentQuestion = currentQuizSet[currentQuestionIndex];
         if (!currentQuestion || typeof currentQuestion.answer === 'undefined') {
             console.error("[Quiz Error] handleTextAnswer: Pregunta/respuesta inválida.");
             goToNextQuestion(); return;
         }
         const userAnswer = normalizeAnswer(quizTextAnswerInput.value);
         const correctAnswer = normalizeAnswer(currentQuestion.answer);
         const originalCorrectAnswer = currentQuestion.answer;

         quizTextAnswerInput.disabled = true;
         submitTextAnswerBtn.disabled = true;

         if (userAnswer === correctAnswer && userAnswer !== '') {
             score++;
             quizTextAnswerInput.classList.add('correct');
             quizFeedbackEl.textContent = '¡Correcto!';
             quizFeedbackEl.className = 'correct';
         } else {
             quizTextAnswerInput.classList.add('incorrect');
             quizFeedbackEl.innerHTML = `Incorrecto. La respuesta correcta es: <strong>${originalCorrectAnswer}</strong>`;
             quizFeedbackEl.className = 'incorrect';
            if (currentQuestion.item) {
                if (!missedQuestions.some(mq => mq.item.id === currentQuestion.item.id)) {
                    missedQuestions.push(JSON.parse(JSON.stringify(currentQuestion)));
                }
            }
         }
         nextQuestionBtn.style.display = 'inline-block';
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
        allQuizQuestions = [];
        currentQuizSet = [];
        // No limpiar missedQuestions aquí, se hace al iniciar nuevo quiz normal
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
        if(quizLengthSelect) quizLengthSelect.value = "5";
    }
    function setupQuizControls() {
         if (!startQuizBtn || !nextQuestionBtn || !restartQuizBtn || !retryMissedQuizBtn || !submitTextAnswerBtn || !quizTextAnswerInput) {
             console.error("[Quiz Error] Faltan elementos de control del Quiz en setupQuizControls.");
             return;
         }
         startQuizBtn.addEventListener('click', () => startQuiz(false));
         nextQuestionBtn.addEventListener('click', goToNextQuestion);
         restartQuizBtn.addEventListener('click', resetQuizView);
         retryMissedQuizBtn.addEventListener('click', () => startQuiz(true));
         submitTextAnswerBtn.addEventListener('click', handleTextAnswer);
         quizTextAnswerInput.addEventListener('keypress', function (e) {
             if (e.key === 'Enter' && !submitTextAnswerBtn.disabled) {
                 handleTextAnswer();
             }
         });
     }

    // --- Inicialización App ---
    function initializeApplication() {
        if (!mainContentEl || !navButtons || !contentSections || !lexiconGrid || !phrasesList || !memoramaGrid || !quizContainer) {
            console.error("Faltan elementos esenciales del DOM. Verifica tu HTML.");
            if(errorMessageEl) {
                errorMessageEl.textContent = "Error: Faltan elementos HTML esenciales.";
                errorMessageEl.style.display = 'block';
            }
            return;
        }
        setupNavigation();
        displayLexiconItems(lexiconData);
        populatePhrases();
        setupSearch();
        setupMemoramaControls(); // Llamar a la función de configuración del Memorama V2
        setupQuizControls();
        console.log("Aplicación inicializada.");
    }

    // --- Punto de Entrada ---
    loadData();

}); // Fin DOMContentLoaded
