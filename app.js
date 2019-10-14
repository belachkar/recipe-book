const express = require('express'),
  { Client } = require('pg'),
  env = require('dotenv').config(),
  path = require('path'),
  cons = require('consolidate'),
  dust = require('dustjs-helpers');
  
const app = express();

if(env.error) throw env.error;
const srvPort = process.env.SRV_PORT;

// Assign Dust engine to .dust files.
app.engine('dust', cons.dust);

// Set default Ext .dust
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
      client.query('SELECT * FROM recipes', (err, result) => {
        if(err) return console.error(err.message);
        client.end();
        res.render('index', { recipes: result.rows });
      });
    }, onConnectionRejected)
    .catch(err => { throw err.message; });
  
});

function onConnectionRejected(err) {
  console.error(err.message);
}

// Server
app.listen(srvPort, () => console.log('Server started On port '+srvPort));
