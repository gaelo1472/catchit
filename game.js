// Crear elementos de audio
const loseLifeSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3');
loseLifeSound.volume = 0.6;
const gameOverSound = new Audio('https://assets.mixkit.co/active_storage/sfx/561/561-preview.mp3');
gameOverSound.volume = 0.7;
// Sonido clásico de moneda de videojuego (tintineante)
const pointSound = new Audio('https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3');
pointSound.volume = 0.5;
// Sonido para el botón de inicio
const buttonSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2681/2681-preview.mp3');
buttonSound.volume = 0.6;
// Sonido para la estrella y poder de invulnerabilidad (más épico y menos "extraño")
const starSound = new Audio('https://assets.mixkit.co/active_storage/sfx/1688/1688-preview.mp3');
starSound.volume = 0.8;
// Música Lo-Fi para los menús (URLs totalmente nuevas y confiables de Pixabay)
const lofiMusic = new Audio('https://cdn.pixabay.com/download/audio/2022/10/25/audio_f899a3ab21.mp3?filename=lofi-study-112191.mp3');
lofiMusic.volume = 0.35;
lofiMusic.loop = true;
// Música de acción para durante el juego
const actionMusic = new Audio('https://cdn.pixabay.com/download/audio/2021/08/08/audio_d720dd60b5.mp3?filename=action-game-music-loop-21-117420.mp3');
actionMusic.volume = 0.4;
actionMusic.loop = true;

function createMusicButton() {
    // Crear botón de música sencillo
    const musicBtn = document.createElement('button');
    musicBtn.id = 'music-toggle';
    musicBtn.innerHTML = 'Sonido: ON';
    musicBtn.className = 'music-button';
    
    // Establecer estilos inline para asegurar visibilidad
    musicBtn.style.position = 'absolute';
    musicBtn.style.top = '10px';
    musicBtn.style.right = '10px';
    musicBtn.style.padding = '8px 12px';
    musicBtn.style.backgroundColor = 'rgba(0,0,0,0.7)';
    musicBtn.style.color = 'white';
    musicBtn.style.border = '2px solid #ffcc00';
    musicBtn.style.borderRadius = '5px';
    musicBtn.style.cursor = 'pointer';
    musicBtn.style.zIndex = '1000';
    
    // Variable para tracking del estado del sonido
    window.soundEnabled = true;
    
    // Añadir evento de clic para activar/desactivar sonidos
    musicBtn.addEventListener('click', function() {
        // Cambiar el estado del sonido
        window.soundEnabled = !window.soundEnabled;
        
        // Actualizar el texto del botón
        musicBtn.innerHTML = window.soundEnabled ? 'Sonido: ON' : 'Sonido: OFF';
        
        // Actualizar estilo visual del botón
        if (window.soundEnabled) {
            musicBtn.style.backgroundColor = 'rgba(0,0,0,0.7)';
        } else {
            musicBtn.style.backgroundColor = '#555';
        }
    });
    
    // Añadir botón al DOM
    document.body.appendChild(musicBtn);
    
    return musicBtn;
}

function gameOver() {
    console.log('Game Over en nivel:', level);
    gameActive = false;
    
    // Detener la música de acción
    actionMusic.pause();
    
    // Reproducir sonido de game over
    gameOverSound.currentTime = 0;
    if (window.soundEnabled) {
        gameOverSound.play().catch(e => console.log('Error reproduciendo sonido:', e));
    }
    
    // Reiniciar la música lo-fi para la pantalla de game over
    setTimeout(() => {
        lofiMusic.currentTime = 0;
        if (window.soundEnabled) {
            lofiMusic.play().catch(e => console.log('Error reproduciendo música:', e));
        }
    }, 1000); // Esperar un segundo para que primero suene el game over
    
    if (spawnInterval) {
        clearInterval(spawnInterval);
        spawnInterval = null;
    }
    
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    
    // Actualizar mejor puntuación una última vez
    updateBestScore();
    
    // Actualizar información final
    finalScoreValue.textContent = score;
    finalLevelValue.textContent = level;
    finalBestValue.textContent = bestScore;
    
    // Mostrar pantalla de juego terminado
    gameScreen.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    
    // Añadir botón de volver al menú principal si no existe ya
    if (!document.getElementById('back-to-menu-gameover')) {
        const backToMenuBtn = document.createElement('button');
        backToMenuBtn.id = 'back-to-menu-gameover';
        backToMenuBtn.textContent = 'Volver al Menú';
        backToMenuBtn.classList.add('main-button');
        backToMenuBtn.style.marginTop = '20px';
        
        // Añadir evento para volver al menú principal
        backToMenuBtn.addEventListener('click', () => {
            if (window.soundEnabled) {
                buttonSound.currentTime = 0;
                buttonSound.play().catch(e => console.log('Error reproduciendo sonido:', e));
            }
            returnToMainMenu();
        });
        
        // Añadir el botón al final de la pantalla de game over
        gameOverScreen.appendChild(backToMenuBtn);
    }
    
    // Actualizar el selector de niveles
    createLevelSelector();
}

