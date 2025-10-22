import React, { useState, useEffect } from 'react';
import WordSearch from '@blex41/word-search';
import { generateBoggle } from './generators/boggle';
import './App.css';

const clampDimension = value => {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return 1;
  }
  if (parsed < 1) {
    return 1;
  }
  if (parsed > 50) {
    return 50;
  }
  return parsed;
};

function Puzzle({
  rows,
  cols,
  words,
  directions,
  highlightWords,
  placementMode,
}) {
  const [puzzle, setPuzzle] = useState(null);

  useEffect(() => {
    const possibleDirections = ['N', 'E', 'W', 'S', 'NE', 'NW', 'SE', 'SW'];
    let disabledDirections = possibleDirections.filter(
      direction => directions.indexOf(direction) === -1
    );

    const normalizedCols = clampDimension(cols);
    const normalizedRows = clampDimension(rows);

    if (placementMode === 'boggle') {
      setPuzzle(
        generateBoggle({
          cols: normalizedCols,
          rows: normalizedRows,
          dictionary: words,
          allowedDirections: directions,
        })
      );
      return;
    }

    const options = {
      cols: normalizedCols,
      rows: normalizedRows,
      dictionary: words,
      disabledDirections: disabledDirections,
      maxWords: words.length,
    };

    // Create a new puzzle
    setPuzzle(new WordSearch(options));
  }, [cols, rows, words, directions, placementMode]);

  if (puzzle === null) {
    return null;
  }

  let puzzleWords = puzzle.words;
  let wordMatchClasses = 12;

  return (
    <>
      {puzzleWords.length !== words.length ? (
        <div className="status status--warning">
          ⚠ Only {puzzleWords.length} out of the {words.length} words could fit
          in the puzzle!
        </div>
      ) : null}
      <table className="wordSearch" id="puzzle">
        <tbody>
          {puzzle.grid.map((row, rowIndex) => {
            return (
              <tr key={`row${rowIndex}`}>
                {row.map((letter, colIndex) => {
                  let classNames = ['wordSearch__cell'];
                  if (highlightWords) {
                    let wordIndex = cellInWord(rowIndex, colIndex, puzzleWords);
                    if (wordIndex !== false) {
                      classNames.push(
                        `wordMatch${wordIndex % wordMatchClasses}`
                      );
                    }
                  }
                  return (
                    <td
                      className={classNames.join(' ')}
                      key={`col${rowIndex}.${colIndex}`}
                    >
                      {letter}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

Puzzle.defaultProps = {
  rows: 20,
  cols: 20,
  words: [],
  directions: ['N', 'E', 'W', 'S', 'NE', 'NW', 'SE', 'SW'],
  highlightWords: false,
  placementMode: 'classic',
};

function cellInWord(rowIndex, colIndex, words) {
  let found = false;
  words.forEach(word => {
    word.path.forEach(path => {
      if (path.x === colIndex && path.y === rowIndex) {
        found = word;
      }
    });
  });
  if (found) {
    return words.indexOf(found);
  }
  return false;
}

export default Puzzle;
