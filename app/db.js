const { MongoClient } = require('mongodb');
const URI = 'mongodb://mongohost';
const DB_NAME = 'portale_aste';
let cachedDB;

module.exports = {
  connect2db: async () => {
    if (cachedDB) {
      console.log("Recupero connessione esistente");
      return cachedDB;
    }
    try {
      console.log("Creazione nuova connessione");
      const client = await MongoClient.connect(URI);
      cachedDB = client.db(DB_NAME);
      return cachedDB;
    } catch(err) {
      console.error('Errore di connessione');
      return null;
    }    
  }
};