// Función para reproducir un sonido teniendo en cuenta la configuración
function playSound(sound) {
    if (window.soundEnabled) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log(`Error reproduciendo sonido:`, e));
    }
}

// Configurar los otros botones normalmente
if (continueButton) {
continueButton.addEventListener('click', () => {
    playSound(buttonSound);
    continueToNextLevel();
});
}

if (restartButton) {
restartButton.addEventListener('click', () => {
    playSound(buttonSound);
    // Iniciar música Lo-Fi cuando vuelvas al menú
    lofiMusic.currentTime = 0;
    if (window.soundEnabled) {
        lofiMusic.play().catch(e => console.log('Error reproduciendo música:', e));
    }
    // Reiniciar el juego con el mismo nivel
    startGame(currentLevel);
});
}

enhanceButtonsTouchability();

// Función para iniciar el juego (usada por todos los botones de inicio)
function startGameHandler() {
    console.log('Iniciando juego con nivel:', currentLevel);
    if (window.soundEnabled) {
        buttonSound.currentTime = 0;
        buttonSound.play().catch(e => console.log('Error reproduciendo sonido:', e));
    }
    // Pausar la música durante el juego
    lofiMusic.pause();
    startGame(currentLevel);
}

function startGame(startLevel) {
    console.log(`Iniciando juego en nivel ${startLevel}`);
    
    resetGame();
    
    // Establecer el nivel con el que comenzar
    level = startLevel || 1;
    currentLevel = level;
    
    console.log(`Nivel configurado: ${level}`);
    
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    // Crear botón de regreso al menú si no existe
    if (!document.getElementById('back-to-menu')) {
        createBackToMenuButton();
    }
    
    // Actualizar la información del nivel
    levelValue.textContent = level;
    
    // Establecer el fondo para el nivel actual
    updateBackgroundForLevel(level);
    
    gameActive = true;
    
    // Configurar velocidad según nivel
    updateLevelDifficulty();
    
    // Iniciar generación de objetos
    spawnInterval = setInterval(spawnObject, objectSpawnRate);
    
    // Iniciar música de acción
    actionMusic.currentTime = 0;
    if (window.soundEnabled) {
        actionMusic.play().catch(e => console.log('Error reproduciendo música de acción:', e));
    }
    
    // Iniciar el bucle del juego
    gameLoop();
    
    console.log(`Juego iniciado - Objetivo para pasar nivel: ${100} puntos`);
}

// Añadir función para mostrar efecto visual de pérdida de vida
function showLifeLostEffect() {
    gameArea.classList.add('hit');
    setTimeout(() => gameArea.classList.remove('hit'), 300);
    if (window.soundEnabled) {
        loseLifeSound.currentTime = 0;
        loseLifeSound.play().catch(e => console.log('Error reproduciendo sonido:', e));
    }
}

// Sonido al atrapar objeto bueno
if (window.soundEnabled) {
    pointSound.currentTime = 0;
    pointSound.play().catch(e => console.log('Error reproduciendo sonido:', e));
}

// Sumar puntos según tipo de objeto
score += objectTypes[obj.type].points;
scoreValue.textContent = score; 
// Inicialización del juego
let gameInitialized = false;
