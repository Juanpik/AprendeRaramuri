document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const sections = document.querySelectorAll('.content-section');
    const navButtons = document.querySelectorAll('nav button');
    const lexiconContainer = document.getElementById('lexicon-entries');
    const searchInput = document.getElementById('lexicon-search');
    const phraseContainer = document.getElementById('phrase-entries'); // <-- NUEVO: Contenedor de frases
    const memoramaBoard = document.getElementById('memorama-board');
    const startMemoramaButton = document.getElementById('start-memorama');
    const memoramaStatus = document.getElementById('memorama-status');
    const quizContainer = document.getElementById('quiz-container');
    const questionElement = document.getElementById('quiz-question');
    const optionsElement = document.getElementById('quiz-options');
    const nextButton = document.getElementById('quiz-next');
    const feedbackElement = document.getElementById('quiz-feedback');
    const scoreElement = document.getElementById('quiz-score');

    // --- Datos Léxicos ---
    const lexiconData = [
        { id: 3, raramuri: 'Sewá', spanish: 'Flor', image: 'images/sewa.png', audio: 'audio/sewa.mp3' },
        { id: 5, raramuri: 'Bawí', spanish: 'Agua', image: 'images/basiachi.png', audio: 'audio/basiachi.mp3' },
        { id: 6, raramuri: 'Muní', spanish: 'Frijol', image: 'images/muni.png', audio: 'audio/muni.mp3' },
        { id: 8, raramuri: 'Remé', spanish: 'Tortilla', image: 'images/reme.png', audio: 'audio/reme.mp3' },
        { id: 9, raramuri: 'Sunú', spanish: 'Maíz', image: 'images/sunu.png', audio: 'audio/sunu.mp3' }
    ];

    // --- NUEVO: Datos de Frases ---
    // Añade tus frases aquí. Usa IDs únicos (pueden ser strings como 'p1').
    const phraseData = [
        { id: 'p2', raramuri: 'Kuira ba.', spanish: 'Hola (respuesta/formal)', audio: 'audio/kuira_ba.mp3' },
        { id: 'p3', raramuri: 'Matétera ba.', spanish: 'Gracias.', audio: 'audio/matetera_ba.mp3' },
        // { id: 'p6', raramuri: '...', spanish: '...', audio: 'audio/...' },
    ];

    // --- Helper: Shuffle Array ---
    function shuffleArray(array) { /* ... (sin cambios) ... */ }

    // --- Helper: Audio Player Logic ---
    function addAudioListener(buttonElement) {
        buttonElement.addEventListener('click', () => {
            const audioSrc = buttonElement.getAttribute('data-audio');
            const parentEntry = buttonElement.closest('.lexicon-entry, .phrase-entry'); // Encuentra el contenedor padre
            const wordOrPhrase = parentEntry?.querySelector('.raramuri-word, .raramuri-phrase')?.textContent || 'elemento'; // Obtiene la palabra/frase

            if (audioSrc && audioSrc !== 'null' && audioSrc !== '') {
                try {
                    const audio = new Audio(audioSrc);
                    audio.play().catch(e => console.error(`Error al reproducir audio para ${wordOrPhrase}:`, e));
                } catch (e) {
                    console.error(`No se pudo crear el objeto Audio para ${wordOrPhrase}:`, e);
                }
            } else {
                console.log(`Audio no disponible para: ${wordOrPhrase}`);
                // Opcional: alert(`Audio no disponible para: ${wordOrPhrase}`);
            }
        });
    }

    // --- Navegación entre secciones ---
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSectionId = button.getAttribute('data-section') + '-section';
            sections.forEach(section => section.classList.remove('active-section'));
            navButtons.forEach(btn => btn.classList.remove('active'));

            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) {
                targetSection.classList.add('active-section');
                button.classList.add('active');

                if (targetSectionId === 'quiz-section') {
                    startQuiz();
                } else if (targetSectionId === 'lexicon-section') {
                    filterLexicon();
                }
                // No se necesita inicialización especial para 'phrases' aquí
                // porque se carga una vez al inicio.
            }
        });
    });

    // Activar una sección por defecto al cargar (p.ej. Léxico)
    const defaultSection = 'lexicon'; // Puedes cambiar a 'about', 'phrases', etc.
    const initialButton = document.querySelector(`nav button[data-section="${defaultSection}"]`);
    if (initialButton) {
        initialButton.click();
    } else { // Fallback si el botón por defecto no existe
        navButtons[0]?.click();
    }


    // --- Sección Léxico ---
    function filterLexicon() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const filteredData = lexiconData.filter(item =>
            item.raramuri.toLowerCase().includes(searchTerm) ||
            item.spanish.toLowerCase().includes(searchTerm)
        );
        displayLexicon(filteredData);
    }

    function displayLexicon(dataToDisplay) {
        lexiconContainer.innerHTML = '';
        if (dataToDisplay.length === 0 && searchInput.value) { // Mostrar mensaje solo si se buscó algo
            lexiconContainer.innerHTML = '<p>No se encontraron coincidencias.</p>';
        } else if (dataToDisplay.length === 0 && !searchInput.value) {
             lexiconContainer.innerHTML = '<p>No hay entradas en el léxico todavía.</p>';
        }

        dataToDisplay.forEach(item => {
            const entryDiv = document.createElement('div');
            entryDiv.classList.add('lexicon-entry');
            entryDiv.innerHTML = `
                <img src="${item.image}" alt="${item.spanish}" onerror="this.onerror=null; this.src='images/placeholder.png';">
                <p class="raramuri-word">${item.raramuri}</p>
                <p class="spanish-translation">${item.spanish}</p>
                <button class="audio-button" data-audio="${item.audio}" title="Escuchar pronunciación">🔊</button>
            `;
            addAudioListener(entryDiv.querySelector('.audio-button')); // Usar helper
            lexiconContainer.appendChild(entryDiv);
        });
    }

    searchInput.addEventListener('input', filterLexicon);
    filterLexicon(); // Llamada inicial para mostrar léxico

    // --- NUEVO: Sección Frases ---
    function displayPhrases() {
        phraseContainer.innerHTML = ''; // Limpiar
        if (phraseData.length === 0) {
             phraseContainer.innerHTML = '<p>Aún no hay frases añadidas.</p>';
             return;
        }
        phraseData.forEach(phrase => {
            const entryDiv = document.createElement('div');
            entryDiv.classList.add('phrase-entry');
            // Div interno para agrupar textos y facilitar layout flex
            entryDiv.innerHTML = `
                <div>
                    <p class="raramuri-phrase">${phrase.raramuri}</p>
                    <p class="spanish-phrase">${phrase.spanish}</p>
                </div>
                <button class="audio-button" data-audio="${phrase.audio}" title="Escuchar pronunciación">🔊</button>
            `;
            addAudioListener(entryDiv.querySelector('.audio-button')); // Usar helper
            phraseContainer.appendChild(entryDiv);
        });
    }

    displayPhrases(); // Llamada inicial para mostrar frases


    // --- Sección Memorama ---
    // ... (Código del Memorama SIN CAMBIOS - usa lexiconData) ...
    let memoramaCards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let canFlip = true;
    function createMemoramaBoard() { /* ... tu función ... */ }
    function handleCardFlip() { /* ... tu función ... */ }
    function checkForMatch() { /* ... tu función ... */ }
    startMemoramaButton.addEventListener('click', createMemoramaBoard);

    // --- Sección Quiz ---
    // ... (Código del Quiz SIN CAMBIOS - usa lexiconData) ...
    let currentQuestionIndex = 0;
    let score = 0;
    let quizQuestions = [];
    let questionsAnswered = false;
    function startQuiz() { /* ... tu función ... */ }
    function loadQuizQuestion() { /* ... tu función ... */ }
    function generateQuizOptions(correctItem) { /* ... tu función ... */ }
    function handleQuizAnswer(event) { /* ... tu función ... */ }
    function showFinalScore() { /* ... tu función ... */ }
    // Asegurar que el listener del botón 'next' esté correctamente asignado en startQuiz o aquí
     nextButton.onclick = () => { // Usar onclick para sobreescribir el de showFinalScore si es necesario
         if (questionsAnswered && currentQuestionIndex < quizQuestions.length) {
             loadQuizQuestion();
         } else if (currentQuestionIndex >= quizQuestions.length) {
             // Si está en pantalla final, el onclick ya se cambió a startQuiz
         }
     };


    // --- Reimplementación de funciones Memorama/Quiz (para asegurar que usen lexiconData) ---
    // (Si no las has movido, asegúrate que estén aquí y usen `lexiconData` correctamente)
    function createMemoramaBoard() {
        memoramaBoard.innerHTML = '';
        memoramaStatus.textContent = 'Encuentra los pares...';
        flippedCards = []; matchedPairs = 0; canFlip = true;
        const itemsToUse = Math.min(6, Math.floor(lexiconData.length / 1));
        if (itemsToUse < 2) { memoramaStatus.textContent = 'Se necesitan al menos 2 palabras en el léxico para jugar.'; return; }
        const gameData = shuffleArray([...lexiconData]).slice(0, itemsToUse); // Usa lexiconData
        const cardPairs = [];
        gameData.forEach(item => { cardPairs.push({ type: 'image', value: item.image, matchId: item.id }); cardPairs.push({ type: 'text', value: item.raramuri, matchId: item.id }); });
        memoramaCards = shuffleArray(cardPairs);
        memoramaCards.forEach((cardData, index) => {
            const cardElement = document.createElement('div'); cardElement.classList.add('card');
            cardElement.dataset.index = index; cardElement.dataset.matchId = cardData.matchId;
            const contentFront = cardData.type === 'image' ? `<img src="${cardData.value}" alt="Imagen Memorama" onerror="this.onerror=null; this.src='images/placeholder.png';">` : `<span>${cardData.value}</span>`;
            cardElement.innerHTML = `<div class="card-content card-back">?</div><div class="card-content card-front">${contentFront}</div>`;
            cardElement.addEventListener('click', handleCardFlip); memoramaBoard.appendChild(cardElement);
        });
        const numCards = memoramaCards.length; const columns = numCards <= 6 ? numCards / 2 : Math.ceil(Math.sqrt(numCards)); memoramaBoard.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    }
    function handleCardFlip() {
        if (!canFlip || this.classList.contains('flipped') || this.classList.contains('matched')) return; this.classList.add('flipped'); flippedCards.push(this);
        if (flippedCards.length === 2) { canFlip = false; checkForMatch(); }
    }
    function checkForMatch() {
        const [card1, card2] = flippedCards; const matchId1 = card1.dataset.matchId; const matchId2 = card2.dataset.matchId;
        if (matchId1 === matchId2) {
            card1.classList.add('matched'); card2.classList.add('matched'); matchedPairs++; flippedCards = []; canFlip = true; memoramaStatus.textContent = '¡Par encontrado!'; setTimeout(() => { if(memoramaStatus.textContent === '¡Par encontrado!') memoramaStatus.textContent = 'Encuentra los pares...'; }, 1500);
            if (matchedPairs * 2 === memoramaCards.length) { memoramaStatus.textContent = '¡Felicidades! ¡Has encontrado todos los pares!'; }
        } else {
            memoramaStatus.textContent = 'Intenta de nuevo...'; setTimeout(() => { card1.classList.remove('flipped'); card2.classList.remove('flipped'); flippedCards = []; canFlip = true; if(memoramaStatus.textContent === 'Intenta de nuevo...') memoramaStatus.textContent = 'Encuentra los pares...'; }, 1200);
        }
    }
    // --- Funciones Quiz ---
    function startQuiz() {
        if (lexiconData.length < 2) { questionElement.textContent = 'Se necesitan al menos 2 palabras en el léxico para iniciar el quiz.'; optionsElement.innerHTML = ''; feedbackElement.textContent = ''; scoreElement.textContent = ''; nextButton.style.visibility = 'hidden'; return; }
        quizQuestions = shuffleArray([...lexiconData]); // Usa lexiconData
        if (quizQuestions.length > 10) { quizQuestions = quizQuestions.slice(0, 10); }
        currentQuestionIndex = 0; score = 0; scoreElement.textContent = ''; nextButton.style.visibility = 'hidden';
        nextButton.onclick = () => { if (questionsAnswered && currentQuestionIndex < quizQuestions.length) { loadQuizQuestion(); } }; // Asignar listener para Siguiente
        loadQuizQuestion();
    }
     function loadQuizQuestion() {
        questionsAnswered = false; feedbackElement.textContent = ''; feedbackElement.className = 'quiz-feedback'; nextButton.textContent = 'Siguiente'; nextButton.style.visibility = 'hidden'; optionsElement.innerHTML = '';
        if (currentQuestionIndex >= quizQuestions.length) { showFinalScore(); return; }
        const currentQuestionData = quizQuestions[currentQuestionIndex]; const options = generateQuizOptions(currentQuestionData); // Usa lexiconData indirectamente
        const questionType = Math.random() < 0.5 ? 'image_to_raramuri' : 'raramuri_to_spanish';
        if (questionType === 'image_to_raramuri' && currentQuestionData.image) { questionElement.innerHTML = `<p>¿Cómo se dice esto en rarámuri?</p><img src="${currentQuestionData.image}" alt="Pregunta del Quiz" onerror="this.onerror=null; this.src='images/placeholder.png';">`;
        } else { questionElement.innerHTML = `<p>¿Qué significa "<strong>${currentQuestionData.raramuri}</strong>" en español?</p>`; }
        options.forEach(option => { const button = document.createElement('button'); button.textContent = option.text; button.dataset.correct = option.correct; button.addEventListener('click', handleQuizAnswer); optionsElement.appendChild(button); });
        scoreElement.textContent = `Pregunta ${currentQuestionIndex + 1} de ${quizQuestions.length}`;
    }
    function generateQuizOptions(correctItem) {
        let options = []; const questionType = questionElement.querySelector('img') ? 'image_to_raramuri' : 'raramuri_to_spanish'; const correctAnswerText = questionType === 'image_to_raramuri' ? correctItem.raramuri : correctItem.spanish;
        options.push({ text: correctAnswerText, correct: true });
        const distractorsPool = lexiconData.filter(item => item.id !== correctItem.id); // Usa lexiconData
        const shuffledDistractors = shuffleArray([...distractorsPool]); const numOptionsNeeded = Math.min(3, shuffledDistractors.length);
        for (let i = 0; i < numOptionsNeeded; i++) { const distractor = shuffledDistractors[i]; const distractorText = questionType === 'image_to_raramuri' ? distractor.raramuri : distractor.spanish; if (!options.some(opt => opt.text === distractorText)) { options.push({ text: distractorText, correct: false }); } }
        while (options.length < Math.min(4, lexiconData.length) && options.length < 2) { const randomEntry = lexiconData[Math.floor(Math.random() * lexiconData.length)]; const fillerText = questionType === 'image_to_raramuri' ? randomEntry.raramuri : randomEntry.spanish; if (!options.some(opt => opt.text === fillerText)) { options.push({ text: fillerText, correct: false }); } if (options.length < 2 && lexiconData.length <= 2) break; }
        return shuffleArray(options);
    }
    function handleQuizAnswer(event) {
        if (questionsAnswered) return; questionsAnswered = true; const selectedButton = event.target; const isCorrect = selectedButton.dataset.correct === 'true';
        Array.from(optionsElement.children).forEach(button => { button.disabled = true; if (button.dataset.correct === 'true') { button.classList.add('correct'); } else if (button === selectedButton) { button.classList.add('incorrect'); } });
        if (isCorrect) { score++; feedbackElement.textContent = '¡Correcto!'; feedbackElement.className = 'quiz-feedback correct';
        } else { const correctAnswer = optionsElement.querySelector('button[data-correct="true"]').textContent; feedbackElement.textContent = `Incorrecto. La respuesta correcta es: ${correctAnswer}`; feedbackElement.className = 'quiz-feedback incorrect'; }
        currentQuestionIndex++; nextButton.style.visibility = 'visible';
        if (currentQuestionIndex >= quizQuestions.length) { nextButton.textContent = 'Ver Resultados Finales'; }
         scoreElement.textContent = `Pregunta ${currentQuestionIndex} de ${quizQuestions.length} - Aciertos: ${score}`; // Mover actualización aquí
    }
    function showFinalScore() {
        questionElement.textContent = '¡Quiz Completado!'; optionsElement.innerHTML = ''; feedbackElement.textContent = ''; scoreElement.textContent = `Tu puntuación final es: ${score} de ${quizQuestions.length}`; nextButton.textContent = 'Reiniciar Quiz'; nextButton.style.visibility = 'visible';
        nextButton.onclick = startQuiz; // Cambia evento para reiniciar
    }


}); // Fin del DOMContentLoaded