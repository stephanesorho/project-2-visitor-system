import express from "express";

import myDB from "../db/MyMongoDB.js";

import { ObjectId } from "mongodb";

const router = express.Router();

router.get("/getVisitors", async (req, res) => {
  try {
    const result = await myDB.fetchVisitors();
    res.status(200).json({ result });
  } catch (err) {
    console.error("# Get Error", err);
    res.status(500).send({ error: err.name + ", " + err.message });
  }
});

router.post("/login", async (req, res) => {
  const user = req.body;

  //Check that we got the correct info using database
  if (await myDB.authenticate(user)) {
    req.session.user = user.user;

    res.redirect("/system.html");
  } else {
    req.session.user = null;
    res.redirect("/?msg=wrong user name or password");
  }
});

// Add visitor
router.post("/addVisitors", async (req, res) => {
  let visitor = req.body;

  try {
    await myDB.addVisitor(visitor);
    res.json(visitor);
  } catch (err) {
    console.error("# Post Error", err);
    // It's recommended to not directly pass the raw error to front-end as it may expose backend information,
    // instead write a custom error message like "It failed!"
    res.status(500).send({ error: err.name + ", " + err.message });
  }
});

// delete visitor
router.delete("/deleteVisitor/:id", async (req, res) => {
  let id = req.params.id;

  if (id && ObjectId.isValid(id)) {
    try {
      await myDB.deleteVisitor(id);
    } catch (err) {
      console.error("# Delete Error", err);
      res.status(500).send({ error: err.name + ", " + err.message });
      return;
    }
  } else {
    res = { message: "Data not deleted; the id to delete is not valid!" };
  }

  res.json();
});

export default router;
