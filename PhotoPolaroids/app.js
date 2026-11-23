const fileInput = document.querySelector('#fileInput');
const dropZone = document.querySelector('#dropZone');
const selectionList = document.querySelector('#selectionList');
const photoCount = document.querySelector('#photoCount');
const previewGrid = document.querySelector('#previewGrid');
const canvasPlaceholder = document.querySelector('#canvasPlaceholder');
const resetButton = document.querySelector('#resetButton');
const importStatus = document.querySelector('#importStatus');
const exportButton = document.querySelector('#exportButton');
const readyText = document.querySelector('#readyText');
const readyIcon = document.querySelector('#readyIcon');
let activeDrag = null;

const photos = [];
const printWidth = 2400;
const printHeight = 1600;
const frameWidth = printWidth / 2;
const frameHeight = printHeight;
const photoSize = 1100;
const frameX = 0;
const frameY = 0;
const photoInset = 50;

function addFiles(fileList) {
  const candidates = [...fileList].filter(isImageFile);
  candidates.forEach(file => {
    const image = new Image();
    const photo = { file, image, x: 50, y: 50, zoom: 1, loaded: false, failed: false };
    photos.push(photo);
    image.onload = () => {
      photo.loaded = true;
      render();
    };
    image.onerror = () => {
      photo.failed = true;
      if (/\.(heic|heif)$/i.test(file.name)) {
        importStatus.textContent = 'This browser cannot decode HEIC/HEIF here. Convert it to JPEG or PNG, then add it again.';
      }
      render();
    };
    image.src = URL.createObjectURL(file);
  });
  if (candidates.length < fileList.length) {
    importStatus.textContent = 'Some dropped files were skipped because they are not images.';
  }
}

function isImageFile(file) {
  return file.type.startsWith('image/') || /\.(heic|heif|jpg|jpeg|png|webp|gif|avif)$/i.test(file.name);
}

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function cropSource(photo) {
  const { image, x, y } = photo;
  const sourceSize = Math.min(image.naturalWidth, image.naturalHeight) / photo.zoom;
  const maxX = image.naturalWidth - sourceSize;
  const maxY = image.naturalHeight - sourceSize;
  return {
    sourceX: maxX * (x / 100),
    sourceY: maxY * (y / 100),
    sourceSize
  };
}

function drawPhoto(photo, destinationX, destinationY, destinationSize) {
  const crop = cropSource(photo);
  photo.context.drawImage(photo.image, crop.sourceX, crop.sourceY, crop.sourceSize, crop.sourceSize, destinationX, destinationY, destinationSize, destinationSize);
}

function drawPolaroid(photo, context, x) {
  photo.context = context;
  context.fillStyle = '#ffffff';
  context.fillRect(x, frameY, frameWidth, frameHeight);
  drawPhoto(photo, x + photoInset, frameY + photoInset, photoSize);
}

function drawFrameDivider(context) {
  context.save();
  context.strokeStyle = '#d7dde1';
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(frameWidth, 0);
  context.lineTo(frameWidth, printHeight);
  context.stroke();
  context.restore();
}

function renderSelectionList() {
  if (!photos.length) {
    selectionList.innerHTML = '<div class="empty-state">Your selected photos<br>will appear here in pairs.</div>';
    return;
  }

  selectionList.innerHTML = photos.map((photo, index) => `
    <div class="selection-item">
      <img class="selection-thumb" src="${photo.image.src}" alt="Photo ${index + 1}">
      <div>
        <div class="selection-size">${photo.failed ? 'Could not read image' : photo.loaded ? `${formatSize(photo.file.size)} · ${index % 2 === 0 ? `pair ${Math.floor(index / 2) + 1}` : 'paired'}` : 'Reading image…'}</div>
      </div>
      <button class="remove-button" type="button" data-remove="${index}" aria-label="Remove photo ${index + 1}">×</button>
    </div>
  `).join('');
}

function getPairs() {
  const pairs = [];
  const readyPhotos = photos.filter(photo => photo.loaded && !photo.failed);
  for (let index = 0; index + 1 < readyPhotos.length; index += 2) {
    pairs.push([readyPhotos[index], readyPhotos[index + 1]]);
  }
  return pairs;
}

function drawPair(pair, canvas) {
  const context = canvas.getContext('2d', { alpha: false });
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, printWidth, printHeight);
  drawPolaroid(pair[0], context, frameX);
  drawPolaroid(pair[1], context, frameWidth);
  drawFrameDivider(context);
}

