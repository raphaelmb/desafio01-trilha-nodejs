const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user) {
    return response.status(404).json({ error: "Username not found." });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  users.forEach(user => {
    if(user.username === username) {
      return response.status(400).json({ error: "Username already exists." });
    }
  });

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.send(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todos = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todos);

  return response.status(201).json(todos);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;
  
  const todos = user.todos.find(todo => todo.id === id);

  if(!todos) {
    return response.status(404).json({ error: "No todo matched the provided id" })
  }

  todos.title = title;
  todos.deadline = new Date(deadline);

  return response.json(todos);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  
  const todos = user.todos.find(todo => todo.id === id);

  if(!todos) {
    return response.status(404).json({ error: "No todo matched the provided id" });
  }

  todos.done = true;

  return response.json(todos);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const index = user.todos.findIndex(todo => todo.id === id);

  if(index === -1) {
    return response.status(404).json({ error: "No todo matched the provided id" });
  }

  user.todos.splice(index, 1);

  return response.status(204).json();

});

module.exports = app;