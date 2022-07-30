const express = require("express");
const expressLayout = require("express-ejs-layouts");

require("./utils/db");
const Contact = require("./model/contact");

const app = express();
const port = 3000;

const { body, validationResult, check } = require("express-validator");
const methodOverride = require("method-override");

const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
//set up metho override
app.use(methodOverride("_method"));
//Set up ejs
app.set("view engine", "ejs");
app.use(expressLayout);
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

//Set up session, cookie, and flash
//Set up untuk mengolah session
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

//Halaman Home
app.get("/", (req, res) => {
  const mahasiswa = [
    {
      nama: "Yusuf Bagus",
      email: "yusuf@gmail.com",
    },
    {
      nama: "Dhimas",
      email: "dhimas@gmail.com",
    },
    {
      nama: "Alexander",
      email: "alex@gmail.com",
    },
  ];
  res.render("index", {
    layout: "layouts/main",
    nama: "Yusuf Bagus",
    title: "Halaman Home",
    mahasiswa,
  });
});

//halaman about
app.get("/about", (req, res) => {
  res.render("about", {
    layout: "layouts/main",
    title: "Halaman About",
  });
});

//menampilkan seluruh data contact
app.get("/contact", async (req, res) => {
  //   Contact.find().then((contact) => {
  //     res.send(contact);
  //   });

  const contacts = await Contact.find();

  res.render("contact", {
    layout: "layouts/main",
    title: "Halaman Contact",
    contacts,
    msg: req.flash("msg"),
  });
});

//Halaman tambah data contact
app.get("/contact/add", (req, res) => {
  res.render("addContact", {
    layout: "layouts/main",
    title: "Form Tambah Data Contact",
  });
});

//menghapus contact
app.delete("/contact", (req, res) => {
  Contact.deleteOne({ nama: req.body.nama }).then((result) => {
    // res.send(req.body);
    req.flash("msg", "Data contact berhasil dihapus!");
    res.redirect("/contact");
  });
});

//Halaman tambah data contact
app.post(
  "/contact",
  [
    body("nama").custom(async (value) => {
      duplikat = await Contact.findOne({ nama: value });
      if (duplikat) {
        throw new Error("Nama contact sudah digunakan");
      }
      return true;
    }),
    check("email", "email tidak valid").isEmail(),
    check("nohp", "nomor hp tidak valid").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(400).json({ errors: errors.array() });
      res.render("addContact", {
        title: "Form Tambah Data Contact",
        layout: "layouts/main",
        errors: errors.array(),
      });
    } else {
      Contact.insertMany(req.body, (error, result) => {
        //kirim flash massage
        req.flash("msg", "Data contact berhasil ditambahkan!");
        res.redirect("/contact");
        // res.send(req.body);
      });
    }
  }
);

//Ubah data contact
app.get("/contact/edit/:nama", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });
  res.render("editContact", {
    layout: "layouts/main",
    title: "Form Ubah Data Contact",
    contact,
  });
});

//ubah data contact
app.put(
  "/contact",
  [
    body("nama").custom(async (value, { req }) => {
      duplikat = await Contact.findOne({ nama: value });
      if (value !== req.body.oldNama && duplikat) {
        throw new Error("Nama contact sudah digunakan");
      }
      return true;
    }),
    check("email", "email tidak valid").isEmail(),
    check("nohp", "nomor hp tidak valid").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(400).json({ errors: errors.array() });
      res.render("editContact", {
        title: "Form Ubah Data Contact",
        layout: "layouts/main",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      Contact.updateOne(
        { _id: req.body._id },
        {
          $set: {
            nama: req.body.nama,
            email: req.body.email,
            nohp: req.body.nohp,
          },
        }
      ).then((result) => {
        req.flash("msg", "Data contact berhasil diubah!");
        res.redirect("/contact");
      });
    }
  }
);

// app.post(
//   "/contact/update",
//   [
//     body("nama").custom(async (value, { req }) => {
//       duplikat = await Contact.findOne({ nama: value });
//       if (value !== req.body.oldNama && duplikat) {
//         throw new Error("Nama contact sudah digunakan");
//       }
//       return true;
//     }),
//     check("email", "email tidak valid").isEmail(),
//     check("nohp", "nomor hp tidak valid").isMobilePhone("id-ID"),
//   ],
//   (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       // return res.status(400).json({ errors: errors.array() });
//       res.render("editContact", {
//         title: "Form Ubah Data Contact",
//         layout: "layouts/main",
//         errors: errors.array(),
//         contact: req.body,
//       });
//     } else {
//       Contact.updateOne(
//         { nama: req.body.nama },
//         {
//           $set: {
//             nama: req.body.nama,
//             email: req.body.email,
//             nohp: req.body.nohp,
//           },
//         }
//       ).then((result) => {
//         req.flash("msg", "Data contact berhasil diubah!");
//         res.redirect("/contact");
//       });
//     }
//   }
// );

// Hapus data contact
app.get("/contact/delete/:nama", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });

  //jika contact tidak ada
  if (!contact) {
    res.status(404);
    res.send("<h1>404</h1>");
  } else {
    Contact.deleteOne({ nama: req.params.nama }).then((result) => {
      req.flash("msg", "Data contact berhasil dihapus!");
      res.redirect("/contact");
    });
  }
});

//menampilkan detail data contact
app.get("/contact/:nama", async (req, res) => {
  //ambil data contact dari contact.json
  contact = await Contact.findOne({ nama: req.params.nama });
  res.render("detail", {
    layout: "layouts/main",
    title: "Halaman Detail Contact",
    contact,
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
