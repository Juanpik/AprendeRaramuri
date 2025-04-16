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
    let memoramaCards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let totalPairs = 0;
    let memoramaAttempts = 0;
    let lockBoard = false;
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
            // Añadir 'cache: no-cache' para intentar evitar problemas de caché durante el desarrollo
            const response = await fetch('data.json', { cache: 'no-cache' });
            if (!response.ok) {
                throw new Error(`Error al cargar data.json: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            // Validar estructura básica
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
        // Crear una copia para no modificar el array original
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
                <img src="${imgSrc}" alt="${spanishText}" onerror="this.onerror=null; this.src='images/placeholder.png'; this.alt='Error al cargar ${raramuriText}'; this.parentElement.insertAdjacentHTML('beforeend', '<p style=\'font-size:0.8em; color:var(--error-red);\'>Img error</p>');">
                <p class="raramuri-word">${raramuriText}</p>
                <p class="spanish-word">${spanishText}</p>
            `;
            lexiconGrid.appendChild(div);
        });
    }
    function handleSearch() {
        const searchTerm = lexiconSearchInput.value.toLowerCase().trim();
        const filteredItems = lexiconData.filter(item => {
            const raramuriMatch = (item.raramuri || '').toLowerCase().includes(searchTerm);
            const spanishMatch = (item.spanish || '').toLowerCase().includes(searchTerm);
            return raramuriMatch || spanishMatch;
        });
        displayLexiconItems(filteredItems);
    }
    function setupSearch() {
        if (lexiconSearchInput) { // Verificar que el elemento existe
            lexiconSearchInput.addEventListener('input', handleSearch);
        } else {
            console.error("Elemento de búsqueda del léxico no encontrado.");
        }
    }

    // -- Frases --
    function populatePhrases() {
        phrasesList.innerHTML = '';
        if (!phrasesData || phrasesData.length === 0) {
             phrasesList.innerHTML = '<li>No hay frases disponibles.</li>';
             return;
        }
        phrasesData.forEach(phrase => {
            // Solo mostrar frases que tengan tanto raramuri como español
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

    // --- Memorama ---

    // Función auxiliar para crear y añadir contenido a la cara frontal
    function createFrontFaceContent(cardInfo, frontFaceElement) {
        if (!cardInfo || !frontFaceElement) {
            console.error("Error interno: Faltan cardInfo o frontFaceElement en createFrontFaceContent");
            return;
        }

        // Limpiar contenido previo (por si acaso)
        frontFaceElement.innerHTML = '';

        if (cardInfo.type === 'image' && cardInfo.value) {
            // console.log(`Creando imagen para ID ${cardInfo.id}: ${cardInfo.value}`); // DEBUG
            const img = document.createElement('img');
            img.src = cardInfo.value;
            img.alt = cardInfo.altText || "Imagen Memorama";
            img.loading = 'lazy';
            img.onerror = function() {
                console.error(`MEMORAMA: Error al cargar imagen: ${this.src} (ID: ${cardInfo.id})`);
                this.style.display = 'none'; // Ocultar imagen rota
                const errorText = document.createElement('p');
                errorText.textContent = `Error img`; // Mensaje corto
                errorText.style.fontSize = '0.8em';
                errorText.style.color = 'var(--error-red)';
                frontFaceElement.appendChild(errorText);
            };
            img.onload = function() {
                // console.log(`Imagen cargada: ${this.src}`); // DEBUG (opcional)
            }
            frontFaceElement.appendChild(img);

        } else if (cardInfo.type === 'text' && cardInfo.value) {
            // console.log(`Creando texto para ID ${cardInfo.id}: ${cardInfo.value}`); // DEBUG
            const textP = document.createElement('p');
            textP.textContent = cardInfo.value;
            frontFaceElement.appendChild(textP);

        } else {
            console.warn(`Contenido inválido o faltante para carta memorama (ID: ${cardInfo.id}):`, cardInfo);
            const fallbackText = document.createElement('p');
            fallbackText.textContent = '???';
            fallbackText.style.opacity = '0.5';
            frontFaceElement.appendChild(fallbackText);
        }
    }


    function createMemoramaCards() {
        const itemsWithImages = lexiconData.filter(item =>
            item && item.id && item.image && item.raramuri && item.spanish
        );

        if (itemsWithImages.length < totalPairs) {
            console.warn(`Memorama Create: No hay suficientes items completos (${itemsWithImages.length}) para ${totalPairs} pares.`);
            totalPairs = itemsWithImages.length; // Reducir para jugar con lo que hay
            if (totalPairs < 1) return [];
             // El mensaje de error al usuario se mostrará en startMemorama si es necesario
        }

        const shuffledLexicon = shuffleArray([...itemsWithImages]);
        const itemsForGame = shuffledLexicon.slice(0, totalPairs);

        const cardData = [];
        itemsForGame.forEach(item => {
            cardData.push({ type: 'image', value: item.image, id: item.id, altText: item.spanish });
            cardData.push({ type: 'text', value: item.raramuri, id: item.id });
        });
        // console.log("Card Data Generada:", cardData); // DEBUG
        return shuffleArray(cardData);
    }

    function initMemorama() {
        console.log("Iniciando Memorama..."); // DEBUG
        memoramaGrid.innerHTML = '';
        memoramaWinMessage.style.display = 'none';
        flippedCards = [];
        matchedPairs = 0;
        memoramaAttempts = 0;
        memoramaAttemptsEl.textContent = memoramaAttempts;
        lockBoard = false;
        memoramaDataErrorEl.style.display = 'none'; // Ocultar errores previos

        memoramaCards = createMemoramaCards();

        if (memoramaCards.length === 0 || memoramaCards.length % 2 !== 0) {
            console.error("Error final al generar cartas de memorama o número impar. Cartas:", memoramaCards);
            memoramaGrid.innerHTML = '<p>Error al generar cartas. Verifica los datos léxicos.</p>';
            memoramaGameArea.style.display = 'none';
            memoramaDataErrorEl.textContent = "Error interno al generar cartas.";
            memoramaDataErrorEl.style.display = 'block';
            return;
        }
        memoramaGameArea.style.display = 'block';
        console.log(`Generando ${memoramaCards.length} cartas para ${totalPairs} pares.`); // DEBUG

        memoramaCards.forEach((cardInfo, index) => {
            // console.log(`Creando elemento para carta ${index}, ID: ${cardInfo.id}, Tipo: ${cardInfo.type}`); // DEBUG
            const cardElement = document.createElement('div');
            cardElement.classList.add('memorama-card');
            // Asegurarse de que cardInfo.id existe antes de asignarlo
            if (cardInfo.id === undefined || cardInfo.id === null) {
                console.error(`Error: ID indefinido para carta ${index}`, cardInfo);
                return; // Saltar esta carta si no tiene ID
            }
            cardElement.dataset.id = cardInfo.id;
            cardElement.dataset.index = index;

            const frontFace = document.createElement('div');
            frontFace.classList.add('card-face', 'card-front');

            const backFace = document.createElement('div');
            backFace.classList.add('card-face', 'card-back');

            // Llamar a la función para poblar la cara frontal
            createFrontFaceContent(cardInfo, frontFace);

            // Añadir las caras al elemento de la carta
            cardElement.appendChild(frontFace);
            cardElement.appendChild(backFace);

            // Añadir el listener
            cardElement.addEventListener('click', handleCardClick);

            // Añadir la carta completa al grid
            memoramaGrid.appendChild(cardElement);
        });

        // Ajustar columnas del grid
        let columns = 4;
        const numCards = memoramaCards.length;
        if (numCards <= 6) columns = 3;
        else if (numCards <= 9) columns = 3;
        else if (numCards <= 12) columns = 4;
        else if (numCards <= 16) columns = 4;
        else columns = 5;
        memoramaGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        console.log("Memorama inicializado correctamente."); // DEBUG
    }

    function startMemorama(numPairs) {
         console.log(`Intentando iniciar memorama con ${numPairs} pares.`); // DEBUG
        const itemsWithImages = lexiconData.filter(item => item && item.id && item.image && item.raramuri && item.spanish);
         if (itemsWithImages.length < numPairs) {
             console.warn(`Memorama Start: No hay suficientes items completos (${itemsWithImages.length}) para ${numPairs} pares.`);
             memoramaDataErrorEl.textContent = `No hay suficientes datos léxicos completos (${itemsWithImages.length}) para esta dificultad (${numPairs} pares).`;
             memoramaDataErrorEl.style.display = 'block';
             memoramaGameArea.style.display = 'none';
             memoramaSetup.style.display = 'block';
             difficultyButtons.forEach(btn => btn.classList.remove('selected'));
             return;
         }

        totalPairs = numPairs;
        memoramaSetup.style.display = 'none';
        // No mostramos gameArea aquí, initMemorama lo hará si todo va bien
        memoramaGameArea.style.display = 'none';
        memoramaWinMessage.style.display = 'none';
        memoramaDataErrorEl.style.display = 'none';
        initMemorama(); // initMemorama se encarga de mostrar gameArea si tiene éxito
    }

    function handleCardClick(event) {
        const clickedCard = event.currentTarget;
        // console.log("Card Clicked:", clickedCard.dataset.index, "ID:", clickedCard.dataset.id); // DEBUG
        if (lockBoard || clickedCard.classList.contains('flipped') || clickedCard.classList.contains('matched')) {
             // console.log("Click ignorado (locked/flipped/matched)"); // DEBUG
            return;
        }
        flipCard(clickedCard);
        flippedCards.push(clickedCard);
        // console.log("Flipped Cards:", flippedCards.map(c => c.dataset.index)); // DEBUG
        if (flippedCards.length === 2) {
            lockBoard = true;
            memoramaAttempts++;
            memoramaAttemptsEl.textContent = memoramaAttempts;
            // console.log("Checking for match..."); // DEBUG
            checkForMatch();
        }
    }
    function flipCard(card) {
        // console.log("Flipping card:", card.dataset.index); // DEBUG
        card.classList.add('flipped');
    }
    function unflipCards() {
        // console.log("Unflipping cards"); // DEBUG
        setTimeout(() => {
            flippedCards.forEach(card => card.classList.remove('flipped'));
            flippedCards = [];
            lockBoard = false;
        }, 1100);
    }
    // function disableCards() { // Ya no se usa, se maneja en checkForMatch
    //     console.log("Disabling cards (handled by matched class now)"); // DEBUG
    //     // flippedCards.forEach(card => card.classList.add('matched')); // No quitar flipped
    //     // flippedCards = [];
    //     // lockBoard = false;
    // }
    function checkForMatch() {
        const [card1, card2] = flippedCards;
        if (!card1 || !card2) { // Salvaguarda
            console.error("Error en checkForMatch: Faltan cartas en flippedCards.");
            lockBoard = false;
            flippedCards = [];
            return;
        }
        const isMatch = card1.dataset.id && card1.dataset.id === card2.dataset.id;
        // console.log(`Match check: ID ${card1.dataset.id} vs ${card2.dataset.id}. Result: ${isMatch}`); // DEBUG

        if (isMatch) {
            matchedPairs++;
             console.log(`Match found! Pair ${matchedPairs}/${totalPairs}`); // DEBUG
             // Dejar las cartas 'flipped' y añadir 'matched' con un pequeño delay
             setTimeout(() => {
                card1.classList.add('matched');
                card2.classList.add('matched');
                 // Limpiar flippedCards y desbloquear *después* de marcar como matched
                 flippedCards = [];
                 lockBoard = false;
                if (matchedPairs === totalPairs) {
                    console.log("Game Won!"); // DEBUG
                    memoramaWinMessage.textContent = `¡Felicidades! Encontraste ${totalPairs} pares en ${memoramaAttempts} intentos.`;
                    memoramaWinMessage.style.display = 'block';
                }
            }, 300); // Delay para que se vea el match antes del borde/opacidad (opcional)
        } else {
            // console.log("No match."); // DEBUG
            unflipCards(); // Esto quita 'flipped' y limpia flippedCards/lockBoard
        }
    }
    function resetMemoramaView() {
        console.log("Reseteando vista de Memorama."); // DEBUG
        memoramaSetup.style.display = 'block';
        memoramaGameArea.style.display = 'none';
        memoramaWinMessage.style.display = 'none';
        memoramaDataErrorEl.style.display = 'none';
        difficultyButtons.forEach(btn => btn.classList.remove('selected'));
        memoramaGrid.innerHTML = '';
        // Resetear variables de estado por si acaso
        flippedCards = [];
        matchedPairs = 0;
        memoramaAttempts = 0;
        totalPairs = 0; // Resetear totalPairs también
        lockBoard = false;
    }
    function setupMemoramaControls() {
        if (!memoramaSetup || !resetMemoramaBtn) {
             console.error("Faltan elementos de control del memorama.");
             return;
        }
        difficultyButtons.forEach(button => {
            button.addEventListener('click', () => {
                const pairs = parseInt(button.getAttribute('data-pairs'));
                if (isNaN(pairs)) {
                    console.error("Valor de pares inválido en botón:", button);
                    return;
                }
                difficultyButtons.forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');
                startMemorama(pairs);
            });
        });
        resetMemoramaBtn.addEventListener('click', () => {
             const selectedBtn = document.querySelector('.difficulty-btn.selected');
             if (selectedBtn) {
                 const pairs = parseInt(selectedBtn.getAttribute('data-pairs'));
                  if (!isNaN(pairs)) {
                    startMemorama(pairs); // Reinicia con la dificultad seleccionada
                  } else {
                      resetMemoramaView(); // Fallback si el valor no es numérico
                  }
             } else {
                 resetMemoramaView(); // Si no hay dificultad seleccionada, solo resetea
             }
        });
    }

    // --- (Resto del código JS: Quiz, Inicialización, etc. sin cambios) ---
    // Asegúrate de que la función initializeApplication llame a setupMemoramaControls()
     function initializeApplication() {
         // Verificar que los elementos principales existen antes de continuar
        if (!mainContentEl || !lexiconGrid || !phrasesList || !memoramaGrid || !quizContainer) {
            console.error("Faltan elementos esenciales del DOM. Verifica tu HTML.");
            errorMessageEl.textContent = "Error: Faltan elementos HTML esenciales.";
            errorMessageEl.style.display = 'block';
            return;
        }

        setupNavigation();
        displayLexiconItems(lexiconData);
        populatePhrases();
        setupSearch();
        setupMemoramaControls(); // <--- Llamada importante
        setupQuizControls();
        console.log("Aplicación inicializada.");
    }

    // --- (El resto del JS, como las funciones del Quiz, loadData, etc., se mantienen igual que en la respuesta anterior) ---
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
             quizDataErrorEl.textContent = "No hay suficientes datos léxicos para generar el quiz (se necesitan al menos 2 entradas completas).";
             quizDataErrorEl.style.display = 'block';
             return [];
        } else {
            quizDataErrorEl.style.display = 'none';
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
        console.log("Generated Valid Quiz Questions:", validFinalQuestions);
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
             console.log("Retrying missed questions:", currentQuizSet);
         }

         if (!currentQuizSet || currentQuizSet.length === 0) {
             quizQuestionArea.style.display = 'none';
             quizSetup.style.display = 'block';
             quizResultsEl.style.display = 'none';
             retryMissedQuizBtn.style.display = 'none';
             quizDataErrorEl.style.display = quizDataErrorEl.textContent ? 'block' : 'none';
             if (!quizDataErrorEl.textContent) {
                 quizDataErrorEl.textContent = "No se pudieron generar preguntas.";
                 quizDataErrorEl.style.display = 'block';
             }
             quizActive = false;
             return;
         }

         quizSetup.style.display = 'none';
         quizResultsEl.style.display = 'none';
         retryMissedQuizBtn.style.display = 'none';
         quizQuestionArea.style.display = 'block';
         nextQuestionBtn.style.display = 'none';
         quizDataErrorEl.style.display = 'none';

         displayQuestion();
     }
    function displayQuestion() {
        if (currentQuestionIndex >= currentQuizSet.length) {
            showResults();
            return;
        }
        quizActive = true;
        const q = currentQuizSet[currentQuestionIndex];

        if (!q || !q.type || !q.question || typeof q.answer === 'undefined') { // typeof para permitir respuesta ""
            console.error("Pregunta inválida encontrada en displayQuestion:", q);
            goToNextQuestion();
            return;
        }

        quizQuestionEl.textContent = q.question;
        quizImageContainer.innerHTML = '';
        quizOptionsEl.innerHTML = '';
        quizOptionsEl.style.display = 'none';
        quizTextInputArea.style.display = 'none';
        quizTextAnswerInput.value = '';
        quizTextAnswerInput.className = '';
        quizFeedbackEl.textContent = '';
        quizFeedbackEl.className = '';
        nextQuestionBtn.style.display = 'none';

        if (q.image) {
            const img = document.createElement('img');
            img.src = q.image;
            img.alt = `Imagen para la pregunta`;
            img.loading = 'lazy';
            img.onerror = function() {
                console.error(`Error al cargar imagen del quiz: ${this.src}`);
                this.alt = 'Error al cargar imagen';
                this.src='images/placeholder.png';
            };
            quizImageContainer.appendChild(img);
        }

        if (q.type.startsWith('MC_')) {
            quizOptionsEl.style.display = 'block';
            if (!q.options || q.options.length === 0) {
                 console.error("Pregunta MC sin opciones:", q);
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
        } else if (q.type.startsWith('TXT_')) {
            quizTextInputArea.style.display = 'flex';
            quizTextAnswerInput.disabled = false;
            submitTextAnswerBtn.disabled = false;
            setTimeout(() => quizTextAnswerInput.focus(), 100);
        }
    }
    function handleMCAnswer(event) {
        if (!quizActive) return;
        quizActive = false;
        const selectedButton = event.target;
        const selectedAnswer = selectedButton.textContent;
        const currentQuestion = currentQuizSet[currentQuestionIndex];
        if (!currentQuestion || typeof currentQuestion.answer === 'undefined') {
            console.error("Error interno: Pregunta o respuesta no definida en handleMCAnswer.");
            goToNextQuestion();
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
            quizFeedbackEl.innerHTML = `Incorrecto. La respuesta correcta es: <strong>${correctAnswer}</strong>`;
            quizFeedbackEl.className = 'incorrect';
            if (currentQuestion.item) {
                 missedQuestions.push(JSON.parse(JSON.stringify(currentQuestion)));
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
         if (!quizActive) return;
         quizActive = false;
         const currentQuestion = currentQuizSet[currentQuestionIndex];
         if (!currentQuestion || typeof currentQuestion.answer === 'undefined') {
            console.error("Error interno: Pregunta o respuesta no definida en handleTextAnswer.");
            goToNextQuestion();
            return;
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
                 missedQuestions.push(JSON.parse(JSON.stringify(currentQuestion)));
            }
         }
         nextQuestionBtn.style.display = 'inline-block';
     }
    function goToNextQuestion() {
        currentQuestionIndex++;
        setTimeout(displayQuestion, 50);
    }
    function showResults() {
        quizQuestionArea.style.display = 'none';
        quizResultsEl.style.display = 'block';
        quizScoreEl.textContent = score;
        quizTotalEl.textContent = currentQuizSet.length;
        quizActive = false;

         const wasMainQuizRound = (currentQuizSet === allQuizQuestions);
         const uniqueMissedQuestions = [];
         const addedIds = new Set();

         missedQuestions.forEach(q => {
             const key = q && q.item ? q.item.id : null;
             if (key !== null && !addedIds.has(key)) {
                 uniqueMissedQuestions.push(q);
                 addedIds.add(key);
             }
         });

         missedQuestions = uniqueMissedQuestions;

         if (missedQuestions.length > 0 && wasMainQuizRound) {
              retryMissedQuizBtn.style.display = 'inline-block';
         } else {
              retryMissedQuizBtn.style.display = 'none';
              if (missedQuestions.length === 0) missedQuestions = [];
         }
    }
    function resetQuizView() {
        quizActive = false;
        allQuizQuestions = [];
        currentQuizSet = [];
        quizSetup.style.display = 'block';
        quizQuestionArea.style.display = 'none';
        quizResultsEl.style.display = 'none';
        retryMissedQuizBtn.style.display = 'none';
        quizDataErrorEl.style.display = 'none';
        quizImageContainer.innerHTML = '';
        quizFeedbackEl.textContent = '';
        quizFeedbackEl.className = '';
        quizOptionsEl.innerHTML = '';
        quizTextAnswerInput.value = '';
        quizTextAnswerInput.className = '';
        quizQuestionEl.textContent = '';
        quizLengthSelect.value = "5";
    }
    function setupQuizControls() {
         if (!startQuizBtn || !nextQuestionBtn || !restartQuizBtn || !retryMissedQuizBtn || !submitTextAnswerBtn || !quizTextAnswerInput) {
             console.error("Faltan elementos de control del Quiz.");
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
        if (!mainContentEl || !lexiconGrid || !phrasesList || !memoramaGrid || !quizContainer) {
            console.error("Faltan elementos esenciales del DOM. Verifica tu HTML.");
            errorMessageEl.textContent = "Error: Faltan elementos HTML esenciales.";
            errorMessageEl.style.display = 'block';
            return;
        }
        setupNavigation();
        displayLexiconItems(lexiconData);
        populatePhrases();
        setupSearch();
        setupMemoramaControls();
        setupQuizControls();
        console.log("Aplicación inicializada.");
    }

    // --- Punto de Entrada ---
    loadData();

}); // Fin DOMContentLoaded
