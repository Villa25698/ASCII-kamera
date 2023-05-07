const canvas = document.getElementById('ascii-cam');
const ctx = canvas.getContext('2d');

// Set canvas dimensjonen til å fylle hele skjermen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// sette opp kamraet
navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } })
  .then(stream => {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();
    setInterval(() => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const asciiData = processImageData(imageData);
      drawAsciiData(asciiData);
    }, 1000 / 30);
  });

function processImageData(imageData) {
  const asciiData = [];
  for (let y = 0; y < imageData.height; y += 20) {
    const row = [];
    for (let x = 0; x < imageData.width; x += 12) {
      const i = (y * imageData.width + x) * 4;
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const luma = Math.floor(0.299 * r + 0.587 * g + 0.114 * b);
      const char = getAsciiChar(luma);
      row.push(char);
    }
    asciiData.push(row);
  }
  return asciiData;
}

function getAsciiChar(luma) {
  const chars = [' ', '.', ':', '-', '=', '+', '*', '#', '%', '@'];
  const charIndex = Math.floor(luma / (256 / chars.length));
  return chars[charIndex];
}

function drawAsciiData(asciiData) {
  const charSize = 20;
  ctx.fillStyle = '#000000'; // Sett backgrunn fargen til svart
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${charSize}px monospace`;
  ctx.fillStyle = '#ffffff'; // sett fargen til hvit
  for (let y = 0; y < asciiData.length; y++) {
    for (let x = 0; x < asciiData[y].length; x++) {
      const char = asciiData[y][x];
      const charX = x * charSize;
      const charY = y * charSize;
      if (char !== ' ') { // Bare tegn ikke-mellomromstegn i hvitt
        ctx.fillText(char, charX, charY + charSize);
      }
    }
  }
}

// Oppdater canvas dimensjoner når vinduet endres størrelse
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Tøm canvas og tegn opp ASCII-dataene på nytt etter størrelsesendring
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const asciiData = processImageData(imageData);
  drawAsciiData(asciiData);
});
