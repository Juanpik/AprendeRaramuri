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

    // -- Memorama --
    function createMemoramaCards() {
        const itemsWithImages = lexiconData.filter(item =>
            item && item.id && item.image && item.raramuri && item.spanish
        );

        // No mostrar error aquí, la validación principal está en startMemorama
        if (itemsWithImages.length < totalPairs) {
            console.warn(`Memorama Create: No hay suficientes items (${itemsWithImages.length}) para ${totalPairs} pares.`);
            // Reducir los pares si es necesario para poder jugar con lo que hay
            totalPairs = itemsWithImages.length;
            if (totalPairs < 1) return []; // Imposible jugar
        }

        const shuffledLexicon = shuffleArray([...itemsWithImages]);
        const itemsForGame = shuffledLexicon.slice(0, totalPairs);

        const cardData = [];
        itemsForGame.forEach(item => {
            cardData.push({ type: 'image', value: item.image, id: item.id, altText: item.spanish });
            cardData.push({ type: 'text', value: item.raramuri, id: item.id });
        });
        return shuffleArray(cardData);
    }

    function initMemorama() {
        memoramaGrid.innerHTML = '';
        memoramaWinMessage.style.display = 'none';
        flippedCards = [];
        matchedPairs = 0;
        memoramaAttempts = 0;
        memoramaAttemptsEl.textContent = memoramaAttempts;
        lockBoard = false;

        memoramaCards = createMemoramaCards(); // Llama a la función que ya maneja la reducción de pares

        if (memoramaCards.length === 0 || memoramaCards.length % 2 !== 0) {
            console.error("Error final al generar cartas de memorama o número impar.");
            memoramaGrid.innerHTML = '<p>Error al generar cartas. Verifica los datos léxicos.</p>';
            memoramaGameArea.style.display = 'none'; // Ocultar área si no se puede jugar
            memoramaDataErrorEl.textContent = "Error interno al generar cartas.";
            memoramaDataErrorEl.style.display = 'block';
            return; // No continuar
        }
        memoramaGameArea.style.display = 'block'; // Asegurar que sea visible

        memoramaCards.forEach((cardInfo, index) => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('memorama-card');
            cardElement.dataset.id = cardInfo.id;
            cardElement.dataset.index = index;

            const frontFace = document.createElement('div');
            frontFace.classList.add('card-face', 'card-front');

            const backFace = document.createElement('div');
            backFace.classList.add('card-face', 'card-back');

            // Añadir contenido a la Cara Frontal
            if (cardInfo.type === 'image' && cardInfo.value) {
                const img = document.createElement('img');
                img.src = cardInfo.value;
                img.alt = cardInfo.altText || "Imagen Memorama";
                img.loading = 'lazy'; // Carga diferida para imágenes
                img.onerror = function() {
                    console.error(`Error al cargar imagen: ${this.src}`);
                    this.style.display = 'none';
                    const errorText = document.createElement('p');
                    errorText.textContent = `Error img`;
                    errorText.style.fontSize = '0.8em';
                    errorText.style.color = 'var(--error-red)';
                    frontFace.appendChild(errorText);
                };
                 frontFace.appendChild(img);

            } else if (cardInfo.type === 'text' && cardInfo.value) {
                 const textP = document.createElement('p');
                 textP.textContent = cardInfo.value;
                 frontFace.appendChild(textP);

            } else {
                 console.warn(`Contenido inválido para carta memorama ${index}:`, cardInfo);
                 const fallbackText = document.createElement('p');
                 fallbackText.textContent = '???';
                 fallbackText.style.opacity = '0.5';
                 frontFace.appendChild(fallbackText);
            }

            cardElement.appendChild(frontFace);
            cardElement.appendChild(backFace);

            cardElement.addEventListener('click', handleCardClick);
            memoramaGrid.appendChild(cardElement);
        });

        let columns = 4;
        const numCards = memoramaCards.length;
        if (numCards <= 6) columns = 3;
        else if (numCards <= 9) columns = 3;
        else if (numCards <= 12) columns = 4;
        else if (numCards <= 16) columns = 4;
        else columns = 5;
        memoramaGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    }

    function startMemorama(numPairs) {
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
        memoramaGameArea.style.display = 'block';
        memoramaWinMessage.style.display = 'none';
        memoramaDataErrorEl.style.display = 'none'; // Ocultar msj de error al iniciar
        initMemorama();
    }

    function handleCardClick(event) {
        //currentTarget es la carta a la que se asignó el listener
        const clickedCard = event.currentTarget;
        // Evitar clicks si ya está volteada, emparejada, o tablero bloqueado
        if (lockBoard || clickedCard.classList.contains('flipped') || clickedCard.classList.contains('matched')) {
            return;
        }
        flipCard(clickedCard);
        flippedCards.push(clickedCard);
        if (flippedCards.length === 2) {
            lockBoard = true;
            memoramaAttempts++;
            memoramaAttemptsEl.textContent = memoramaAttempts;
            checkForMatch();
        }
    }
    function flipCard(card) { card.classList.add('flipped'); }
    function unflipCards() {
        setTimeout(() => {
            flippedCards.forEach(card => card.classList.remove('flipped'));
            flippedCards = [];
            lockBoard = false;
        }, 1100); // Tiempo para ver las cartas
    }
    function disableCards() {
        flippedCards.forEach(card => card.classList.add('matched'));
        flippedCards = [];
        lockBoard = false;
    }
    function checkForMatch() {
        const [card1, card2] = flippedCards;
        const isMatch = card1.dataset.id && card1.dataset.id === card2.dataset.id;
        if (isMatch) {
            matchedPairs++;
            // No llamar a disableCards aquí, dejar que el CSS maneje el estado matched
             setTimeout(() => { // Pequeño delay para que se vea el match
                card1.classList.add('matched');
                card2.classList.add('matched');
                flippedCards = []; // Limpiar después de marcar como matched
                 lockBoard = false;
                if (matchedPairs === totalPairs) {
                    memoramaWinMessage.textContent = `¡Felicidades! Encontraste ${totalPairs} pares en ${memoramaAttempts} intentos.`;
                    memoramaWinMessage.style.display = 'block';
                }
            }, 300); // Delay corto para efecto visual
        } else {
            unflipCards(); // Voltea las cartas incorrectas
        }
    }
    function resetMemoramaView() {
        memoramaSetup.style.display = 'block';
        memoramaGameArea.style.display = 'none';
        memoramaWinMessage.style.display = 'none';
        memoramaDataErrorEl.style.display = 'none';
        difficultyButtons.forEach(btn => btn.classList.remove('selected'));
        memoramaGrid.innerHTML = ''; // Limpiar el grid
    }
    function setupMemoramaControls() {
        difficultyButtons.forEach(button => {
            button.addEventListener('click', () => {
                const pairs = parseInt(button.getAttribute('data-pairs'));
                difficultyButtons.forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');
                startMemorama(pairs);
            });
        });
        resetMemoramaBtn.addEventListener('click', () => {
             const selectedBtn = document.querySelector('.difficulty-btn.selected');
             if (selectedBtn) {
                 const pairs = parseInt(selectedBtn.getAttribute('data-pairs'));
                 startMemorama(pairs);
             } else {
                 resetMemoramaView();
             }
        });
    }

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
         let addedValues = new Set(); // Para evitar opciones duplicadas (normalizadas)

         for (const item of shuffledWrongs) {
             if (options.length >= count) break;
             const potentialOption = item[field];
             const potentialOptionNorm = normalizeAnswer(potentialOption);
             if (!addedValues.has(potentialOptionNorm)) {
                 options.push(potentialOption);
                 addedValues.add(potentialOptionNorm);
             }
         }

         // Rellenar si aún faltan (menos probable ahora)
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
                     // Pedir 3 opciones incorrectas
                     wrongOptions = getWrongOptions(correctLexiconItem, 3, lexiconData, field);
                     const allOptions = [q.answer, ...wrongOptions];
                     // Usar Set para eliminar duplicados exactos (después de normalizar para la comparación inicial)
                     const uniqueOptions = Array.from(new Set(allOptions));
                     // Asegurar MÁXIMO 4 opciones
                     q.options = shuffleArray(uniqueOptions.slice(0, 4));
                 } else {
                     q.options = [q.answer]; // Fallback
                     console.warn("No se pudieron generar opciones para la pregunta MC:", q);
                 }
                 // Validar si hay al menos 2 opciones después de todo
                 if (q.options.length < 2) {
                     console.warn("Pregunta MC generada con menos de 2 opciones únicas:", q);
                     // Marcar como inválida o manejar de alguna forma? Por ahora se mostrará.
                 }
            }
        });

        const validFinalQuestions = finalQuestions.filter(q => !q.options || q.options.length >= 1); // Permitir preguntas sin opciones (TXT) o con al menos 1 opción (MC)
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
             missedQuestions = []; // Limpiar falladas al iniciar quiz nuevo
         } else {
             // Usar copia de falladas para no modificarla directamente
             currentQuizSet = shuffleArray([...missedQuestions]); // Reordenar las falladas
             missedQuestions = []; // Limpiar para la nueva ronda de reintento
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
             // Mostrar el error de datos si existe
             quizDataErrorEl.style.display = quizDataErrorEl.textContent ? 'block' : 'none';
             if (!quizDataErrorEl.textContent) { // Mensaje genérico si no hay error específico
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

        // Verificar si la pregunta es válida
        if (!q || !q.type || !q.question || !q.answer) {
            console.error("Pregunta inválida encontrada:", q);
            // Saltar a la siguiente pregunta
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
                this.src='images/placeholder.png'; // Mostrar placeholder si falla
            };
            quizImageContainer.appendChild(img);
        }

        if (q.type.startsWith('MC_')) {
            quizOptionsEl.style.display = 'block';
            // Verificar si hay opciones
            if (!q.options || q.options.length === 0) {
                 console.error("Pregunta MC sin opciones:", q);
                 // Mostrar mensaje de error o saltar? Por ahora, mostrar error.
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
            // Pequeño delay para asegurar que el elemento es visible antes del focus
            setTimeout(() => quizTextAnswerInput.focus(), 100);
        }
    }

    function handleMCAnswer(event) {
        if (!quizActive) return;
        quizActive = false;
        const selectedButton = event.target;
        const selectedAnswer = selectedButton.textContent;
        const currentQuestion = currentQuizSet[currentQuestionIndex];
        // Verificar que currentQuestion y su answer existan
        if (!currentQuestion || typeof currentQuestion.answer === 'undefined') {
            console.error("Error interno: Pregunta o respuesta no definida en handleMCAnswer.");
            goToNextQuestion(); // Intentar ir a la siguiente
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
            // Guardar copia profunda solo si la pregunta era válida
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
         // Verificar que currentQuestion y su answer existan
         if (!currentQuestion || typeof currentQuestion.answer === 'undefined') {
            console.error("Error interno: Pregunta o respuesta no definida en handleTextAnswer.");
            goToNextQuestion(); // Intentar ir a la siguiente
            return;
         }
         const userAnswer = normalizeAnswer(quizTextAnswerInput.value);
         const correctAnswer = normalizeAnswer(currentQuestion.answer);
         const originalCorrectAnswer = currentQuestion.answer;

         quizTextAnswerInput.disabled = true;
         submitTextAnswerBtn.disabled = true;

         if (userAnswer === correctAnswer && userAnswer !== '') { // Evitar que respuesta vacía sea correcta
             score++;
             quizTextAnswerInput.classList.add('correct');
             quizFeedbackEl.textContent = '¡Correcto!';
             quizFeedbackEl.className = 'correct';
         } else {
             quizTextAnswerInput.classList.add('incorrect');
             quizFeedbackEl.innerHTML = `Incorrecto. La respuesta correcta es: <strong>${originalCorrectAnswer}</strong>`;
             quizFeedbackEl.className = 'incorrect';
              // Guardar copia profunda solo si la pregunta era válida
            if (currentQuestion.item) {
                 missedQuestions.push(JSON.parse(JSON.stringify(currentQuestion)));
            }
         }
         nextQuestionBtn.style.display = 'inline-block';
     }

    function goToNextQuestion() {
        currentQuestionIndex++;
        // Pequeño delay antes de mostrar la siguiente para que se vea el feedback
        setTimeout(displayQuestion, 50); // Ajustar delay si es necesario
    }

    function showResults() {
        quizQuestionArea.style.display = 'none';
        quizResultsEl.style.display = 'block';
        quizScoreEl.textContent = score;
        quizTotalEl.textContent = currentQuizSet.length;
        quizActive = false;

         const wasMainQuizRound = (currentQuizSet === allQuizQuestions);
         const uniqueMissedQuestions = [];
         const addedIds = new Set(); // Usar ID del item para unicidad

         missedQuestions.forEach(q => {
             // Asegurarse que q y q.item existan antes de acceder a id
             const key = q && q.item ? q.item.id : null;
             if (key !== null && !addedIds.has(key)) {
                 uniqueMissedQuestions.push(q);
                 addedIds.add(key);
             }
         });

         // Actualizar missedQuestions solo con las únicas para el botón de reintento
         missedQuestions = uniqueMissedQuestions;

         if (missedQuestions.length > 0 && wasMainQuizRound) {
              retryMissedQuizBtn.style.display = 'inline-block';
         } else {
              retryMissedQuizBtn.style.display = 'none';
              // Limpiar si no hay fallos únicos o si ya era ronda de reintento
              if (missedQuestions.length === 0) missedQuestions = [];
         }
    }

    function resetQuizView() {
        quizActive = false;
        // No limpiar missedQuestions aquí, se limpia al iniciar nuevo quiz normal
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
         startQuizBtn.addEventListener('click', () => startQuiz(false)); // false = no es reintento
         nextQuestionBtn.addEventListener('click', goToNextQuestion);
         restartQuizBtn.addEventListener('click', resetQuizView);
         retryMissedQuizBtn.addEventListener('click', () => startQuiz(true)); // true = es reintento
         submitTextAnswerBtn.addEventListener('click', handleTextAnswer);
         quizTextAnswerInput.addEventListener('keypress', function (e) {
             if (e.key === 'Enter' && !submitTextAnswerBtn.disabled) {
                 handleTextAnswer();
             }
         });
     }

    // --- Inicialización App ---
    function initializeApplication() {
        // Verificar que los elementos principales existen antes de continuar
        if (!mainContentEl || !lexiconGrid || !phrasesList || !memoramaGrid || !quizContainer) {
            console.error("Faltan elementos esenciales del DOM. Verifica tu HTML.");
            errorMessageEl.textContent = "Error: Faltan elementos HTML esenciales.";
            errorMessageEl.style.display = 'block';
            return;
        }

        setupNavigation();
        displayLexiconItems(lexiconData); // Mostrar léxico inicial
        populatePhrases(); // Mostrar frases iniciales
        setupSearch(); // Configurar búsqueda
        setupMemoramaControls(); // Configurar botones de Memorama
        setupQuizControls(); // Configurar botones de Quiz
        console.log("Aplicación inicializada.");
    }

    // --- Punto de Entrada ---
    loadData();

}); // Fin DOMContentLoaded
