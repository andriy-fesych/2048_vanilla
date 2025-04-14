'use strict';

const confetti = {
  maxCount: 150,
  speed: 2,
  frameInterval: 15,
  alpha: 1,
  gradient: false,
  start: null,
  stop: null,
  toggle: null,
  pause: null,
  resume: null,
  togglePause: null,
  remove: null,
  isPaused: null,
  isRunning: null,
};

function setupConfetti() {
  let isRunning = false;
  let isPaused = false;
  let lastFrameTime = Date.now();
  const particles = [];
  let angle = 0;
  let context = null;

  const colors = [
    'rgba(30,144,255,',
    'rgba(107,142,35,',
    'rgba(255,215,0,',
    'rgba(255,192,203,',
    'rgba(106,90,205,',
    'rgba(173,216,230,',
    'rgba(238,130,238,',
    'rgba(152,251,152,',
    'rgba(70,130,180,',
    'rgba(244,164,96,',
    'rgba(210,105,30,',
    'rgba(220,20,60,',
  ];

  const requestAnimFrame = window.requestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.mozRequestAnimationFrame
    || window.oRequestAnimationFrame
    || window.msRequestAnimationFrame
    || function(callback) {
      return window.setTimeout(callback, confetti.frameInterval);
    };

  function createParticle(options, width, height) {
    const particle = options || {};

    particle.color = colors[Math.floor(Math.random() * colors.length)]
    + (confetti.alpha + ')');

    particle.color2 = colors[Math.floor(Math.random() * colors.length)]
    + (confetti.alpha + ')');
    particle.x = Math.random() * width;
    particle.y = Math.random() * height - height;
    particle.diameter = 10 * Math.random() + 5;
    particle.tilt = 10 * Math.random() - 10;
    particle.tiltAngleIncrement = 0.07 * Math.random() + 0.05;
    particle.tiltAngle = Math.random() * Math.PI;

    return particle;
  }

  function pauseConfetti() {
    isPaused = true;
  }

  function resumeConfetti() {
    isPaused = false;
    runAnimation();
  }

  function runAnimation() {
    if (isPaused) {
      return;
    }

    if (particles.length === 0) {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      return;
    }

    const currentTime = Date.now();
    const deltaTime = currentTime - lastFrameTime;

    if (deltaTime > confetti.frameInterval) {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      updateParticles();
      drawParticles(context);

      lastFrameTime = currentTime - (deltaTime % confetti.frameInterval);
    }

    requestAnimFrame(runAnimation);
  }

  function updateParticles() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    angle += 0.01;

    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];

      if (!isRunning && particle.y < -15) {
        particle.y = height + 100;
      } else {
        particle.tiltAngle += particle.tiltAngleIncrement;
        particle.x += Math.sin(angle) - 0.5;

        particle.y += 0.5 * (Math.cos(angle) + particle.diameter
        + confetti.speed);
        particle.tilt = 15 * Math.sin(particle.tiltAngle);
      }

      if (particle.x > width + 20 || particle.x < -20 || particle.y > height) {
        if (isRunning && particles.length <= confetti.maxCount) {
          createParticle(particle, width, height);
        } else {
          particles.splice(i, 1);
          i--;
        }
      }
    }
  }

  function drawParticles(content) {
    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];

      content.beginPath();
      content.lineWidth = particle.diameter;

      const x = particle.x + particle.tilt;
      const x2 = x + particle.diameter / 2;
      const y2 = particle.y + particle.tilt + particle.diameter / 2;

      if (confetti.gradient) {
        const gradient = content.createLinearGradient(x2, particle.y, x, y2);

        gradient.addColorStop('0', particle.color);
        gradient.addColorStop('1.0', particle.color2);
        content.strokeStyle = gradient;
      } else {
        content.strokeStyle = particle.color;
      }

      content.moveTo(x2, particle.y);
      content.lineTo(x, y2);
      content.stroke();
    }
  }

  function startConfetti(timeout, min, max) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Set up canvas if needed
    let canvas = document.getElementById('confetti-canvas');

    if (canvas === null) {
      canvas = document.createElement('canvas');
      canvas.setAttribute('id', 'confetti-canvas');

      canvas.setAttribute('style',
        'display:block;z-index:999999;pointer-events:none;position:fixed;top:0',
      );
      document.body.prepend(canvas);
      canvas.width = width;
      canvas.height = height;

      window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }, true);

      context = canvas.getContext('2d');
    } else if (context === null) {
      context = canvas.getContext('2d');
    }

    let count = confetti.maxCount;

    if (min) {
      if (max) {
        if (min === max) {
          count = particles.length + max;
        } else {
          if (min > max) {
            const temp = min;

            // eslint-disable-next-line no-param-reassign
            min = max;
            // eslint-disable-next-line no-param-reassign
            max = temp;
          }

          count = particles.length
            + Math.floor(Math.random() * (max - min) + min);
        }
      } else {
        count = particles.length + min;
      }
    } else if (max) {
      count = particles.length + max;
    }

    while (particles.length < count) {
      particles.push(createParticle({}, width, height));
    }

    isRunning = true;
    isPaused = false;
    runAnimation();

    if (timeout) {
      window.setTimeout(stopConfetti, timeout);
    }
  }

  function stopConfetti() {
    isRunning = false;
  }

  function removeConfetti() {
    stopConfetti();
    isPaused = false;
    particles.length = 0;
  }

  function toggleConfetti() {
    if (isRunning) {
      stopConfetti();
    } else {
      startConfetti();
    }
  }

  function togglePauseConfetti() {
    if (isPaused) {
      resumeConfetti();
    } else {
      pauseConfetti();
    }
  }

  function isConfettiPaused() {
    return isPaused;
  }

  function isConfettiRunning() {
    return isRunning;
  }

  // Assign methods to confetti object
  confetti.start = startConfetti;
  confetti.stop = stopConfetti;
  confetti.toggle = toggleConfetti;
  confetti.pause = pauseConfetti;
  confetti.resume = resumeConfetti;
  confetti.togglePause = togglePauseConfetti;
  confetti.isPaused = isConfettiPaused;
  confetti.remove = removeConfetti;
  confetti.isRunning = isConfettiRunning;
}

// Initialize and export
setupConfetti();

module.exports = { confetti };
