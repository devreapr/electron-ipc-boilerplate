import React, { useState, useEffect } from 'react';
import './App.css';
import { send } from './ipc';

function App() {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    getTasks();
  }, []);

  const getTasks = async () => {
    try {
      const { error, data } = await send('get-todo', {});
      if (error) {
        throw error;
      }

      setTasks(data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleInput = (e) => {
    if (e.keyCode !== 13) {
      setInputValue(e.target.value);
    } else {
      addTask({
        text: inputValue,
      });
      setInputValue('');
    }
  };

  const addTask = async (task) => {
    try {
      const { error } = await send('add-todo', {
        todo: { text: task.text },
      });

      if (error) throw error;

      setInputValue('');
      getTasks();
    } catch (err) {
      console.log(err);
    }
  };

  const markTask = async (task) => {
    try {
      const { error } = await send('mark-todo', {
        todo: { id: task.id },
      });

      if (error) throw error;

      getTasks();
    } catch (err) {
      console.log(err);
    }
  };

  const deleteTask = async (task) => {
    try {
      const { error } = await send('delete-todo', {
        todo: { id: task.id },
      });

      if (error) throw error;

      getTasks();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="App">
      <input
        type="text"
        onKeyUp={(e) => handleInput(e)}
        onChange={(e) => handleInput(e)}
        value={inputValue}
      />
      <div>
        <ul>
          {tasks.map((taskItem) => (
            <React.Fragment key={taskItem.id}>
              <li onClick={() => markTask(taskItem)}>
                {taskItem.marked ? (
                  <strike>taskItem.text</strike>
                ) : (
                  taskItem.text
                )}
              </li>
              <div>
                <button onClick={() => deleteTask(taskItem)}>Delete</button>
              </div>
            </React.Fragment>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
