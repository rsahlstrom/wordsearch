import React, { useReducer } from 'react';
import Puzzle from './Puzzle';
import './App.css';

const initialState = {
  rows: 15,
  cols: 20,
  words: '',
  wordsArray: [],
  directions: ['N', 'E', 'W', 'S', 'NE', 'NW', 'SE', 'SW'],
  showSolution: true,
};

function reducer(state, action) {
  if (action.type === 'setRows') {
    return { ...state, rows: action.value };
  } else if (action.type === 'setCols') {
    return { ...state, cols: action.value };
  } else if (action.type === 'setShowSolution') {
    return { ...state, showSolution: action.value };
  } else if (action.type === 'toggleDirection') {
    let directions = [...state.directions];
    let directionIndex = directions.indexOf(action.direction);
    if (action.value && directionIndex === -1) {
      directions.push(action.direction);
    } else if (action.value === false && directionIndex !== -1) {
      directions.splice(directionIndex, 1);
    }
    return { ...state, directions: directions };
  } else if (action.type === 'setWords') {
    return {
      ...state,
      words: action.value,
      wordsArray: action.value
        .split(/,|;|\r?\n/)
        .map(word => word.replace(/\W+/g, ''))
        .filter(word => word.length > 0),
    };
  }
  return state;
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      <form>
        <p>
          <label>
            Rows:{' '}
            <input
              type="number"
              value={state.rows}
              style={{ width: '40px' }}
              onChange={e => {
                dispatch({ type: 'setRows', value: e.target.value });
              }}
            />
          </label>
        </p>
        <p>
          <label>
            Columns:{' '}
            <input
              type="number"
              value={state.cols}
              style={{ width: '40px' }}
              onChange={e => {
                dispatch({ type: 'setCols', value: e.target.value });
              }}
            />
          </label>
        </p>
        <p>
          Directions:
          <br />
          {['NW', 'N', 'NE', 'W', '', 'E', 'SW', 'S', 'SE'].map(
            (direction, index) => {
              if (direction === '') {
                return (
                  <input
                    type="checkbox"
                    key="directionCenter"
                    style={{ visibility: 'hidden' }}
                  />
                );
              }

              return (
                <React.Fragment key={`direction${direction}`}>
                  <input
                    type="checkbox"
                    checked={state.directions.indexOf(direction) !== -1}
                    onChange={e =>
                      dispatch({
                        type: 'toggleDirection',
                        direction: direction,
                        value: e.target.checked,
                      })
                    }
                  />
                  {index % 3 === 2 ? <br /> : null}
                </React.Fragment>
              );
            }
          )}
        </p>
        <p>
          <label>
            Words (Seperate with comma, semicolon, or a new line)
            <br />
            <textarea
              rows="10"
              cols="30"
              onChange={e => {
                dispatch({ type: 'setWords', value: e.target.value });
              }}
              value={state.words}
            />
          </label>
        </p>
        <p>
          <label>
            <input
              type="checkbox"
              checked={state.showSolution}
              onChange={e =>
                dispatch({
                  type: 'setShowSolution',
                  value: e.target.checked,
                })
              }
            />{' '}
            Show solution
          </label>
        </p>
      </form>
      <Puzzle
        rows={state.rows}
        cols={state.cols}
        words={state.wordsArray}
        directions={state.directions}
        highlightWords={state.showSolution}
      />
    </div>
  );
}

export default App;
