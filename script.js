// --- (Código anterior: variables, loadData, utils, nav, léxico, frases) ---

    // --- Memorama ---
    function createMemoramaCards() {
        // Filtrar items que tengan ID, imagen, raramuri y español (necesarios para las cartas)
        const itemsWithImages = lexiconData.filter(item =>
            item && item.id && item.image && item.raramuri && item.spanish
        );

        if (itemsWithImages.length < totalPairs) {
             console.warn(`Memorama: No hay suficientes items completos (${itemsWithImages.length}) para ${totalPairs} pares.`);
             memoramaDataErrorEl.textContent = `No hay suficientes datos léxicos completos (${itemsWithImages.length}) para esta dificultad (${totalPairs} pares). Añade más entradas.`;
             memoramaDataErrorEl.style.display = 'block';
             totalPairs = itemsWithImages.length;
             if (totalPairs < 1) return [];
             else { memoramaDataErrorEl.textContent += ` Jugando con ${totalPairs} pares.`; }
        } else {
             memoramaDataErrorEl.style.display = 'none';
        }

        const shuffledLexicon = shuffleArray([...itemsWithImages]);
        const itemsForGame = shuffledLexicon.slice(0, totalPairs);

        const cardData = [];
        itemsForGame.forEach(item => {
            // Añadir carta de imagen y carta de texto SIEMPRE que el item sea válido
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

        if (memoramaCards.length === 0 || memoramaCards.length % 2 !== 0) {
            console.error("Error al generar cartas de memorama o número impar.");
            memoramaGrid.innerHTML = '<p>Error al generar cartas. Verifica los datos léxicos y que haya pares.</p>';
             memoramaGameArea.style.display = 'none';
             memoramaDataErrorEl.style.display = 'block';
            return;
        }
        memoramaGameArea.style.display = 'block';

        memoramaCards.forEach((cardInfo, index) => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('memorama-card');
            cardElement.dataset.id = cardInfo.id;
            cardElement.dataset.index = index; // Útil para depuración

            // Crear Cara Frontal
            const frontFace = document.createElement('div');
            frontFace.classList.add('card-face', 'card-front');

            // Crear Cara Trasera
            const backFace = document.createElement('div');
            backFace.classList.add('card-face', 'card-back');

            // --- Añadir contenido a la Cara Frontal ---
            if (cardInfo.type === 'image' && cardInfo.value) {
                const img = document.createElement('img');
                img.src = cardInfo.value;
                img.alt = cardInfo.altText || "Imagen Memorama"; // Alt text descriptivo
                // Error handling más robusto
                img.onerror = function() {
                    console.error(`Error al cargar imagen: ${this.src}`);
                    this.style.display = 'none'; // Ocultar imagen rota
                    // Añadir texto de error directamente a la cara frontal
                    const errorText = document.createElement('p');
                    errorText.textContent = `Error img (${cardInfo.value.split('/').pop()})`; // Mostrar nombre archivo
                    errorText.style.fontSize = '0.8em';
                    errorText.style.color = 'var(--error-red)';
                    frontFace.appendChild(errorText); // Añadir al frontFace
                };
                 // Asegurarse de que la imagen se añade incluso si no hay texto
                 frontFace.appendChild(img);

            } else if (cardInfo.type === 'text' && cardInfo.value) {
                 const textP = document.createElement('p'); // Usar siempre un <p> para el texto
                 textP.textContent = cardInfo.value;
                 frontFace.appendChild(textP); // Añadir el párrafo al frontFace

            } else {
                 // Caso fallback si el tipo no es reconocido o falta valor
                 console.warn(`Contenido inválido para carta ${index}:`, cardInfo);
                 const fallbackText = document.createElement('p');
                 fallbackText.textContent = '???';
                 fallbackText.style.opacity = '0.5';
                 frontFace.appendChild(fallbackText);
            }
            // --- Fin añadir contenido ---

            cardElement.appendChild(frontFace); // Añadir frontFace completo
            cardElement.appendChild(backFace);  // Añadir backFace

            cardElement.addEventListener('click', handleCardClick);
            memoramaGrid.appendChild(cardElement);
        });

        // Ajustar columnas del grid (esto parece estar bien)
        let columns = 4;
        const numCards = memoramaCards.length;
        // Intentar hacer el grid más cuadrado
        if (numCards <= 6) columns = 3; // 2x3 o 3x2
        else if (numCards <= 9) columns = 3; // 3x3
        else if (numCards <= 12) columns = 4; // 4x3
        else if (numCards <= 16) columns = 4; // 4x4
        else columns = 5; // 5xN
        memoramaGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    }

    function startMemorama(numPairs) {
        // Verificar si hay suficientes items *antes* de crear cartas
        const itemsWithImages = lexiconData.filter(item => item && item.id && item.image && item.raramuri && item.spanish);
         if (itemsWithImages.length < numPairs) {
             console.warn(`Memorama Start: No hay suficientes items completos (${itemsWithImages.length}) para ${numPairs} pares.`);
             memoramaDataErrorEl.textContent = `No hay suficientes datos léxicos completos (${itemsWithImages.length}) para esta dificultad (${numPairs} pares).`;
             memoramaDataErrorEl.style.display = 'block';
             memoramaGameArea.style.display = 'none'; // Ocultar área si no se puede iniciar
             memoramaSetup.style.display = 'block'; // Mostrar setup de nuevo
             // Deseleccionar botón de dificultad
             difficultyButtons.forEach(btn => btn.classList.remove('selected'));
             return; // No continuar
         }

        totalPairs = numPairs; // Establecer los pares deseados
        memoramaSetup.style.display = 'none';
        memoramaGameArea.style.display = 'block';
        memoramaWinMessage.style.display = 'none';
        memoramaDataErrorEl.style.display = 'none';
        initMemorama(); // Llamar a initMemorama que ahora contiene la lógica de creación y validación final
    }
    // --- (handleCardClick, flipCard, unflipCards, disableCards, checkForMatch - Sin cambios necesarios aquí) ---
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
        flippedCards.forEach(card => card.classList.add('matched')); // Añade 'matched', no quita 'flipped'
        flippedCards = [];
        lockBoard = false;
    }
    function checkForMatch() {
        const [card1, card2] = flippedCards;
        // Asegurarse que dataset.id existe en ambos antes de comparar
        const isMatch = card1.dataset.id && card1.dataset.id === card2.dataset.id;
        if (isMatch) {
            matchedPairs++;
            disableCards(); // Deja las cartas flipped y añade 'matched'
            if (matchedPairs === totalPairs) {
                memoramaWinMessage.textContent = `¡Felicidades! Encontraste ${totalPairs} pares en ${memoramaAttempts} intentos.`;
                memoramaWinMessage.style.display = 'block';
            }
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
        memoramaGrid.innerHTML = '';
    }
    function setupMemoramaControls() {
        difficultyButtons.forEach(button => {
            button.addEventListener('click', () => {
                const pairs = parseInt(button.getAttribute('data-pairs'));
                difficultyButtons.forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');
                startMemorama(pairs); // Llama a la función que ahora valida primero
            });
        });
        resetMemoramaBtn.addEventListener('click', () => {
             // Reiniciar con la misma dificultad (si una fue seleccionada)
             const selectedBtn = document.querySelector('.difficulty-btn.selected');
             if (selectedBtn) {
                 const pairs = parseInt(selectedBtn.getAttribute('data-pairs'));
                 startMemorama(pairs); // Reinicia el juego actual
             } else {
                 // Si no se seleccionó dificultad (raro), simplemente resetea la vista
                 resetMemoramaView();
             }
        });
    }

// --- (Resto del código JS: Quiz, Inicialización, etc.) ---
// Asegúrate de que la función initializeApplication llame a setupMemoramaControls()
 function initializeApplication() {
        setupNavigation();
        displayLexiconItems(lexiconData);
        populatePhrases();
        setupSearch();
        setupMemoramaControls(); // <--- Asegurar que se llama
        setupQuizControls();
        console.log("Aplicación inicializada.");
    }
