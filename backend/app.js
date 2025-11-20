const path = require('path');
const { exec } = require('child_process');


const sqlFilePath = path.join(__dirname, 'ecommerce.sql');

async function populateDb() {
    try {
      const command = `psql -U postgres -f "${sqlFilePath}"`;
      const { stdout, stderr } = await execPromise(command);
  
      if (stderr) throw new Error(`stderr: ${stderr}`);
      
      console.log(`stdout: ${stdout}`);
      require('./populate');; // Pobla los datos de las tablas.
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }
  }
  
  // Helper function to promisify exec
  function execPromise(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(`exec error: ${error}`);
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  }

  
  //Puebla la base de datos con datos iniciales.
    populateDb()

  //Invoca el script con los endpoits de expressJS.
    require('./endpoints');