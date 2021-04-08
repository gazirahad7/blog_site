const express = require("express");
const router = express.Router();

const mySql = require("mysql");
const multer = require("multer");
//const { render } = require("ejs");

// storage multer
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "public/uploadImages");
  },
  filename: (req, file, callback) => {
    const myFilename = file.originalname;
    console.log("My file", myFilename);

    callback(null, myFilename);
  },
});
let upload = multer({ storage });

// mySql
let connection = mySql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "first_db",
});
connection.connect();

// routes
router.get("/form", (req, res) => {
  const sqlOne =
    "SELECT  categories.name as categoriesName FROM `post_list`, categories WHERE post_list.category_id = categories.id";
  connection.query(sqlOne, (err, rows) => {
    const sqlTwo = "SELECT * FROM `categories`";
    connection.query(sqlTwo, (err, categories) => {
      res.render("form", { allData: rows, allCategories: categories });
    });
  });
});
// show
router.get("/home", (req, res) => {
  const show =
    "SELECT post_list.id as id, title, body, images, name FROM `post_list` JOIN categories WHERE post_list.category_id = categories.id";

  connection.query(show, (err, rows) => {
    res.render("home", { allData: rows });
    console.log(rows);
  });
});

// form post
router.post("/submit", upload.array("files"), (req, res) => {
  const { postTitle, category, postBody } = req.body;
  console.log("Req body", req.body);
  let myFile = req.files;
  console.log("My File", myFile);
  let fileMap = myFile.map((item) => item.filename);
  let fileString = JSON.stringify(fileMap);

  const sqlInsert =
    "INSERT INTO `post_list`(`title`, `category_id`, `body`,`images`) VALUES (?,?,?,?)";
  connection.query(
    sqlInsert,
    [postTitle, category, postBody, fileString],
    (err, rows) => {
      if (err) {
        console.log(err);
        res.send("Error");
      } else if (rows.affectedRows) {
        res.render("showAlertMsg", {
          element1: "display:block",
          element2: "display:none",
        });
      }
    }
  );
});

//

// SELECT post_list.title as PostTitle, categories.name as categoriesName FROM `post_list`, categories WHERE post_list.category_id = categories.id

router.get("/showImages/:id", (req, res) => {
  const id = req.params.id;
  const show = "SELECT * FROM `post_list` WHERE id=?";
  connection.query(show, [id], (err, rows) => {
    res.render("showAllImages", { allData: rows });
  });
});
// see more post body show
router.get("/showBody/:id", (req, res) => {
  const id = req.params.id;

  const showBody =
    "SELECT post_list.id as id, title, body, images, name FROM `post_list` JOIN categories WHERE post_list.category_id = categories.id and post_list.id =?";
  connection.query(showBody, [id], (err, rows) => {
    res.render("seeMore", { allData: rows });
  });
});

// Edit form get show
router.get("/edit/:id", (req, res) => {
  const id = req.params.id;
  const editQuery = "SELECT * FROM `post_list` WHERE id=?";

  connection.query(editQuery, [id], (err, rows) => {
    const sqlTwo = "SELECT * FROM `categories`";
    connection.query(sqlTwo, (err, categories) => {
      console.log("editrows", rows[0]);
      res.render("edit-form", {
        editPost: rows[0],
        allCategories: categories,
        // allData: rows,
      });
    });
  });
});
// Edit form
router.post("/update", upload.array("files"), (req, res) => {
  const { postTitle, category, postBody, postID, allImages } = req.body;

  const updateValues =
    "UPDATE `post_list` SET `title`=?, `category_id`=?,`body`=?,`images`=? WHERE id =?";
  connection.query(
    updateValues,
    [postTitle, category, postBody, allImages, postID],
    (err, rows, filed) => {
      if (err) {
        console.log(err);
        res.send("Error");
      } else if (rows.affectedRows) {
        res.render("showAlertMsg", {
          element1: "display:block",
          element2: "display:none",
        });
      }
    }
  );
});

// Delete router
router.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  const deleteQuery = "DELETE FROM `post_list` WHERE id=?";
  connection.query(deleteQuery, [id], (err, rows) => {
    if (err) {
      res.render("error");
    } else if (rows.affectedRows) {
      res.redirect("/home");
    }
  });
});

// Searching post
router.post("/search", (req, res) => {
  const { search } = req.body;
  const searchQurey =
    'SELECT post_list.id as id, title, body, images, name FROM post_list JOIN categories WHERE post_list.category_id = categories.id and categories.name LIKE "%' +
    search +
    '%"';
  connection.query(searchQurey, [search], (err, rows) => {
    res.render("searchpost", { searchpost: rows, searchText: search });
  });
});
// Exports
module.exports = router;
