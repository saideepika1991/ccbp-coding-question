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
  const { search_q = "", priority, status } = request.query;
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

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const queriesSelect = `select * from todo where id = ${todoId};`;
  const todo = await db.get(queriesSelect);
  response.send(todo);
});

app.post("/todos/", async (request, response) => {
  const requestBody = request.body;
  const { id, todo, priority, status } = request.body;
  const postTodoQuery = `
  INSERT INTO
    todo (id, todo, priority, status)
  VALUES
    (${id}, '${todo}', '${priority}', '${status}');`;
  const postTodo = await db.run(postTodoQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const requestBody = request.body;
  let updateColumn = "";
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
  }

  const { todo, priority, status } = requestBody;

  const postQuery = `update todo set todo = '${todo}',
  priority = '${priority}', status = '${status}'
  where id = ${todoId};`;
  await db.run(postQuery);
  response.send(`${updateColumn} Updated`);
});

app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `delete from todo where id = ${todoId};`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
