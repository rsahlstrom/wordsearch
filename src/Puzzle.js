import React, { useState, useEffect } from 'react';
import WordSearch from '@blex41/word-search';
import './App.css';

function Puzzle({ rows, cols, words, directions, highlightWords }) {
  const [puzzle, setPuzzle] = useState(null);

  useEffect(() => {
    const possibleDirections = ['N', 'E', 'W', 'S', 'NE', 'NW', 'SE', 'SW'];
    let disabledDirections = possibleDirections.filter(
      direction => directions.indexOf(direction) === -1
    );

    const options = {
      cols: cols,
      rows: rows,
      dictionary: words,
      disabledDirections: disabledDirections,
      maxWords: words.length,
    };

    // Create a new puzzle
    setPuzzle(new WordSearch(options));
  }, [cols, rows, words, directions]);

  if (puzzle === null) {
    return null;
  }

  let puzzleWords = puzzle.words;
  let wordMatchClasses = 12;

  return (
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
                    classNames.push(`wordMatch${wordIndex % wordMatchClasses}`);
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
  );
}

Puzzle.defaultProps = {
  rows: 20,
  cols: 20,
  words: [],
  directions: ['N', 'E', 'W', 'S', 'NE', 'NW', 'SE', 'SW'],
  highlightWords: false,
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
