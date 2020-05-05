const { nanoid } = require('nanoid');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const mkdirp = require('mkdirp');

const storage = process.env.HOME + '/.rmnd-r';

mkdirp(storage);

const adapter = new FileSync(storage + '/todos.json');
const todos = low(adapter);

let handlers = {};

todos.defaults({ data: [] }).write();

handlers['get-todo'] = async () => {
  try {
    const data = todos.get('data').value();
    return {
      data: data,
    };
  } catch (err) {
    return { error: err };
  }
};

handlers['add-todo'] = async ({ todo }) => {
  try {
    const id = nanoid();
    const payload = {
      id,
      text: todo.text,
      marked: false,
    };
    todos.get('data').push(payload).write();
    return { success: 'Added' };
  } catch (err) {
    console.log(err);
    return { error: err };
  }
};

handlers['mark-todo'] = async ({ todo }) => {
  try {
    const withMarkedModifications = todos
      .get('data')
      .map((item) => {
        if (item.id == todo.id) {
          item.marked = !item.marked;
        }
        return item;
      })
      .value();
    todos.set('data', withMarkedModifications).write();
    return { success: 'Marked' };
  } catch (err) {
    return { error: err };
  }
};

handlers['delete-todo'] = async ({ todo }) => {
  try {
    const deletedTodos = todos
      .get('data')
      .filter((item) => {
        return item.id !== todo.id;
      })
      .value();
    todos.set('data', deletedTodos).write();
    return { success: 'Deleted' };
  } catch (err) {
    return { error: err };
  }
};

module.exports = handlers;
