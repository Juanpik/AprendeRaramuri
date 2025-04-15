document.addEventListener('DOMContentLoaded', () => {
    // --- DATOS ---
    const lexiconData = [
        { id: 1, raramuri: 'bawi', spanish: 'agua', image: 'images/bawi.jpg' },
        { id: 2, raramuri: 'muni', spanish: 'frijol', image: 'images/muni.jpg' },
        { id: 3, raramuri: 'reme', spanish: 'tortilla', image: 'images/reme.jpg' },
        { id: 4, raramuri: 'sewa', spanish: 'flor', image: 'images/sewa.jpg' },
        { id: 5, raramuri: 'sunu', spanish: 'maíz', image: 'images/sunu.jpg' },
        // --- ¡AÑADE MÁS ENTRADAS AQUÍ! ---
        // { id: 6, raramuri: '...', spanish: '...', image: 'images/....png' },
    ];

    const phrasesData = [
        { raramuri: 'Kuira ba!', spanish: '¡Hola! / ¡Buenos días!' },
        { raramuri: 'Matetera ba.', spanish: 'Gracias.' },
        // --- ¡AÑADE MÁS FRASES AQUÍ! ---
    ];

    // --- ELEMENTOS DEL DOM ---
    const navButtons = document.querySelectorAll('nav button');
    const contentSections = document.querySelectorAll('.content-section');
    const lexiconGrid = document.getElementById('lexicon-grid');
    const phrasesList = document.getElementById('phrases-list');
    const memoramaGrid = document.getElementById('memorama-grid');
    const memoramaAttemptsEl = document.getElementById('memorama-attempts');
    const resetMemoramaBtn = document.getElementById('reset-memorama');
    const quizContainer = document.getElementById('quiz-container');
    const startQuizBtn = document.getElementById('start-quiz');
    const quizQuestionArea = document.getElementById('quiz-question-area');
    const quizQuestionEl = document.getElementById('quiz-question');
    const quizOptionsEl = document.getElementById('quiz-options');
    const quizFeedbackEl = document.getElementById('quiz-feedback');
    const nextQuestionBtn = document.getElementById('next-question');
    const quizResultsEl = document.getElementById('quiz-results');
    const quizScoreEl = document.getElementById('quiz-score');
    const quizTotalEl = document.getElementById('quiz-total');
    const restartQuizBtn = document.getElementById('restart-quiz');


    // --- NAVEGACIÓN ENTRE SECCIONES ---
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sectionId = button.getAttribute('data-section');

            // Ocultar todas las secciones y quitar clase activa de botones
            contentSections.forEach(section => section.classList.remove('active'));
            navButtons.forEach(btn => btn.classList.remove('active'));

            // Mostrar la sección seleccionada y marcar botón como activo
            document.getElementById(sectionId).classList.add('active');
            button.classList.add('active');

            // Si se entra a Memorama o Quiz por primera vez o se reinicia, inicializar
             if (sectionId === 'memorama') {
                 if (!memoramaGrid.hasChildNodes()) { // Solo inicializar si está vacío
                    initMemorama();
                 }
             } else if (sectionId === 'quiz') {
                resetQuizView(); // Resetea la vista del quiz cada vez que entras
             }
        });
    });

    // --- LÓGICA DEL LÉXICO ---
    function populateLexicon() {
        lexiconGrid.innerHTML = ''; // Limpiar por si acaso
        lexiconData.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('lexicon-item');
            div.innerHTML = `
                <img src="${item.image}" alt="${item.spanish}" onerror="this.src='images/placeholder.png'; this.alt='Imagen no encontrada'">
                <p class="raramuri-word">${item.raramuri}</p>
                <p class="spanish-word">${item.spanish}</p>
            `;
            lexiconGrid.appendChild(div);
        });
    }

    // --- LÓGICA DE FRASES ---
    function populatePhrases() {
        phrasesList.innerHTML = ''; // Limpiar
        phrasesData.forEach(phrase => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="raramuri-phrase">${phrase.raramuri}</span>
                <span class="spanish-phrase">${phrase.spanish}</span>
            `;
            phrasesList.appendChild(li);
        });
    }

    // --- LÓGICA DEL MEMORAMA ---
    let memoramaCards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let memoramaAttempts = 0;
    let lockBoard = false; // Para evitar clicks rápidos

    function createMemoramaCards() {
        // Tomar algunos items del léxico (o todos si son pocos)
        // Para este ejemplo, usaremos los primeros 4 items (necesitamos pares)
        const itemsForGame = lexiconData.slice(0, 4);
        if (itemsForGame.length < 2) return; // Necesitamos al menos 2 items

        const cardData = [];
        itemsForGame.forEach(item => {
            // Añadir carta con imagen y carta con palabra rarámuri
            cardData.push({ type: 'image', value: item.image, id: item.id });
            cardData.push({ type: 'text', value: item.raramuri, id: item.id });
        });

        return shuffleArray(cardData); // Mezclar las cartas
    }

    function initMemorama() {
        memoramaGrid.innerHTML = '';
        flippedCards = [];
        matchedPairs = 0;
        memoramaAttempts = 0;
        memoramaAttemptsEl.textContent = memoramaAttempts;
        lockBoard = false;

        memoramaCards = createMemoramaCards();

        if (memoramaCards.length === 0) {
            memoramaGrid.innerHTML = '<p>No hay suficientes datos para el memorama.</p>';
            return;
        }


        memoramaCards.forEach((cardInfo, index) => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('memorama-card');
            cardElement.dataset.id = cardInfo.id; // Guardamos el ID para comparar
            cardElement.dataset.index = index; // Guardamos índice único

            const frontFace = document.createElement('div');
            frontFace.classList.add('card-face', 'card-front');
            if (cardInfo.type === 'image') {
                const img = document.createElement('img');
                 img.src = cardInfo.value;
                 img.alt = "Imagen";
                 img.onerror="this.style.display='none'; this.parentElement.textContent='Error'"; // Manejo de error si no carga
                 frontFace.appendChild(img);
            } else {
                frontFace.textContent = cardInfo.value;
            }


            const backFace = document.createElement('div');
            backFace.classList.add('card-face', 'card-back');
            // backFace.textContent = '?'; // O poner imagen de reverso

            cardElement.appendChild(frontFace);
            cardElement.appendChild(backFace);

            cardElement.addEventListener('click', handleCardClick);
            memoramaGrid.appendChild(cardElement);
        });

         // Ajustar columnas del grid según número de cartas
        const numCards = memoramaCards.length;
        let columns = 4; // Default
        if (numCards <= 6) columns = 3;
        if (numCards > 16) columns = 5; // Ejemplo
        memoramaGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

    }

    function handleCardClick(event) {
        if (lockBoard) return;
        const clickedCard = event.currentTarget;

        // Evitar click en carta ya volteada o emparejada
        if (clickedCard.classList.contains('flipped') || clickedCard.classList.contains('matched')) {
            return;
        }

        flipCard(clickedCard);
        flippedCards.push(clickedCard);

        if (flippedCards.length === 2) {
            lockBoard = true; // Bloquear tablero mientras se comprueba
            memoramaAttempts++;
            memoramaAttemptsEl.textContent = memoramaAttempts;
            checkForMatch();
        }
    }

    function flipCard(card) {
        card.classList.add('flipped');
    }

    function unflipCards() {
        setTimeout(() => {
            flippedCards.forEach(card => card.classList.remove('flipped'));
            flippedCards = [];
            lockBoard = false;
        }, 1200); // Tiempo para ver las cartas antes de voltearlas
    }

    function disableCards() {
        flippedCards.forEach(card => {
            card.classList.add('matched'); // Marcar como emparejada (cambia estilo y evita más clicks)
            // card.removeEventListener('click', handleCardClick); // Opcional: remover listener
        });
        flippedCards = [];
        lockBoard = false;
    }

    function checkForMatch() {
        const [card1, card2] = flippedCards;
        const isMatch = card1.dataset.id === card2.dataset.id;

        if (isMatch) {
            matchedPairs++;
            disableCards();
            if (matchedPairs === memoramaCards.length / 2) {
                setTimeout(() => alert(`¡Ganaste en ${memoramaAttempts} intentos!`), 500);
            }
        } else {
            unflipCards();
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Intercambio de elementos
        }
        return array;
    }

    resetMemoramaBtn.addEventListener('click', initMemorama);


    // --- LÓGICA DEL QUIZ ---
    let quizQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let quizActive = false;

    function generateQuizQuestions() {
        // Generar preguntas a partir del léxico
        // Ejemplo: "¿Qué significa [palabra rarámuri]?" o "¿Cómo se dice [palabra español] en rarámuri?"
        const questions = [];
        const shuffledLexicon = shuffleArray([...lexiconData]); // Copia mezclada

        for (let i = 0; i < shuffledLexicon.length; i++) {
            if (questions.length >= 5) break; // Limitar a 5 preguntas por ahora

            const item = shuffledLexicon[i];
            const questionType = Math.random() < 0.5 ? 'raramuriToSpanish' : 'spanishToRaramuri';
            let questionText = '';
            let correctAnswer = '';
            const options = [];

             // Crear opciones incorrectas
            const wrongAnswers = lexiconData
                .filter(lex => lex.id !== item.id) // Excluir la respuesta correcta
                .map(lex => questionType === 'raramuriToSpanish' ? lex.spanish : lex.raramuri); // Tomar la palabra correspondiente

            const shuffledWrongs = shuffleArray(wrongAnswers).slice(0, 3); // Tomar 3 incorrectas

            if (questionType === 'raramuriToSpanish') {
                questionText = `¿Qué significa "${item.raramuri}"?`;
                correctAnswer = item.spanish;
                options.push(correctAnswer);
                options.push(...shuffledWrongs.map(w => w)); // w ya es el string spanish
            } else {
                questionText = `¿Cómo se dice "${item.spanish}" en rarámuri?`;
                correctAnswer = item.raramuri;
                 options.push(correctAnswer);
                 options.push(...shuffledWrongs.map(w => w)); // w ya es el string raramuri
            }


            // Asegurarse de que las opciones sean únicas (por si hay duplicados en los datos)
            const uniqueOptions = [...new Set(options)];
            // Rellenar si no hay suficientes opciones únicas (raro, pero posible)
            while (uniqueOptions.length < 4 && lexiconData.length > uniqueOptions.length) {
                 const randomItem = lexiconData[Math.floor(Math.random() * lexiconData.length)];
                 const potentialOption = questionType === 'raramuriToSpanish' ? randomItem.spanish : randomItem.raramuri;
                 if (!uniqueOptions.includes(potentialOption)) {
                    uniqueOptions.push(potentialOption);
                 }
            }


            questions.push({
                question: questionText,
                options: shuffleArray(uniqueOptions.slice(0, 4)), // Mezclar opciones finales (máx 4)
                answer: correctAnswer
            });
        }
         console.log("Generated Questions:", questions); // Para depuración
        return questions;
    }

    function startQuiz() {
        quizQuestions = generateQuizQuestions();
        if (quizQuestions.length === 0) {
             quizQuestionArea.innerHTML = "<p>No hay suficientes datos para generar el quiz.</p>";
             startQuizBtn.style.display = 'block'; // Mostrar botón de inicio de nuevo
             quizResultsEl.style.display = 'none';
             return;
        }

        currentQuestionIndex = 0;
        score = 0;
        quizActive = true;
        startQuizBtn.style.display = 'none';
        quizResultsEl.style.display = 'none';
        quizQuestionArea.style.display = 'block';
        nextQuestionBtn.style.display = 'none'; // Ocultar botón 'Siguiente' al principio
        displayQuestion();
    }

    function displayQuestion() {
        if (currentQuestionIndex >= quizQuestions.length) {
            showResults();
            return;
        }

        const q = quizQuestions[currentQuestionIndex];
        quizQuestionEl.textContent = q.question;
        quizOptionsEl.innerHTML = ''; // Limpiar opciones anteriores
        quizFeedbackEl.textContent = ''; // Limpiar feedback
        quizFeedbackEl.className = ''; // Limpiar clases de feedback

        q.options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option;
            button.addEventListener('click', handleAnswer);
            quizOptionsEl.appendChild(button);
        });

        nextQuestionBtn.style.display = 'none'; // Ocultar 'Siguiente' hasta que se responda
    }

    function handleAnswer(event) {
        if (!quizActive) return; // Evitar clicks después de responder

        const selectedButton = event.target;
        const selectedAnswer = selectedButton.textContent;
        const correctAnswer = quizQuestions[currentQuestionIndex].answer;

        // Deshabilitar botones de opción
        const optionButtons = quizOptionsEl.querySelectorAll('button');
        optionButtons.forEach(btn => btn.disabled = true);
        quizActive = false; // Marcar como inactivo hasta la siguiente pregunta

        if (selectedAnswer === correctAnswer) {
            score++;
            selectedButton.classList.add('correct');
            quizFeedbackEl.textContent = '¡Correcto!';
            quizFeedbackEl.className = 'correct';
        } else {
            selectedButton.classList.add('incorrect');
            quizFeedbackEl.textContent = `Incorrecto. La respuesta era: ${correctAnswer}`;
            quizFeedbackEl.className = 'incorrect';
            // Resaltar la respuesta correcta también
             optionButtons.forEach(btn => {
                 if (btn.textContent === correctAnswer) {
                     btn.classList.add('correct');
                 }
             });
        }

        nextQuestionBtn.style.display = 'block'; // Mostrar botón 'Siguiente'
    }

     function goToNextQuestion() {
         currentQuestionIndex++;
         quizActive = true; // Reactivar para la siguiente pregunta
         displayQuestion();
     }


    function showResults() {
        quizQuestionArea.style.display = 'none';
        quizResultsEl.style.display = 'block';
        quizScoreEl.textContent = score;
        quizTotalEl.textContent = quizQuestions.length;
    }

    function resetQuizView() {
        quizActive = false;
        startQuizBtn.style.display = 'block';
        quizQuestionArea.style.display = 'none';
        quizResultsEl.style.display = 'none';
        nextQuestionBtn.style.display = 'none';
        quizFeedbackEl.textContent = '';
         quizFeedbackEl.className = '';
         quizOptionsEl.innerHTML = '';
         quizQuestionEl.textContent = '¡Ponte a prueba!'; // Mensaje inicial
    }

    startQuizBtn.addEventListener('click', startQuiz);
    nextQuestionBtn.addEventListener('click', goToNextQuestion);
    restartQuizBtn.addEventListener('click', startQuiz); // Reusa la función start para reiniciar

    // --- INICIALIZACIÓN AL CARGAR LA PÁGINA ---
    populateLexicon();
    populatePhrases();
    // initMemorama(); // Opcional: iniciar el memorama al cargar, o solo al entrar a la sección
    // La navegación se encarga de mostrar la sección 'about' por defecto
     document.querySelector('nav button[data-section="about"]').classList.add('active'); // Activa el primer botón

});