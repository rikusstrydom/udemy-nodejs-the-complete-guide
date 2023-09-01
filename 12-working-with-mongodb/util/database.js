const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = 'mongodb+srv://rikusstrydom:@cluster0.u1xpiz9.mongodb.net/?retryWrites=true&w=majority';

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let _db;

const mongoConnect = () => {
  return client
    .connect()
    .then((client) => {
      console.log('db connected!');
      _db = client.db('shop');
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw 'No database found';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
