document.addEventListener('DOMContentLoaded', () => {

    let lexiconData = [];
    let phrasesData = [];

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
    // SE ELIMINÓ quizPhraseBlankEl
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

    // Memorama Globals
    let memoramaCards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let totalPairs = 0;
    let memoramaAttempts = 0;
    let lockBoard = false;
    // Quiz Globals
    let allQuizQuestions = [];
    let currentQuizSet = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let quizActive = false;
    let missedQuestions = [];

    async function loadData() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`Error al cargar data.json: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            lexiconData = data.lexicon || [];
            phrasesData = data.phrases || [];

            console.log("Datos cargados:", { lexicon: lexiconData.length, phrases: phrasesData.length });

            loadingMessageEl.style.display = 'none';
            mainContentEl.style.display = 'block';
            errorMessageEl.style.display = 'none';

            initializeApplication();

        } catch (error) {
            console.error("Error al cargar o procesar los datos:", error);
            loadingMessageEl.style.display = 'none';
            errorMessageEl.textContent = `Error al cargar los datos de la aplicación: ${error.message}. Por favor, verifica que el archivo 'data.json' existe y tiene el formato correcto.`;
            errorMessageEl.style.display = 'block';
            mainContentEl.style.display = 'none';
        }
    }

    // --- Utilidades ---
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
    }

    // --- Navegación ---
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

    // --- Léxico ---
    function displayLexiconItems(itemsToShow) {
        lexiconGrid.innerHTML = '';
        if (!itemsToShow || itemsToShow.length === 0) {
             lexiconGrid.innerHTML = '<p style="text-align: center; color: #666;">No se encontraron coincidencias.</p>';
             return;
        }
        itemsToShow.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('lexicon-item');
            const imgSrc = item.image || 'images/placeholder.png';
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

    // --- Frases ---
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

    // --- Memorama ---
    function createMemoramaCards() {
        const itemsWithImages = lexiconData.filter(item => item.image && item.raramuri && item.id);
        const shuffledLexicon = shuffleArray([...itemsWithImages]);
        const itemsForGame = shuffledLexicon.slice(0, totalPairs);
        if (itemsForGame.length < totalPairs) {
             console.warn(`Memorama: No hay suficientes items con imagen (${itemsForGame.length}) para ${totalPairs} pares.`);
             memoramaDataErrorEl.textContent = `No hay suficientes datos léxicos con imágenes (${itemsForGame.length}) para esta dificultad (${totalPairs} pares). Añade más entradas completas.`;
             memoramaDataErrorEl.style.display = 'block';
             totalPairs = itemsForGame.length;
             if (totalPairs < 1) return [];
             else { memoramaDataErrorEl.textContent += ` Jugando con ${totalPairs} pares.`; }
        } else {
             memoramaDataErrorEl.style.display = 'none';
        }
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
        memoramaCards = createMemoramaCards();
        if (memoramaCards.length === 0) {
            memoramaGrid.innerHTML = '<p>No se pueden generar cartas. Verifica los datos léxicos.</p>';
             memoramaGameArea.style.display = 'none';
             memoramaDataErrorEl.style.display = 'block';
            return;
        }
        memoramaGameArea.style.display = 'block';
        memoramaCards.forEach((cardInfo, index) => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('memorama-card');
            cardElement.dataset.id = cardInfo.id;
            cardElement.dataset.index = index;
            const frontFace = document.createElement('div');
            frontFace.classList.add('card-face', 'card-front');
             if (cardInfo.type === 'image' && cardInfo.value) {
                 const img = document.createElement('img');
                 img.src = cardInfo.value;
                 img.alt = cardInfo.altText || "Imagen";
                 img.onerror = function() { this.style.display = 'none'; this.parentElement.textContent = 'Error img'; };
                 frontFace.appendChild(img);
             } else if (cardInfo.type === 'text' && cardInfo.value) {
                 const textP = document.createElement('p');
                 textP.textContent = cardInfo.value;
                 frontFace.appendChild(textP);
             } else {
                 frontFace.textContent = '???';
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
        memoramaDataErrorEl.style.display = 'none';
        initMemorama();
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
        resetMemoramaBtn.addEventListener('click', initMemorama);
    }

    // --- Quiz ---
    function getWrongOptions(correctItem, count, sourceData, field) {
        if (!correctItem || !field) return [];
         const wrongAnswerPool = sourceData.filter(item =>
             item && item.id !== correctItem.id && item[field] &&
             normalizeAnswer(item[field]) !== normalizeAnswer(correctItem[field])
         );
         const shuffledWrongs = shuffleArray([...wrongAnswerPool]);
         let options = shuffledWrongs.slice(0, count).map(item => item[field]);
         let attempts = 0;
         const maxAttempts = sourceData.length * 2;
         while (options.length < count && attempts < maxAttempts) {
             const randomItem = sourceData[Math.floor(Math.random() * sourceData.length)];
             if (randomItem && randomItem.id !== correctItem.id && randomItem[field]) {
                  const potentialOption = randomItem[field];
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
         // SE ELIMINÓ LA VALIDACIÓN/PROCESAMIENTO DE availablePhraseItems

        if (availableLexiconItems.length < 2) { // Necesitamos al menos 2 para generar opciones MC
             console.error("Quiz: No hay suficientes datos léxicos válidos para generar preguntas.");
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
         // SE ELIMINÓ LA GENERACIÓN DE PREGUNTAS FB_Phrase

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
            // Solo necesitamos añadir opciones para los tipos MC
            if (q.type.startsWith('MC_')) {
                let wrongOptions = [];
                let field = '';
                let correctLexiconItem = q.item; // El item léxico es directamente el item de la pregunta

                if (q.type === 'MC_RaSp') field = 'spanish';
                else if (q.type === 'MC_SpRa' || q.type === 'MC_ImgRa') field = 'raramuri';

                if (field && correctLexiconItem) {
                     wrongOptions = getWrongOptions(correctLexiconItem, 3, lexiconData, field);
                     const allOptions = [q.answer, ...wrongOptions];
                     const uniqueOptions = Array.from(new Map(allOptions.map(opt => [normalizeAnswer(opt), opt])).values());
                     q.options = shuffleArray(uniqueOptions);
                 } else {
                     q.options = [q.answer];
                     console.warn("No se pudieron generar opciones para la pregunta MC:", q);
                 }
                 if (q.options.length < 2) {
                     console.warn("Pregunta MC con menos de 2 opciones:", q);
                 }
            }
        });

        const validFinalQuestions = finalQuestions.filter(q => !q.options || q.options.length >= 2);
        console.log("Generated Valid Quiz Questions:", validFinalQuestions);
        return validFinalQuestions;
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

        quizQuestionEl.textContent = q.question || '';
        quizImageContainer.innerHTML = '';
        quizOptionsEl.innerHTML = '';
        quizOptionsEl.style.display = 'none';
        quizTextInputArea.style.display = 'none';
        // SE ELIMINÓ LA LÍNEA PARA quizPhraseBlankEl
        quizTextAnswerInput.value = '';
        quizTextAnswerInput.className = '';
        quizFeedbackEl.textContent = '';
        quizFeedbackEl.className = '';
        nextQuestionBtn.style.display = 'none';

        if (q.image) {
            const img = document.createElement('img');
            img.src = q.image;
            img.alt = `Imagen para la pregunta`;
            img.onerror = function() { this.alt = 'Error al cargar imagen'; this.src='images/placeholder.png';};
            quizImageContainer.appendChild(img);
        }

        if (q.type.startsWith('MC_')) { // Ahora solo verificamos MC
            quizOptionsEl.style.display = 'block';
            (q.options || []).forEach(option => {
                const button = document.createElement('button');
                button.textContent = option;
                button.disabled = false;
                button.addEventListener('click', handleMCAnswer);
                quizOptionsEl.appendChild(button);
            });
            // SE ELIMINÓ EL IF PARA FB_Phrase
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
         const uniqueMissedIds = new Set(missedQuestions.map(q => q.item.id || q.item.raramuri));
         if (uniqueMissedIds.size > 0 && wasMainQuizRound) {
             const uniqueMissedQuestions = [];
             const addedIds = new Set();
             missedQuestions.forEach(q => {
                 const key = q.item.id || q.item.raramuri;
                 if (!addedIds.has(key)) {
                     uniqueMissedQuestions.push(q);
                     addedIds.add(key);
                 }
             });
              missedQuestions = uniqueMissedQuestions;
              retryMissedQuizBtn.style.display = 'inline-block';
         } else {
             retryMissedQuizBtn.style.display = 'none';
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
        quizDataErrorEl.style.display = 'none';
        quizImageContainer.innerHTML = '';
        quizFeedbackEl.textContent = '';
        quizFeedbackEl.className = '';
        quizOptionsEl.innerHTML = '';
        quizTextAnswerInput.value = '';
        quizTextAnswerInput.className = '';
        // SE ELIMINÓ LA LÍNEA PARA quizPhraseBlankEl
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

    // --- Inicialización App ---
    function initializeApplication() {
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
