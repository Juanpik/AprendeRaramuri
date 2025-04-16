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
    const memoramaDataErrorEl = document.getElementById('memorama-data-error'); // Para errores específicos

    // Quiz Elements
    const quizContainer = document.getElementById('quiz-container');
    const quizSetup = document.getElementById('quiz-setup');
    const quizLengthSelect = document.getElementById('quiz-length');
    const startQuizBtn = document.getElementById('start-quiz');
    const quizQuestionArea = document.getElementById('quiz-question-area');
    const quizImageContainer = document.getElementById('quiz-image-container');
    const quizQuestionEl = document.getElementById('quiz-question');
    const quizPhraseBlankEl = document.getElementById('quiz-phrase-blank');
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
    const quizDataErrorEl = document.getElementById('quiz-data-error'); // Para errores específicos


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
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`Error al cargar data.json: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            lexiconData = data.lexicon || []; // Asignar datos o array vacío si falta
            phrasesData = data.phrases || [];

            console.log("Datos cargados:", { lexicon: lexiconData.length, phrases: phrasesData.length });

            // Ocultar mensaje de carga y mostrar contenido principal
            loadingMessageEl.style.display = 'none';
            mainContentEl.style.display = 'block';
            errorMessageEl.style.display = 'none'; // Ocultar errores previos

            // *** LLAMAR A FUNCIONES QUE DEPENDEN DE LOS DATOS ***
            initializeApplication();

        } catch (error) {
            console.error("Error al cargar o procesar los datos:", error);
            loadingMessageEl.style.display = 'none';
            errorMessageEl.textContent = `Error al cargar los datos de la aplicación: ${error.message}. Por favor, verifica que el archivo 'data.json' existe y tiene el formato correcto.`;
            errorMessageEl.style.display = 'block';
            mainContentEl.style.display = 'none'; // Ocultar contenido si hay error fatal
        }
    }

    // --- FUNCIONES DE LA APLICACIÓN (Definidas antes de llamarlas) ---

    // -- Utilidades --
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    function normalizeAnswer(text) {
        if (!text) return '';
        return text.toLowerCase().trim();
                   // .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Opcional quitar acentos
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
                }
                button.classList.add('active');

                // Resetear vistas de juegos al cambiar
                if (sectionId === 'memorama') resetMemoramaView();
                else if (sectionId === 'quiz') resetQuizView();
            });
        });
         // Activar la primera sección ('about') por defecto
        const aboutButton = document.querySelector('nav button[data-section="about"]');
        const aboutSection = document.getElementById('about');
        if (aboutButton && aboutSection) {
            aboutButton.classList.add('active');
            aboutSection.classList.add('active');
        } else {
            // Fallback si 'about' no existe: activar la primera sección disponible
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
             lexiconGrid.innerHTML = '<p style="text-align: center; color: #666;">No se encontraron coincidencias.</p>';
             return;
        }
        itemsToShow.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('lexicon-item');
            // Añadido manejo de error más informativo en la imagen
            const imgSrc = item.image || 'images/placeholder.png'; // Usar placeholder si no hay imagen definida
            div.innerHTML = `
                <img src="${imgSrc}" alt="${item.spanish || 'Imagen'}" onerror="this.onerror=null; this.src='images/placeholder.png'; this.alt='Error al cargar ${item.raramuri || ''}'; this.parentElement.insertAdjacentHTML('beforeend', '<p style=\'font-size:0.8em; color:red;\'>Img error</p>');">
                <p class="raramuri-word">${item.raramuri || '???'}</p>
                <p class="spanish-word">${item.spanish || '???'}</p>
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
        lexiconSearchInput.addEventListener('input', handleSearch);
    }

    // -- Frases --
    function populatePhrases() {
        phrasesList.innerHTML = '';
        if (!phrasesData || phrasesData.length === 0) {
             phrasesList.innerHTML = '<li>No hay frases disponibles.</li>';
             return;
        }
        phrasesData.forEach(phrase => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="raramuri-phrase">${phrase.raramuri || '???'}</span>
                <span class="spanish-phrase">${phrase.spanish || '???'}</span>
            `;
            phrasesList.appendChild(li);
        });
    }

    // -- Memorama --
    function createMemoramaCards() {
        const itemsWithImages = lexiconData.filter(item => item.image && item.raramuri && item.id); // Asegurar datos necesarios
        const shuffledLexicon = shuffleArray([...itemsWithImages]);
        const itemsForGame = shuffledLexicon.slice(0, totalPairs);

        if (itemsForGame.length < totalPairs) {
             console.warn(`Memorama: No hay suficientes items con imagen (${itemsForGame.length}) para ${totalPairs} pares.`);
             memoramaDataErrorEl.textContent = `No hay suficientes datos léxicos con imágenes (${itemsForGame.length}) para esta dificultad (${totalPairs} pares). Añade más entradas completas.`;
             memoramaDataErrorEl.style.display = 'block';
             totalPairs = itemsForGame.length; // Reducir los pares si no hay suficientes
             if (totalPairs < 1) return []; // No se puede jugar
             else {
                 memoramaDataErrorEl.textContent += ` Jugando con ${totalPairs} pares.`;
             }
        } else {
             memoramaDataErrorEl.style.display = 'none'; // Ocultar error si hay suficientes
        }


        const cardData = [];
        itemsForGame.forEach(item => {
            cardData.push({ type: 'image', value: item.image, id: item.id, altText: item.spanish });
            cardData.push({ type: 'text', value: item.raramuri, id: item.id });
        });
        return shuffleArray(cardData);
    }
    function initMemorama() {
        memoramaGrid.innerHTML = ''; // Limpiar grid anterior
        memoramaWinMessage.style.display = 'none'; // Ocultar mensaje de victoria
        flippedCards = [];
        matchedPairs = 0;
        memoramaAttempts = 0;
        memoramaAttemptsEl.textContent = memoramaAttempts;
        lockBoard = false;

        memoramaCards = createMemoramaCards();

        if (memoramaCards.length === 0) {
            memoramaGrid.innerHTML = '<p>No se pueden generar cartas. Verifica los datos léxicos.</p>';
             memoramaGameArea.style.display = 'none'; // Ocultar área de juego si no se pueden generar
             memoramaDataErrorEl.style.display = 'block'; // Mostrar mensaje de error
            return;
        }
        memoramaGameArea.style.display = 'block'; // Asegurar que el área es visible


        memoramaCards.forEach((cardInfo, index) => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('memorama-card');
            cardElement.dataset.id = cardInfo.id;
            cardElement.dataset.index = index;

            const frontFace = document.createElement('div');
            frontFace.classList.add('card-face', 'card-front');
             // Asegurar que 'value' existe antes de usarlo
             if (cardInfo.type === 'image' && cardInfo.value) {
                 const img = document.createElement('img');
                 img.src = cardInfo.value;
                 img.alt = cardInfo.altText || "Imagen";
                 img.onerror = function() { this.style.display = 'none'; this.parentElement.textContent = 'Error img'; };
                 frontFace.appendChild(img);
             } else if (cardInfo.type === 'text' && cardInfo.value) {
                 // Añadir texto solo si existe
                 const textP = document.createElement('p');
                 textP.textContent = cardInfo.value;
                 frontFace.appendChild(textP);
             } else {
                 frontFace.textContent = '???'; // Contenido por defecto si falta 'value'
             }

            const backFace = document.createElement('div');
            backFace.classList.add('card-face', 'card-back');

            cardElement.appendChild(frontFace);
            cardElement.appendChild(backFace);

            cardElement.addEventListener('click', handleCardClick);
            memoramaGrid.appendChild(cardElement);
        });

        let columns = 4;
        const numCards = memoramaCards.length;
        if (numCards <= 8) columns = 4;
        else if (numCards <= 12) columns = 4;
        else if (numCards <= 16) columns = 4;
        else columns = 5;
        memoramaGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    }
    function startMemorama(numPairs) {
        totalPairs = numPairs;
        memoramaSetup.style.display = 'none';
        memoramaGameArea.style.display = 'block';
        memoramaWinMessage.style.display = 'none';
        memoramaDataErrorEl.style.display = 'none'; // Ocultar errores al iniciar
        initMemorama(); // Ahora llama a initMemorama que hace la validación
    }
    function handleCardClick(event) {
        if (lockBoard || event.currentTarget.classList.contains('flipped') || event.currentTarget.classList.contains('matched')) {
            return;
        }
        const clickedCard = event.currentTarget;
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
        }, 1100);
    }
    function disableCards() {
        flippedCards.forEach(card => card.classList.add('matched'));
        flippedCards = [];
        lockBoard = false;
    }
    function checkForMatch() {
        const [card1, card2] = flippedCards;
        const isMatch = card1.dataset.id === card2.dataset.id;
        if (isMatch) {
            matchedPairs++;
            disableCards();
            if (matchedPairs === totalPairs) {
                memoramaWinMessage.textContent = `¡Felicidades! Encontraste ${totalPairs} pares en ${memoramaAttempts} intentos.`;
                memoramaWinMessage.style.display = 'block';
            }
        } else {
            unflipCards();
        }
    }
    function resetMemoramaView() {
        memoramaSetup.style.display = 'block';
        memoramaGameArea.style.display = 'none';
        memoramaWinMessage.style.display = 'none';
        memoramaDataErrorEl.style.display = 'none';
        difficultyButtons.forEach(btn => btn.classList.remove('selected'));
        memoramaGrid.innerHTML = '';
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
        resetMemoramaBtn.addEventListener('click', initMemorama); // Reinicia con la misma dificultad
    }

    // -- Quiz --
    function getWrongOptions(correctItem, count, sourceData, field) {
         // Asegurarse que correctItem y field son válidos
        if (!correctItem || !field) return [];

         const wrongAnswerPool = sourceData.filter(item =>
             item && // Verificar que el item existe
             item.id !== correctItem.id && // No es el mismo item
             item[field] && // Tiene el campo requerido
             normalizeAnswer(item[field]) !== normalizeAnswer(correctItem[field]) // Y el valor es diferente (normalizado)
         );
         const shuffledWrongs = shuffleArray([...wrongAnswerPool]);
         let options = shuffledWrongs.slice(0, count).map(item => item[field]);

         // Rellenar si faltan opciones (más robusto)
         let attempts = 0; // Evitar bucles infinitos
         const maxAttempts = sourceData.length * 2; // Límite razonable
         while (options.length < count && attempts < maxAttempts) {
             const randomItem = sourceData[Math.floor(Math.random() * sourceData.length)];
             if (randomItem && randomItem.id !== correctItem.id && randomItem[field]) {
                  const potentialOption = randomItem[field];
                  // Verificar que la opción potencial no sea la correcta y no esté ya en la lista
                  if (normalizeAnswer(potentialOption) !== normalizeAnswer(correctItem[field]) && !options.some(opt => normalizeAnswer(opt) === normalizeAnswer(potentialOption))) {
                     options.push(potentialOption);
                  }
             }
             attempts++;
         }
         return options;
     }
    function generateQuizQuestions(numQuestions) {
         const availableLexiconItems = lexiconData.filter(item => item && item.raramuri && item.spanish && item.id);
         const availableImageItems = availableLexiconItems.filter(item => item.image);
         // Modificado para validar mejor las frases y encontrar la palabra léxica
         const availablePhraseItems = phrasesData
            .map(phrase => {
                if (!phrase || !phrase.raramuri || !phrase.blank) return null; // Validar frase
                const lexiconMatch = lexiconData.find(lex => lex && lex.raramuri === phrase.blank); // Encontrar palabra en léxico
                if (!lexiconMatch) return null; // Si la palabra del hueco no está en el léxico, descartar
                return { ...phrase, lexiconId: lexiconMatch.id }; // Añadir ID léxico a la frase
            })
            .filter(Boolean); // Filtrar los nulls

        if (availableLexiconItems.length < 2 && availablePhraseItems.length === 0) {
             console.error("Quiz: No hay suficientes datos léxicos o de frases válidos para generar preguntas.");
             quizDataErrorEl.textContent = "No hay suficientes datos léxicos o de frases para generar el quiz.";
             quizDataErrorEl.style.display = 'block';
             return []; // Devolver array vacío si no hay datos suficientes
        } else {
            quizDataErrorEl.style.display = 'none'; // Ocultar error si hay datos
        }


        const potentialQuestions = [];

        // Tipos de preguntas léxicas
        availableLexiconItems.forEach(item => {
            potentialQuestions.push({ type: 'MC_RaSp', item: item, question: `¿Qué significa "${item.raramuri}"?`, answer: item.spanish });
            potentialQuestions.push({ type: 'MC_SpRa', item: item, question: `¿Cómo se dice "${item.spanish}" en rarámuri?`, answer: item.raramuri });
            potentialQuestions.push({ type: 'TXT_SpRa', item: item, question: `Escribe cómo se dice "${item.spanish}" en rarámuri:`, answer: item.raramuri });
        });
        availableImageItems.forEach(item => {
             potentialQuestions.push({ type: 'MC_ImgRa', item: item, question: `¿Qué es esto en rarámuri?`, answer: item.raramuri, image: item.image });
             potentialQuestions.push({ type: 'TXT_ImgRa', item: item, question: `Escribe en rarámuri qué ves en la imagen:`, answer: item.raramuri, image: item.image });
         });
        // Tipos de preguntas de frases
         availablePhraseItems.forEach(phrase => {
             const blankWord = phrase.blank;
             const fullSentence = phrase.raramuri;
             const sentenceWithBlank = fullSentence.replace(new RegExp(`\\b${blankWord}\\b`), '<strong>_____</strong>'); // Usar regex para palabra completa
             potentialQuestions.push({
                 type: 'FB_Phrase',
                 item: phrase, // Guardamos la frase original con su lexiconId
                 question: `Completa la frase:`,
                 context: sentenceWithBlank,
                 answer: blankWord
             });
         });

        const shuffledPotentialQuestions = shuffleArray(potentialQuestions);

        let questionsToGenerate = 0;
        const totalPotential = shuffledPotentialQuestions.length;
        if (numQuestions === 'all') {
            questionsToGenerate = totalPotential;
        } else {
            questionsToGenerate = Math.min(parseInt(numQuestions), totalPotential);
        }
        // Asegurarse de generar al menos una si es posible
        questionsToGenerate = Math.max(1, questionsToGenerate);
        if (totalPotential === 0) return []; // Si no hay ninguna potencial, retornar vacío

        const finalQuestions = shuffledPotentialQuestions.slice(0, questionsToGenerate);

        // Añadir opciones
        finalQuestions.forEach(q => {
            if (q.type.startsWith('MC_') || q.type === 'FB_Phrase') {
                let wrongOptions = [];
                let field = '';
                let correctLexiconItem;

                if (q.type === 'MC_RaSp') { field = 'spanish'; correctLexiconItem = q.item; }
                else if (q.type === 'MC_SpRa' || q.type === 'MC_ImgRa') { field = 'raramuri'; correctLexiconItem = q.item; }
                else if (q.type === 'FB_Phrase') {
                     field = 'raramuri';
                     // Usamos el lexiconId guardado para encontrar el item correcto para las opciones
                     correctLexiconItem = lexiconData.find(lex => lex && lex.id === q.item.lexiconId);
                     if (!correctLexiconItem) { // Fallback si no se encontró por ID (raro)
                        correctLexiconItem = { id: -1, raramuri: q.answer }; // Crear temporal
                        console.warn("FB_Phrase: No se encontró item léxico por ID para", q.answer);
                     }
                 }

                if (field && correctLexiconItem) {
                     wrongOptions = getWrongOptions(correctLexiconItem, 3, lexiconData, field);
                     const allOptions = [q.answer, ...wrongOptions];
                      // Asegurar que no haya duplicados (normalizados) antes de mezclar
                     const uniqueOptions = Array.from(new Map(allOptions.map(opt => [normalizeAnswer(opt), opt])).values());
                     q.options = shuffleArray(uniqueOptions);
                 } else {
                     q.options = [q.answer];
                     console.warn("No se pudieron generar opciones para la pregunta:", q);
                 }
                 // Asegurar al menos 2 opciones si es posible, si no, la pregunta es inválida? O mostrar solo la correcta?
                 if (q.options.length < 2) {
                     console.warn("Pregunta con menos de 2 opciones:", q);
                     // Podríamos eliminar esta pregunta del set final o dejarla con una opción
                 }
            }
        });

        // Filtrar preguntas que terminaron sin suficientes opciones (si decidimos eliminarlas)
        const validFinalQuestions = finalQuestions.filter(q => !q.options || q.options.length >= 2);

        console.log("Generated Valid Quiz Questions:", validFinalQuestions);
        return validFinalQuestions; // Devolver solo las válidas
     }
    function startQuiz(isRetry = false) {
         quizActive = true;
         missedQuestions = isRetry ? [] : missedQuestions;
         score = 0;
         currentQuestionIndex = 0;

         if (!isRetry) {
             const selectedLength = quizLengthSelect.value;
             allQuizQuestions = generateQuizQuestions(selectedLength);
             currentQuizSet = allQuizQuestions;
         } else {
             currentQuizSet = [...missedQuestions];
             missedQuestions = []; // Limpiar para la nueva ronda de reintento
             if (currentQuizSet.length === 0) {
                 alert("¡No hubo preguntas falladas para reintentar!");
                 resetQuizView();
                 return;
             }
             console.log("Retrying missed questions:", currentQuizSet);
         }

         // Volver a verificar si currentQuizSet está vacío (podría pasar si generateQuizQuestions falló)
         if (!currentQuizSet || currentQuizSet.length === 0) {
             quizQuestionArea.style.display = 'none';
             quizSetup.style.display = 'block';
             quizResultsEl.style.display = 'none';
             retryMissedQuizBtn.style.display = 'none';
             quizDataErrorEl.textContent = "No se pudieron generar preguntas válidas.";
             quizDataErrorEl.style.display = 'block';
             quizActive = false;
             return;
         }

         quizSetup.style.display = 'none';
         quizResultsEl.style.display = 'none';
         retryMissedQuizBtn.style.display = 'none';
         quizQuestionArea.style.display = 'block';
         nextQuestionBtn.style.display = 'none';
         quizDataErrorEl.style.display = 'none'; // Ocultar error si se inicia bien

         displayQuestion();
     }
    function displayQuestion() {
        if (currentQuestionIndex >= currentQuizSet.length) {
            showResults();
            return;
        }
        quizActive = true;
        const q = currentQuizSet[currentQuestionIndex];

        // Reset UI
        quizQuestionEl.textContent = q.question || '';
        quizImageContainer.innerHTML = '';
        quizOptionsEl.innerHTML = '';
        quizOptionsEl.style.display = 'none';
        quizTextInputArea.style.display = 'none';
        quizPhraseBlankEl.style.display = 'none';
        quizTextAnswerInput.value = '';
        quizTextAnswerInput.className = '';
        quizFeedbackEl.textContent = '';
        quizFeedbackEl.className = '';
        nextQuestionBtn.style.display = 'none';

        // Setup based on type
        if (q.image) {
            const img = document.createElement('img');
            img.src = q.image;
            img.alt = `Imagen para la pregunta`;
            img.onerror = function() { this.alt = 'Error al cargar imagen'; this.src='images/placeholder.png';};
            quizImageContainer.appendChild(img);
        }

        if (q.type.startsWith('MC_') || q.type === 'FB_Phrase') {
            quizOptionsEl.style.display = 'block';
            (q.options || []).forEach(option => { // Usar array vacío si options no existe
                const button = document.createElement('button');
                button.textContent = option;
                button.disabled = false;
                button.addEventListener('click', handleMCAnswer);
                quizOptionsEl.appendChild(button);
            });
            if (q.type === 'FB_Phrase' && q.context) {
                 quizPhraseBlankEl.innerHTML = q.context;
                 quizPhraseBlankEl.style.display = 'block';
            }
        } else if (q.type.startsWith('TXT_')) {
            quizTextInputArea.style.display = 'flex';
            quizTextAnswerInput.disabled = false;
            submitTextAnswerBtn.disabled = false;
            quizTextAnswerInput.focus();
        }
    }
    function handleMCAnswer(event) {
        if (!quizActive) return;
        quizActive = false;
        const selectedButton = event.target;
        const selectedAnswer = selectedButton.textContent;
        const currentQuestion = currentQuizSet[currentQuestionIndex];
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
             // Guardar copia profunda para evitar problemas si se modifica el objeto original
            missedQuestions.push(JSON.parse(JSON.stringify(currentQuestion)));
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
         const userAnswer = normalizeAnswer(quizTextAnswerInput.value);
         const correctAnswer = normalizeAnswer(currentQuestion.answer);
         const originalCorrectAnswer = currentQuestion.answer;

         quizTextAnswerInput.disabled = true;
         submitTextAnswerBtn.disabled = true;

         if (userAnswer === correctAnswer) {
             score++;
             quizTextAnswerInput.classList.add('correct');
             quizFeedbackEl.textContent = '¡Correcto!';
             quizFeedbackEl.className = 'correct';
         } else {
             quizTextAnswerInput.classList.add('incorrect');
             quizFeedbackEl.innerHTML = `Incorrecto. La respuesta correcta es: <strong>${originalCorrectAnswer}</strong>`;
             quizFeedbackEl.className = 'incorrect';
             missedQuestions.push(JSON.parse(JSON.stringify(currentQuestion)));
         }
         nextQuestionBtn.style.display = 'inline-block';
     }
    function goToNextQuestion() {
        currentQuestionIndex++;
        displayQuestion();
    }
    function showResults() {
        quizQuestionArea.style.display = 'none';
        quizResultsEl.style.display = 'block';
        quizScoreEl.textContent = score;
        quizTotalEl.textContent = currentQuizSet.length;
        quizActive = false;

         const wasMainQuizRound = (currentQuizSet === allQuizQuestions);
         // Usar Set para asegurar que las preguntas falladas sean únicas por ID antes de contar
         const uniqueMissedIds = new Set(missedQuestions.map(q => q.item.id || q.item.raramuri)); // Usar ID o palabra como clave

         if (uniqueMissedIds.size > 0 && wasMainQuizRound) {
             // Crear el set de reintento a partir de las preguntas únicas falladas
             // Necesitamos reconstruir las preguntas a partir de missedQuestions filtrando por los IDs únicos
             const uniqueMissedQuestions = [];
             const addedIds = new Set();
             missedQuestions.forEach(q => {
                 const key = q.item.id || q.item.raramuri;
                 if (!addedIds.has(key)) {
                     uniqueMissedQuestions.push(q);
                     addedIds.add(key);
                 }
             });
              missedQuestions = uniqueMissedQuestions; // Actualizar la lista global para el reintento
              retryMissedQuizBtn.style.display = 'inline-block';
         } else {
             retryMissedQuizBtn.style.display = 'none';
              // Si no hay fallos o ya estamos en reintento, limpiar missedQuestions para la próxima ronda normal
              if (uniqueMissedIds.size === 0) missedQuestions = [];
         }
    }
    function resetQuizView() {
        quizActive = false;
        missedQuestions = [];
        allQuizQuestions = [];
        currentQuizSet = [];
        quizSetup.style.display = 'block';
        quizQuestionArea.style.display = 'none';
        quizResultsEl.style.display = 'none';
        retryMissedQuizBtn.style.display = 'none';
        quizDataErrorEl.style.display = 'none'; // Ocultar error
        quizImageContainer.innerHTML = '';
        quizFeedbackEl.textContent = '';
        quizFeedbackEl.className = '';
        quizOptionsEl.innerHTML = '';
        quizTextAnswerInput.value = '';
        quizTextAnswerInput.className = '';
        quizPhraseBlankEl.style.display = 'none';
        quizQuestionEl.textContent = '';
        quizLengthSelect.value = "5";
    }
    function setupQuizControls() {
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


    // --- INICIALIZACIÓN DE LA APLICACIÓN (después de cargar datos) ---
    function initializeApplication() {
        // 1. Configurar Navegación
        setupNavigation();

        // 2. Poblar secciones iniciales que usan datos
        displayLexiconItems(lexiconData);
        populatePhrases();

        // 3. Configurar búsqueda
        setupSearch();

        // 4. Configurar controles de juegos
        setupMemoramaControls();
        setupQuizControls();

        // (Otras inicializaciones si las hubiera)
        console.log("Aplicación inicializada.");
    }

    // --- PUNTO DE ENTRADA: Cargar datos al iniciar ---
    loadData();

}); // Fin DOMContentLoaded