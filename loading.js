(() => {
  const screen = document.querySelector("[data-loading-screen]");
  const scene = document.querySelector("[data-minecraft-scene]");
  const sceneImage = document.querySelector(".minecraft-layout__image");
  const nextSceneImage = document.querySelector(".minecraft-layout__next-image");
  const finalSceneImage = document.querySelector(".minecraft-layout__final-image");
  const protectionSceneImage = document.querySelector(".minecraft-layout__protection-image");
  const thanksFinalSceneImage = document.querySelector(".minecraft-layout__thanks-final-image");
  const sceneDetails = document.querySelector("[data-scene-details]");
  const declaration = document.querySelector(".love-declaration");
  const loveThings = document.querySelector("[data-love-things]");
  const reminderThings = document.querySelector("[data-reminder-things]");
  const thanksThings = document.querySelector("[data-thanks-things]");
  const finalLetter = document.querySelector("[data-final-letter]");
  const advanceButton = document.querySelector("[data-advance]");
  const finalAdvanceButton = document.querySelector("[data-advance-final]");
  const protectionAdvanceButton = document.querySelector("[data-advance-protection]");
  const finishButton = document.querySelector("[data-finish]");
  const musicToggle = document.querySelector("[data-music-toggle]");
  const musicLabel = document.querySelector("[data-music-label]");
  const panorama = document.querySelector(".panorama__image");
  const layoutBackground = document.querySelector(".minecraft-layout__image");
  const title = document.querySelector("[data-loading-title]");
  const hearts = document.querySelector("[data-hearts]");
  const progress = document.querySelector("[data-progress]");
  const fill = document.querySelector("[data-progress-fill]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const heartSprites = {
    empty: "assets/heart-empty.png",
    half: "assets/heart-half.png",
    full: "assets/heart-full.png"
  };
  const minimumLoadingDuration = 10000;
  const finalMessageDuration = reducedMotion ? 350 : 1350;
  const fadeDuration = reducedMotion ? 0 : 950;
  const loadingStartedAt = performance.now();
  const heartTimers = [];

  if (!screen || !scene || !sceneImage || !nextSceneImage || !finalSceneImage || !protectionSceneImage || !thanksFinalSceneImage || !sceneDetails || !declaration || !loveThings || !reminderThings || !thanksThings || !finalLetter || !advanceButton || !finalAdvanceButton || !protectionAdvanceButton || !finishButton || !panorama || !layoutBackground || !title || !hearts || !progress || !fill) {
    throw new Error("Não foi possível inicializar a tela de carregamento.");
  }

  document.body.classList.add("loading-active");

  function updateScrollHint() {
    declaration.classList.toggle("has-overflow", declaration.scrollHeight > declaration.clientHeight + 1);
    loveThings.classList.toggle("has-overflow", loveThings.scrollHeight > loveThings.clientHeight + 1);
    reminderThings.classList.toggle("has-overflow", reminderThings.scrollHeight > reminderThings.clientHeight + 1);
    thanksThings.classList.toggle("has-overflow", thanksThings.scrollHeight > thanksThings.clientHeight + 1);
    finalLetter.classList.toggle("has-overflow", finalLetter.scrollHeight > finalLetter.clientHeight + 1);
  }

  updateScrollHint();
  window.addEventListener("resize", updateScrollHint);
  document.fonts.ready.then(updateScrollHint);

  advanceButton.addEventListener("click", async (event) => {
    event.stopPropagation();
    advanceButton.disabled = true;

    try {
      await waitForImage(nextSceneImage, "A próxima paisagem não pôde ser carregada.");
      declaration.setAttribute("aria-hidden", "true");
      loveThings.setAttribute("aria-hidden", "false");
      scene.classList.add("is-advanced");
      updateScrollHint();
    } catch (error) {
      console.error(error);
      advanceButton.disabled = false;
      advanceButton.textContent = "Imagem indisponível";
    }
  });

  finalAdvanceButton.addEventListener("click", async (event) => {
    event.stopPropagation();
    finalAdvanceButton.disabled = true;

    try {
      await waitForImage(finalSceneImage, "O cenário final não pôde ser carregado.");
      loveThings.setAttribute("aria-hidden", "true");
      reminderThings.setAttribute("aria-hidden", "false");
      scene.classList.add("is-finale");
      updateScrollHint();
    } catch (error) {
      console.error(error);
      finalAdvanceButton.disabled = false;
      finalAdvanceButton.textContent = "Imagem indisponível";
    }
  });

  protectionAdvanceButton.addEventListener("click", async (event) => {
    event.stopPropagation();
    protectionAdvanceButton.disabled = true;

    try {
      await waitForImage(protectionSceneImage, "O próximo cenário não pôde ser carregado.");
      reminderThings.setAttribute("aria-hidden", "true");
      thanksThings.setAttribute("aria-hidden", "false");
      scene.classList.add("is-epilogue");
      updateScrollHint();
    } catch (error) {
      console.error(error);
      protectionAdvanceButton.disabled = false;
      protectionAdvanceButton.textContent = "Imagem indisponível";
    }
  });

  finishButton.addEventListener("click", async (event) => {
    event.stopPropagation();
    finishButton.disabled = true;

    try {
      await waitForImage(thanksFinalSceneImage, "O cenário final não pôde ser carregado.");
      thanksThings.setAttribute("aria-hidden", "true");
      finalLetter.setAttribute("aria-hidden", "false");
      scene.classList.add("is-complete");
    } catch (error) {
      console.error(error);
      finishButton.disabled = false;
      finishButton.textContent = "Imagem indisponível";
    }
  });

  let audioContext;
  let musicOutput;
  let musicTimer;
  let musicStep = 0;
  let musicPlaying = false;
  const melody = [392, 329.63, 293.66, 261.63, 293.66, 329.63, 392, 329.63];
  const chords = [
    [196, 261.63, 329.63],
    [174.61, 220, 293.66],
    [146.83, 196, 261.63],
    [164.81, 220, 293.66]
  ];

  function playTone(frequency, startTime, duration, volume) {
    const oscillator = audioContext.createOscillator();
    const envelope = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, startTime);
    envelope.gain.setValueAtTime(0.0001, startTime);
    envelope.gain.exponentialRampToValueAtTime(volume, startTime + 0.55);
    envelope.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    oscillator.connect(envelope);
    envelope.connect(musicOutput);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.05);
  }

  function playMusicStep() {
    const startTime = audioContext.currentTime + 0.04;
    if (musicStep % 8 === 0) {
      const chord = chords[Math.floor(musicStep / 8) % chords.length];
      chord.forEach((frequency) => playTone(frequency, startTime, 10.8, 0.012));
    }

    playTone(melody[musicStep % melody.length], startTime, 2.4, 0.018);
    musicStep += 1;
  }

  async function toggleMusic() {
    if (!musicToggle || !musicLabel) {
      return;
    }

    try {
      if (musicPlaying) {
        window.clearInterval(musicTimer);
        await audioContext.suspend();
        musicPlaying = false;
        musicToggle.setAttribute("aria-pressed", "false");
        musicLabel.textContent = "Música: desligada";
        return;
      }

      const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextConstructor) {
        throw new Error("Este navegador não oferece suporte à reprodução de áudio.");
      }

      audioContext ??= new AudioContextConstructor();
      if (!musicOutput) {
        musicOutput = audioContext.createGain();
        musicOutput.gain.value = 0.7;
        musicOutput.connect(audioContext.destination);
      }

      await audioContext.resume();
      musicOutput.gain.cancelScheduledValues(audioContext.currentTime);
      musicOutput.gain.setTargetAtTime(0.24, audioContext.currentTime, 0.3);
      musicPlaying = true;
      musicToggle.setAttribute("aria-pressed", "true");
      musicLabel.textContent = "Música: ligada";
      playMusicStep();
      musicTimer = window.setInterval(playMusicStep, 1500);
    } catch (error) {
      console.error("Não foi possível reproduzir a música ambiente.", error);
      musicPlaying = false;
      window.clearInterval(musicTimer);
      musicToggle.setAttribute("aria-pressed", "false");
      musicLabel.textContent = "Som indisponível";
    }
  }

  musicToggle?.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleMusic();
  });

  if (!reducedMotion) {
    const fireflyColors = ["#ffe6aa", "#ffd1df", "#fff4cf"];
    for (let index = 0; index < 12; index += 1) {
      const firefly = document.createElement("span");
      firefly.className = "scene-firefly";
      firefly.style.setProperty("--x", `${(index * 37 + 13) % 96}%`);
      firefly.style.setProperty("--y", `${(index * 53 + 17) % 88}%`);
      firefly.style.setProperty("--size", `${index % 3 === 0 ? 4 : 3}px`);
      firefly.style.setProperty("--duration", `${5 + (index % 5)}s`);
      firefly.style.setProperty("--delay", `${-((index * 3) % 9)}s`);
      firefly.style.setProperty("--color", fireflyColors[index % fireflyColors.length]);
      sceneDetails.append(firefly);
    }
  }

  const panLimit = () => ({
    x: scene.clientWidth * 0.06,
    y: scene.clientHeight * 0.06
  });
  let panX = 0;
  let panY = 0;
  let pointerStart = null;
  let suppressClickUntil = 0;

  function setPan(x, y) {
    const limit = panLimit();
    panX = Math.max(-limit.x, Math.min(limit.x, x));
    panY = Math.max(-limit.y, Math.min(limit.y, y));
    scene.style.setProperty("--scene-pan-x", `${panX}px`);
    scene.style.setProperty("--scene-pan-y", `${panY}px`);
  }

  function createBlockBurst(x, y) {
    const colors = ["#fff0bd", "#f5a8bf", "#d99aad", "#fff"];
    for (let index = 0; index < 8; index += 1) {
      const pixel = document.createElement("span");
      const angle = (Math.PI * 2 * index) / 8;
      const distance = 18 + (index % 3) * 9;
      pixel.className = "scene-burst";
      pixel.style.setProperty("--x", `${x}px`);
      pixel.style.setProperty("--y", `${y}px`);
      pixel.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
      pixel.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
      pixel.style.setProperty("--color", colors[index % colors.length]);
      sceneDetails.append(pixel);
      pixel.addEventListener("animationend", () => pixel.remove(), { once: true });
    }
  }

  scene.addEventListener("pointerdown", (event) => {
    if (
      !event.isPrimary
      || (event.pointerType === "mouse" && event.button !== 0)
      || event.target.closest("button, a, input, textarea, select, [role='button']")
    ) {
      return;
    }

    const content = event.target.closest(
      ".love-declaration, .love-things, .reminder-things, .thanks-things, .final-letter"
    );
    pointerStart = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      panX,
      panY,
      content,
      scrollTop: content?.scrollTop ?? 0,
      moved: false
    };
    scene.setPointerCapture(event.pointerId);
  });

  scene.addEventListener("pointermove", (event) => {
    if (!pointerStart || event.pointerId !== pointerStart.id) {
      return;
    }

    const deltaX = event.clientX - pointerStart.x;
    const deltaY = event.clientY - pointerStart.y;
    if (!pointerStart.moved && Math.hypot(deltaX, deltaY) < 5) {
      return;
    }

    pointerStart.moved = true;
    if (pointerStart.content) {
      pointerStart.content.scrollTop = pointerStart.scrollTop - deltaY;
      return;
    }

    scene.classList.add("is-dragging");
    setPan(pointerStart.panX + deltaX, pointerStart.panY + deltaY);
  });

  scene.addEventListener("pointerup", (event) => {
    if (!pointerStart || event.pointerId !== pointerStart.id) {
      return;
    }

    const { content, moved } = pointerStart;
    pointerStart = null;
    scene.classList.remove("is-dragging");

    if (content) {
      suppressClickUntil = performance.now() + 250;
      return;
    }

    if (moved) {
      suppressClickUntil = performance.now() + 250;
      return;
    }
  });

  scene.addEventListener("click", (event) => {
    if (
      performance.now() < suppressClickUntil
      || event.target.closest(".love-declaration, .love-things, .reminder-things, .thanks-things, .final-letter")
    ) {
      return;
    }
    const bounds = scene.getBoundingClientRect();
    const normalizedX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const normalizedY = (event.clientY - bounds.top) / bounds.height - 0.5;
    const limit = panLimit();
    setPan(-normalizedX * limit.x * 2, -normalizedY * limit.y * 2);
    createBlockBurst(event.clientX - bounds.left, event.clientY - bounds.top);
  });

  scene.addEventListener("pointercancel", () => {
    pointerStart = null;
    scene.classList.remove("is-dragging");
  });

  scene.addEventListener("keydown", (event) => {
    const directions = {
      ArrowLeft: [-24, 0],
      ArrowRight: [24, 0],
      ArrowUp: [0, -24],
      ArrowDown: [0, 24]
    };
    const direction = directions[event.key];
    if (!direction) {
      return;
    }

    event.preventDefault();
    setPan(panX + direction[0], panY + direction[1]);
  });

  for (let index = 0; index < 10; index += 1) {
    const heart = document.createElement("img");
    heart.setAttribute("class", "heart");
    heart.setAttribute("aria-hidden", "true");
    heart.setAttribute("alt", "");
    heart.setAttribute("draggable", "false");
    heart.src = heartSprites.empty;
    heart.style.setProperty("--beat-delay", `${index * 75}ms`);
    hearts.append(heart);
  }

  if (!reducedMotion) {
    const particleField = document.querySelector(".panorama__particles");
    const colors = ["#c5c8ff", "#f29aaa", "#93aaff", "#e8d4ff"];
    for (let index = 0; index < 24; index += 1) {
      const particle = document.createElement("span");
      particle.className = "pixel-particle";
      particle.style.setProperty("--x", `${(index * 43 + 9) % 100}%`);
      particle.style.setProperty("--y", `${48 + ((index * 29) % 48)}%`);
      particle.style.setProperty("--size", `${index % 4 === 0 ? 5 : 3}px`);
      particle.style.setProperty("--duration", `${8 + (index % 6)}s`);
      particle.style.setProperty("--delay", `${-((index * 7) % 13)}s`);
      particle.style.setProperty("--color", colors[index % colors.length]);
      particleField.append(particle);
    }
  }

  function waitForImage(image, errorMessage) {
    if (image.complete) {
      if (image.naturalWidth === 0) {
        return Promise.reject(new Error(errorMessage));
      }
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      image.addEventListener("load", () => {
        if (image.naturalWidth === 0) {
          reject(new Error(errorMessage));
          return;
        }
        resolve();
      }, { once: true });
      image.addEventListener("error", () => {
        reject(new Error(errorMessage));
      }, { once: true });
    });
  }

  function waitForPageResources() {
    const pageReady = document.readyState === "complete"
      ? Promise.resolve()
      : new Promise((resolve) => window.addEventListener("load", resolve, { once: true }));
    const spritesReady = Promise.all(
      Object.values(heartSprites).map((src) => {
        const image = new Image();
        image.src = src;
        if (image.complete && image.naturalWidth > 0) {
          return Promise.resolve();
        }
        if (image.complete) {
          return Promise.reject(new Error(`O sprite de coração não pôde ser carregado: ${src}`));
        }
        return new Promise((resolve, reject) => {
          image.addEventListener("load", () => {
            if (image.naturalWidth === 0) {
              reject(new Error(`O sprite de coração não pôde ser carregado: ${src}`));
              return;
            }
            resolve();
          }, { once: true });
          image.addEventListener("error", () => {
            reject(new Error(`O sprite de coração não pôde ser carregado: ${src}`));
          }, { once: true });
        });
      })
    );

    return Promise.all([
      waitForImage(panorama, "O panorama da tela de carregamento não pôde ser carregado."),
      waitForImage(layoutBackground, "O fundo do layout Minecraft não pôde ser carregado."),
      spritesReady,
      document.fonts.ready,
      pageReady
    ]);
  }

  function dismiss() {
    heartTimers.forEach((timer) => window.clearTimeout(timer));

    title.textContent = "Bem-vinda ao nosso mundo, Victoria.";
    progress.classList.remove("is-loading");
    progress.classList.add("is-complete");
    progress.setAttribute("aria-valuenow", "100");
    progress.setAttribute("aria-valuetext", "Carregamento concluído");
    fill.style.width = "100%";
    hearts.querySelectorAll(".heart").forEach((heart) => {
      heart.src = heartSprites.full;
      heart.classList.add("is-complete");
    });

    window.setTimeout(() => {
      screen.classList.add("is-leaving");
      screen.dispatchEvent(new CustomEvent("loading-screen:complete", { bubbles: true }));
      window.setTimeout(() => {
        screen.remove();
        document.body.classList.remove("loading-active");
      }, fadeDuration);
    }, finalMessageDuration);
  }

  progress.classList.add("is-loading");
  hearts.querySelectorAll(".heart").forEach((heart, index) => {
    if (reducedMotion) {
      heart.src = heartSprites.full;
      return;
    }
    heartTimers.push(window.setTimeout(() => {
      heart.src = heartSprites.half;
    }, index * 570));
    heartTimers.push(window.setTimeout(() => {
      heart.src = heartSprites.full;
    }, index * 570 + 240));
  });

  waitForPageResources()
    .then(() => {
      const elapsed = performance.now() - loadingStartedAt;
      const remaining = Math.max(0, minimumLoadingDuration - elapsed - finalMessageDuration - fadeDuration);
      window.setTimeout(dismiss, remaining);
    })
    .catch((error) => {
      console.error(error);
      title.textContent = "Não foi possível preparar nosso mundo.";
      progress.classList.remove("is-loading");
      progress.setAttribute("aria-valuetext", "Falha ao carregar recursos");
    });
})();
