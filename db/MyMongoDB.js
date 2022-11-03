import { MongoClient, ObjectId } from "mongodb";
// DB
// Good use of async await.
// Good to have all database logic here so that rest of the code don't need to deal with it.
function MyMongoDB() {
  const myDB = {};
  // const url = process.env.MONGO_URL || "mongodb://localhost:27017";
  //Using mongodb cloud
  // I would recommend using environment variables to store the username and password.
  const url =
    "mongodb+srv://stephane:Mongopass123@cluster0.jicxbfs.mongodb.net/?retryWrites=true&w=majority";
  const DB_NAME = "visitorSystem";
  const COLLECTION_LOGIN = "users";
  const COLLECTION_VISIT = "visitors";

  // Get all visitors
  myDB.fetchVisitors = async () => {
    // I think it's better to use a single client instance for all your functions instead of creating one
    // for each function. Same for the collections: you only need one instance for each collection.
    const client = new MongoClient(url);

    const db = client.db(DB_NAME);
    const visitCol = db.collection(COLLECTION_VISIT);

    const res = await visitCol.find().toArray();
    console.log("res", res);
    return res;
  };

  // Verify log in for user
  myDB.authenticate = async (user) => {
    const client = new MongoClient(url);

    const db = client.db(DB_NAME);
    const usersCol = db.collection(COLLECTION_LOGIN);
    //console.log("searching for", user);
    const res = await usersCol.findOne({ user: user.user });

    // Can't find user in db
    // this can be replaced with "if (!res)"
    if (res == null || res == undefined) {
      return false;
    }

    //console.log("res", res, res.password == user.password);
    // better to use === according to intellij (and eslint I guess)
    if (res.password == user.password) return true;
    return false;
  };

  // add visitor to DB
  myDB.addVisitor = async (visitor) => {
    const client = new MongoClient(url);

    const db = client.db(DB_NAME);
    const visitCol = db.collection(COLLECTION_VISIT);

    let res = await visitCol.insertOne(visitor);

    console.log("Adding result: ", res);
  };

  //delete visitor from DB by id
  myDB.deleteVisitor = async (id) => {
    let filter = { _id: new ObjectId(id) };

    const client = new MongoClient(url);

    const db = client.db(DB_NAME);
    let visitCol = db.collection(COLLECTION_VISIT);

    let res = await visitCol.deleteOne(filter);
    console.log("Delete result: ", res);
  };

  return myDB;
}

export default MyMongoDB();
