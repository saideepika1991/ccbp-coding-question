const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dataPath = path.join(__dirname, "todoApplication.db");
app.use(express.json());
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dataPath,
      driver: sqlite3.Database,
    });
    app.listen(4000, () =>
      console.log("Server Running at http://localhost:4000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const quertSelect = `select * from todo where id = ${todoId};`;
  const todo = await db.get(quertSelect);
  response.send(todo);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const querySelect = `insert into todo (id, todo, priority, status) values (${id}, '${todo}', '${priority}', '${status}');`;
  const queryStatus = await db.run(querySelect);
  response.send("Todo Successfully Added");
});

const getStatusUpdated = (query) => {
  return query.status !== undefined;
};

const getPriorityUpdated = (query) => {
  return query.priority !== undefined;
};

const getPriorityAndStatus = (query) => {
  return query.priority !== undefined && query.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  const { search_q, priority, status } = request.query;
  console.log("test" + request.query.priority);
  let data = null;
  let getTodosQuery = "";

  switch (true) {
    case getStatusUpdated(request.query):
      getTodosQuery = `select * from todo where todo like '%${search_q}%' and status = '${status}';`;
      break;
    case getPriorityUpdated(request.query):
      getTodosQuery = `select * from todo where todo like '%${search_q}%' and priority = '${priority}';`;
      break;
    case getPriorityAndStatus(request.query):
      getTodosQuery = `select * from todo where todo like '%${search_q}%' and priority = '${priority}' and status = '${status}';`;
      break;
    default:
      getTodosQuery = `select * from todo where todo like '%${search_q}%';`;
  }
  data = await db.all(getTodosQuery);
  response.send(data);
});

module.exports = app;
