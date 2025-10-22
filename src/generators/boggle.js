const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DEFAULT_MAX_ATTEMPTS = 200;

const directionOffsets = {
  N: { x: 0, y: -1 },
  NE: { x: 1, y: -1 },
  E: { x: 1, y: 0 },
  SE: { x: 1, y: 1 },
  S: { x: 0, y: 1 },
  SW: { x: -1, y: 1 },
  W: { x: -1, y: 0 },
  NW: { x: -1, y: -1 },
};

const DEFAULT_DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

const toCoordinateKey = (x, y, cols) => y * cols + x;

const randomLetter = randomFn =>
  ALPHABET.charAt(Math.floor(randomFn() * ALPHABET.length));

const shuffleInPlace = (items, randomFn) => {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(randomFn() * (i + 1));
    const temp = items[i];
    items[i] = items[j];
    items[j] = temp;
  }
  return items;
};

const resolveOffsets = allowedDirections => {
  const directions = Array.isArray(allowedDirections) ? allowedDirections : [];
  const initial = directions
    .map(direction => directionOffsets[direction])
    .filter(Boolean);

  const seen = new Set();
  const symmetric = [];

  initial.forEach(offset => {
    const candidates = [offset, { x: -offset.x, y: -offset.y }];
    candidates.forEach(candidate => {
      const key = `${candidate.x},${candidate.y}`;
      if (candidate.x === 0 && candidate.y === 0) {
        return;
      }
      if (!seen.has(key)) {
        seen.add(key);
        symmetric.push(candidate);
      }
    });
  });

  if (symmetric.length === 0) {
    return DEFAULT_DIRECTIONS.map(direction => directionOffsets[direction]);
  }

  return symmetric;
};

const buildNeighborCache = (rows, cols, offsets) => {
  const cache = [];
  for (let y = 0; y < rows; y += 1) {
    cache[y] = [];
    for (let x = 0; x < cols; x += 1) {
      const neighbors = [];
      offsets.forEach(offset => {
        const nx = x + offset.x;
        const ny = y + offset.y;
        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
          neighbors.push({ x: nx, y: ny });
        }
      });
      cache[y][x] = neighbors;
    }
  }
  return cache;
};

const createBoard = (rows, cols) =>
  Array.from({ length: rows }, () => Array(cols).fill(null));

const searchFromCell = ({
  letterIndex,
  letters,
  x,
  y,
  board,
  cols,
  neighborCache,
  visited,
  path,
  random,
}) => {
  const key = toCoordinateKey(x, y, cols);
  if (visited.has(key)) {
    return false;
  }

  const targetLetter = letters[letterIndex];
  const existing = board[y][x];
  if (existing !== null && existing !== targetLetter) {
    return false;
  }

  const isNewLetter = existing === null;
  visited.add(key);
  path.push({ x, y, isNewLetter });

  if (isNewLetter) {
    board[y][x] = targetLetter;
  }

  if (letterIndex === letters.length - 1) {
    return true;
  }

  const neighbors = shuffleInPlace(neighborCache[y][x].slice(), random);

  for (let i = 0; i < neighbors.length; i += 1) {
    const next = neighbors[i];
    if (
      searchFromCell({
        letterIndex: letterIndex + 1,
        letters,
        x: next.x,
        y: next.y,
        board,
        cols,
        neighborCache,
        visited,
        path,
        random,
      })
    ) {
      return true;
    }
  }

  if (isNewLetter) {
    board[y][x] = null;
  }
  visited.delete(key);
  path.pop();
  return false;
};

const attemptPlaceWord = ({
  word,
  board,
  rows,
  cols,
  neighborCache,
  allCells,
  random,
  maxAttempts,
}) => {
  const letters = word.split('');

  if (letters.length === 0 || letters.length > rows * cols) {
    return null;
  }

  const mutableCells = allCells.slice();
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    shuffleInPlace(mutableCells, random);
    for (let i = 0; i < mutableCells.length; i += 1) {
      const start = mutableCells[i];
      const currentLetter = board[start.y][start.x];
      if (currentLetter !== null && currentLetter !== letters[0]) {
        continue;
      }

      const path = [];
      const visited = new Set();
      const found = searchFromCell({
        letterIndex: 0,
        letters,
        x: start.x,
        y: start.y,
        board,
        cols,
        neighborCache,
        visited,
        path,
        random,
      });

      if (found) {
        return path.map(step => ({ x: step.x, y: step.y }));
      }
    }
  }

  return null;
};

export function generateBoggle({
  rows,
  cols,
  dictionary,
  allowedDirections,
  random = Math.random,
  maxAttemptsPerWord = DEFAULT_MAX_ATTEMPTS,
}) {
  const normalizedRows = Math.max(1, Math.min(50, parseInt(rows, 10) || 1));
  const normalizedCols = Math.max(1, Math.min(50, parseInt(cols, 10) || 1));
  const offsets = resolveOffsets(allowedDirections);
  const board = createBoard(normalizedRows, normalizedCols);
  const neighborCache = buildNeighborCache(
    normalizedRows,
    normalizedCols,
    offsets
  );
  const allCells = [];
  for (let y = 0; y < normalizedRows; y += 1) {
    for (let x = 0; x < normalizedCols; x += 1) {
      allCells.push({ x, y });
    }
  }

  const sourceWords = Array.isArray(dictionary) ? dictionary : [];
  const normalizedWords = sourceWords.map(word =>
    typeof word === 'string' ? word.toUpperCase() : ''
  );

  const placedWords = [];

  normalizedWords.forEach((word, index) => {
    if (!word) {
      return;
    }

    const path = attemptPlaceWord({
      word,
      board,
      rows: normalizedRows,
      cols: normalizedCols,
      neighborCache,
      allCells,
      random,
      maxAttempts: maxAttemptsPerWord,
    });

    if (path) {
      placedWords.push({
        word,
        originalWord: sourceWords[index],
        path,
      });
    }
  });

  const filledGrid = board.map(row =>
    row.map(cell => cell || randomLetter(random))
  );

  return {
    grid: filledGrid,
    words: placedWords,
  };
}

export default generateBoggle;
