var express = require('express');
var router = express.Router();
var Book = require('../models').Book;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


/* GET articles listing. */
router.get('/', function (req, res, next) {
  Book.findAndCountAll().then((data) => {
    let limit = 5;
    pages = Math.ceil(data.count / limit);
    Book.findAll({
      order: [["year", "DESC"]]
    }).then(function (books) {
      res.render("books/index", { books: books, title: "Books", pages: pages, allUrl: "allUrl" });
    }).catch(function (err) {
      res.send(500, err);
    });
  });
});


/* GET pagination articles listing. */
router.get('/page/:page', function (req, res, next) {
  let pageCount;
  Book.findAndCountAll().then((data) => {
    let limit = 5;
    let page = req.params.page;      // page number
    let pages = Math.ceil(data.count / limit);
    offset = limit * (page - 1);
    Book.findAll({
      order: [["year", "DESC"]],
      limit: limit,
      offset: offset,
      $sort: { id: 1 }
    }).then(function (books) {
      res.render("books/index", { books: books, title: "Books", pages: pages, routeUrl: "routeUrl" });
    }).catch(function (err) {
      res.send(500);
    });
  });
});


/* GET articles listing after search */

router.get('/search', function (req, res, next) {
  const { term } = req.query;
  let limit = 5;
  let page = req.params.page;      // page number
  let offset = limit * (page - 1);
  Book.findAndCountAll({
    where: {
      [Op.or]: [
        {
          title: {
            [Op.like]: '%' + term + '%'
          }
        },
        {
          author: {
            [Op.like]: '%' + term + '%'
          }
        },
        {
          genre: {
            [Op.like]: '%' + term + '%'
          }
        }
      ]
    },
    order: [["year", "DESC"]],
    offset: 0,
    limit: 5
  }).then(function (books) {
    let pages = Math.ceil(books.count / limit);
    res.render("books/index", { books: books.rows, title: "Books", pages: pages, routeUrl: "routeUrl" });
  }).catch(function (err) {
    res.send(500);
  });
});


/* Paginated results from search */

router.get('/search/page/:page', function (req, res, next) {
  const { term } = req.query;
  let limit = 5;
  let page = req.params.page;      // page number
  let offset = limit * (page - 1);
  Book.findAndCountAll({
    where: {
      [Op.or]: [
        {
          title: {
            [Op.like]: '%' + term + '%'
          }
        },
        {
          author: {
            [Op.like]: '%' + term + '%'
          }
        },
        {
          genre: {
            [Op.like]: '%' + term + '%'
          }
        }
      ]
    },
    order: [["year", "DESC"]],
    offset: offset,
    limit: limit
  }).then(function (books) {
    let pages = Math.ceil(books.count / limit);
    res.render("books/index", { books: books.rows, title: "Books", pages: pages, routeUrl: "routeUrl" });
  }).catch(function (err) {
    res.send(500);
  });
});


/* POST create article. */
router.post('/', function (req, res, next) {
  Book.create(req.body).then(function (book) {
    res.redirect("/books/" + book.id);
  }).catch(function (err) {
    if (err.name === "SequelizeValidationError") {
      res.render("books/new_book", {
        book: Book.build(req.body),
        title: "New Book",
        errors: err.errors
      });
    } else {
      throw err;
    }
  }).catch(function (err) {
    res.send(500);
  });
});


/* Get Create a new article form. */
router.get('/new', function (req, res, next) {
  res.render("books/new_book", { book: Book.build(), title: "New Book" });
});

/* Get Edit article form. */
router.get("/:id/edit", function (req, res, next) {
  Book.findByPk(req.params.id).then(function (book) {
    if (book) {
      res.render("books/book_detail", { book: book, title: "Update Book" });
    } else {
      res.send(404);
    }
  }).catch(function (err) {
    res.send(500);
  });
});



/* Get Delete article form. */
router.get("/:id/delete", function (req, res, next) {
  Book.findByPk(req.params.id).then(function (book) {
    if (book) {
      res.render("books/delete", { book: book, title: "Delete Book" });
    } else {
      send(404);
    }
  }).catch(function (err) {
    res.send(500);
  });
});

/* GET individual book. */
router.get("/:id", function (req, res, next) {
  Book.findByPk(req.params.id).then(function (book) {
    if (book) {
      res.render("books/book_detail", { book: book, title: book.title });
    } else {
      var err = new Error('Not Found');
      err.status = 404;
      res.render('page-not-found', {
        message: err.message,
        error: err
      });
    }
  }).catch(function (err) {
    res.render('error', {
      message: err.message,
      error: err
    });
  });
});


/* PUT update book. */
router.put("/:id", function (req, res, next) {
  Book.findByPk(req.params.id).then(function (book) {
    if (book) {
      return book.update(req.body)
    } else {
      res.send(404);
    }
  }).then(function (book) {
    res.redirect("/books/" + book.id);
  }).catch(function (err) {
    if (err.name === "SequelizeValidationError") {
      var book = Book.build(req.body);
      book.id = req.params.id;
      res.render("books/new_book", {
        book: book,
        title: "Edit Book",
        errors: err.errors
      });
    } else {
      throw err;
    }
  }).catch(function (err) {
    res.send(500);
    console.log(err)
  });
});

/* DELETE individual book. */
router.delete("/:id", function (req, res, next) {
  Book.findByPk(req.params.id).then(function (book) {
    console.log
    if (book) {
      return book.destroy();
    } else {
      res.send(404);
    }
  }).then(function () {
    res.redirect("/books");
  }).catch(function (err) {
    res.send(500);
    res.send(err)
    console.log(err)
  });
});

module.exports = router;