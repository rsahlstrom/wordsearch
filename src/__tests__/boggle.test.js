import { generateBoggle } from '../generators/boggle';

const constantRandom = value => () => value;

const isPathAdjacent = path =>
  path.every((step, index) => {
    if (index === 0) {
      return true;
    }
    const prev = path[index - 1];
    const deltaX = Math.abs(step.x - prev.x);
    const deltaY = Math.abs(step.y - prev.y);

    return deltaX <= 1 && deltaY <= 1 && !(deltaX === 0 && deltaY === 0);
  });

describe('generateBoggle', () => {
  it('places words using adjacent cells only', () => {
    const puzzle = generateBoggle({
      rows: 3,
      cols: 3,
      dictionary: ['cat'],
      random: constantRandom(0.25),
    });
    const placed = puzzle.words.find(word => word.word === 'CAT');

    expect(placed).toBeDefined();
    expect(placed.path).toHaveLength(3);
    expect(isPathAdjacent(placed.path)).toBe(true);
  });

  it('honors allowed directions by excluding diagonals when disabled', () => {
    const puzzle = generateBoggle({
      rows: 4,
      cols: 4,
      dictionary: ['cross'],
      allowedDirections: ['N', 'S', 'E', 'W'],
      random: constantRandom(0.2),
    });
    const placed = puzzle.words.find(word => word.word === 'CROSS');

    expect(placed).toBeDefined();
    const hasDiagonalStep = placed.path.some((step, index) => {
      if (index === 0) {
        return false;
      }
      const prev = placed.path[index - 1];
      const deltaX = Math.abs(step.x - prev.x);
      const deltaY = Math.abs(step.y - prev.y);
      return deltaX === 1 && deltaY === 1;
    });
    expect(hasDiagonalStep).toBe(false);
  });

  it('does not reuse cells within a single word path', () => {
    const puzzle = generateBoggle({
      rows: 4,
      cols: 4,
      dictionary: ['puzzle'],
      random: constantRandom(0.5),
    });
    const placed = puzzle.words.find(word => word.word === 'PUZZLE');

    expect(placed).toBeDefined();
    const keys = new Set(placed.path.map(step => `${step.x},${step.y}`));
    expect(keys.size).toBe(placed.path.length);
  });

  it('returns fewer words when a word cannot fit on the board', () => {
    const puzzle = generateBoggle({
      rows: 2,
      cols: 2,
      dictionary: ['abcde'],
      random: constantRandom(0),
    });

    expect(puzzle.words).toHaveLength(0);
    expect(puzzle.grid.length).toBe(2);
    expect(puzzle.grid[0].length).toBe(2);
  });
});
