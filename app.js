const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const creds = { username: 'admin', password: 'admin' };
let users = [];
let tokens = [];

const auth = (req, res, next) => {
  const {
    headers: { authorization }, 
  } = req;

  if (tokens.includes(authorization?.split(' ')?.[1])) {
    next();
  } else {
    res.status(403).send({
      message: 'Unauthenticated!',
    });
  }
};

app.get('/', function (req, res) {
  res.send("Hello world!");
});

app.post('/login', (req, res) => {
  const { body: { username, password } } = req;

  if (username === creds.username && password === creds.password) {
    const token = `${Math.random()}`;

    tokens.push(token);
    setTimeout(() => {
      tokens = tokens.filter((existingToken) => existingToken !== token);
    }, 600000);
    res.status(200).send({ token });
  }
  else {
    res.status(401).send({
      message: 'Invalid creds!',
    });
  }
});

app.get('/users/:id', auth, (req, res) => {
  const {
    params: { id },
  } = req;

  const user = users.find(({ id: userId }) => userId === id);

  if (user) {
    res.status(200).send({
      data: user,
    });
  } else {
    res.status(404).send({
      message: 'User not found!',
    });
  }
});

app.put('/users/:id', auth, (req, res) => {
  const {
    body: { user },
    params: { id },
  } = req;

  const index = users.findIndex(({ id: userId }) => userId === id);

  if(!user) {
    res.status(404).send({
      message: 'User is required!',
    });
  }

  if (index !== -1) {
    users[index] = {
      ...users[index],
      ...user,
    };

    console.info(user);

    res.status(200).send({
      message: 'User updated!',
    });
  } else {
    res.status(404).send({
      message: 'User not found!',
    });
  }
});

app.post('/users', auth, (req, res) => {
  const {
    body: { user },
  } = req;

  if (!user) {
    res.status(400).send({
      message: 'User is required!',
    });
  }

  const index = users.findIndex(({ id }) => id === user.id);
  
console.log(index)
  if (index !== -1) {
    res.status(409).send({
      message: 'Duplicate resource!',
    });
  } else {
    users.push(user);

    res.status(201).send({
      message: 'User created!',
    });
  }
});

app.get('/users', auth, (req, res) => {
  const { search } = req;

  res.status(200).send({
    data: {
      users: search
        ? users.filter(
            ({ id , title, text }) =>
              title.toLowerCase().includes(search.toLowerCase()) ||
              text.toLowerCase().includes(search.toLowerCase()) ||
              id.toLowerCase().includes(search.toLowerCase()) 
          )
        : users,
    },
  });
});

app.delete('/users/:id', auth, (req, res) => {
  const {
    params: { id },
  } = req;

  const index = users.findIndex(({ id: userId }) => userId === id);

  if (index !== -1) {
    users = users.filter(({ id: userId }) => userId !== id);

    res.status(200).send({
      message: 'User deleted!',
    });
  } else {
    res.status(404).send({
      message: 'User not found!',
    });
  }
});

app.listen(3000, () => {
  console.log(`Example app listening on port 3000`);
});
