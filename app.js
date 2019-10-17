const express = require('express'),
  { Client } = require('pg'),
  env = require('dotenv').config(),
  path = require('path'),
  cons = require('consolidate');
  // eslint-disable-next-line no-unused-vars
const dust = require('dustjs-linkedin');
  
const app = express();
let message = '';
let tmpFields = [];
let errors = [];

if(env.error) throw env.error;
const srvPort = process.env.SRV_PORT;

// Assign Dust engine to .dust files.
app.engine('dust', cons.dust);

// Set dust as default View engine
app.set('view engine', 'dust');
app.set('views', __dirname + '/views');

// Set public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Body parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.get('/', (req, res) => {  
  let client = new Client();
  client.on('error', (err) => console.error(err.message));
  
  client.connect()
    .then(() => {
      const query = 'SELECT * FROM recipes';

      client.query(query, (err, result) => {
        if(err) {
          errors.push({ error: 'Error: a connection problem, can not get recipes!' });
          console.error(err.message);
          client.end();
          return;
        }
        const data = { recipes: result.rows, message ,tmpFields, errors };
        message = '';
        errors = [];
        tmpFields = [];
        client.end();
        return res.render('index', data);
      });
    }, onConnectionRejected)
    .catch(err => { throw err.message; });
  
});

app.post('/add', (req, res) => {
  let { title, ingredients, directions } = req.body;
  title = title.trim();
  ingredients = ingredients.trim();
  directions = directions.trim();
  
  if(!title || !ingredients || !directions) {
    errors.push({ error: 'All the fields are required!' });
    tmpFields.push({ title, ingredients, directions });
    return res.redirect('/');
  }

  const values = [title, ingredients, directions];

  // Start connection to DB
  let client = new Client();
  client.on('error', (err) => console.error(err.message));
    
  client.connect()
    .then(() => {
      const query = 'INSERT INTO recipes (title, ingredients, directions) VALUES ($1, $2, $3)';

      client.query(query, values, (err, result) => {
        if(err) {
          errors.push({ error: 'Error: a connection problem, could not add the new recipe!' });
          tmpFields.push({ title, ingredients, directions });
          console.error(err.message);
          client.end();
          return res.redirect('/');
        }
        if(result.rowCount < 1) {
          errors.push('Adding new recipe operation failed!');
        } else {
          console.log(result.rowCount);
        }
        message = 'Recipe add';
        client.end();
        return res.redirect('/');
      });
    }, onConnectionRejected)
    .catch(err => { throw err.message; });  
});

app.delete('/delete/:id', (req, res) => {
  const id = req.params.id;
  
  if(!id) {
    console.log('DELETE: The ID is missing!');
    errors.push({ error: 'The ID of the recipe must be provided!' });
    return res.redirect('/');
  }

  const values = [id];

  // Start connection to DB
  let client = new Client();
  client.on('error', (err) => console.error(err.message));
    
  client.connect()
    .then(() => {
      const query = 'DELETE FROM recipes WHERE id = $1';

      client.query(query, values, (err, result) => {
        if(err) {
          errors.push({ error: 'Error: a connection problem, the recipe was not deleted!' });
          console.error(err.message);
          client.end();
          return res.redirect('/');
        }
        if(result.rowCount < 1) {
          errors.push('Delete operation failed!');
        } else {
          message = 'Recipe removed';
        }
        console.log(result.rowCount);
        client.end();
        return res.redirect('/');
      });
    }, onConnectionRejected)
    .catch(err => { throw err.message; });  
});

app.post('/edit', (req, res) => {
  let { id, title, ingredients, directions } = req.body;  
  id = id.trim();
  title = title.trim();
  ingredients = ingredients.trim();
  directions = directions.trim();
  
  if(!id) {
    console.log('UPDATE: The ID is missing!');
    errors.push({ error: 'The ID of the recipe is missing!' });
    return res.redirect('/');
  }
  
  if(!title || !ingredients || !directions) {
    console.log('UPDATE: A field value is missing!');
    errors.push({ error: 'All the fields are required!' });
    return res.redirect('/');
  }

  const values = [title, ingredients, directions, id];

  // Start connection to DB
  let client = new Client();
  client.on('error', (err) => console.error(err.message));
    
  client.connect()
    .then(() => {
      const query = 'UPDATE recipes SET title=$1, ingredients=$2, directions=$3 WHERE id = $4';

      client.query(query, values, (err, result) => {
        if(err) {
          errors.push({ error: 'Error: a connection problem, the recipe was not updated!' });
          console.error(err.message);
          client.end();
          return res.redirect('/');
        }
        if(result.rowCount < 1) {
          errors.push('Update operation failed!');
        } else {
          message = 'Recipe updated';
        }
        console.log(result.rowCount);
        client.end();
        return res.redirect('/');
      });
    }, onConnectionRejected)
    .catch(err => { throw err.message; });  
});

function onConnectionRejected(err) {
  console.error(err.message);
}

// Launch Server
app.listen(srvPort, () => console.log('Server started On port '+srvPort));