function renderPreviews() {
  const pairs = getPairs();
  previewGrid.innerHTML = pairs.map((pair, pairIndex) => `
    <article class="pair-preview" data-pair="${pairIndex}">
      <div class="pair-label"><span>Pair ${String(pairIndex + 1).padStart(2, '0')}</span><span>4 × 6 in</span></div>
      <canvas class="pair-canvas" width="2400" height="1600" data-pair-canvas="${pairIndex}"></canvas>
      <div class="preview-controls">
        ${pair.map((photo, photoIndex) => `<label class="preview-control"><span><b>${String(photoIndex + 1).padStart(2, '0')}</b> Zoom</span><input type="range" min="1" max="2.5" step="0.01" value="${photo.zoom}" data-preview-zoom="${photoIndex}" aria-label="Zoom pair ${pairIndex + 1} photo ${photoIndex + 1}"></label>`).join('')}
      </div>
    </article>
  `).join('');
  pairs.forEach((pair, pairIndex) => drawPair(pair, previewGrid.querySelector(`[data-pair-canvas="${pairIndex}"]`)));
  canvasPlaceholder.hidden = pairs.length > 0;
}

function render() {
  const pairCount = getPairs().length;
  photoCount.textContent = `${photos.length} photo${photos.length === 1 ? '' : 's'}`;
  resetButton.disabled = photos.length === 0;
  renderSelectionList();
  renderPreviews();
  const isReady = pairCount > 0;
  exportButton.disabled = !isReady;
  readyIcon.classList.toggle('is-ready', isReady);
  readyIcon.textContent = isReady ? '✓' : '×';
  readyText.textContent = isReady ? `${pairCount} print${pairCount === 1 ? '' : 's'} ready to export` : 'Choose at least two photos to enable export';
}

fileInput.addEventListener('change', event => {
  addFiles(event.target.files);
  event.target.value = '';
});
dropZone.addEventListener('dragover', event => {
  event.preventDefault();
  dropZone.classList.add('is-dragging');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('is-dragging'));
dropZone.addEventListener('drop', event => {
  event.preventDefault();
  dropZone.classList.remove('is-dragging');
  addFiles(event.dataTransfer.files);
});

selectionList.addEventListener('click', event => {
  const removeButton = event.target.closest('[data-remove]');
  if (!removeButton) return;
  const index = Number(removeButton.dataset.remove);
  URL.revokeObjectURL(photos[index].image.src);
  photos.splice(index, 1);
  render();
});

resetButton.addEventListener('click', () => {
  photos.forEach(photo => URL.revokeObjectURL(photo.image.src));
  photos.length = 0;
  fileInput.value = '';
  importStatus.textContent = '';
  render();
});

previewGrid.addEventListener('input', event => {
  const control = event.target.closest('[data-preview-zoom]');
  if (!control) return;
  const pairIndex = Number(control.closest('[data-pair]').dataset.pair);
  const photoIndex = Number(control.dataset.previewZoom);
  const photo = getPairs()[pairIndex]?.[photoIndex];
  if (!photo) return;
  photo.zoom = Number(control.value);
  drawPair(getPairs()[pairIndex], control.closest('.pair-preview').querySelector('canvas'));
});

previewGrid.addEventListener('pointerdown', event => {
  const canvas = event.target.closest('.pair-canvas');
  if (!canvas) return;
  const pairIndex = Number(canvas.closest('[data-pair]').dataset.pair);
  const bounds = canvas.getBoundingClientRect();
  const previewX = event.clientX - bounds.left;
  activeDrag = {
    pairIndex,
    photoIndex: previewX < bounds.width / 2 ? 0 : 1,
    canvas,
    clientX: event.clientX,
    clientY: event.clientY
  };
  canvas.setPointerCapture(event.pointerId);
  canvas.classList.add('is-dragging');
});

previewGrid.addEventListener('pointermove', event => {
  if (!activeDrag) return;
  const bounds = activeDrag.canvas.getBoundingClientRect();
  const photo = getPairs()[activeDrag.pairIndex][activeDrag.photoIndex];
  photo.x = Math.max(0, Math.min(100, photo.x + ((event.clientX - activeDrag.clientX) / (bounds.width / 2)) * 100));
  photo.y = Math.max(0, Math.min(100, photo.y + ((event.clientY - activeDrag.clientY) / bounds.height) * 100));
  activeDrag.clientX = event.clientX;
  activeDrag.clientY = event.clientY;
  drawPair(getPairs()[activeDrag.pairIndex], activeDrag.canvas);
});

function endDrag() {
  const canvas = activeDrag?.canvas;
  activeDrag = null;
  canvas?.classList.remove('is-dragging');
}

previewGrid.addEventListener('pointerup', endDrag);
previewGrid.addEventListener('pointercancel', endDrag);

exportButton.addEventListener('click', () => {
  getPairs().forEach((pair, pairIndex) => {
    const canvas = previewGrid.querySelector(`[data-pair-canvas="${pairIndex}"]`);
    const link = document.createElement('a');
    link.download = `pair-print-${String(pairIndex + 1).padStart(2, '0')}-${new Date().toISOString().slice(0, 10)}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.96);
    link.click();
  });
});

render();
