//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");


const mongoose = require("mongoose");

mongoose.set('strictQuery', true);



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-tommy:test123@atlascluster.hdxviaz.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model(
  "Item", itemsSchema
)

const task1 = new Item({
  name: "do Dishes"
});

const task2 = new Item({
  name: "Twix"
});

const task3 = new Item({
  name: "Lay an egg"
});

const defaultItems = [task1, task2, task3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function (req, res) {

  Item.find({}, function (err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log("error", err);
        } else {
          console.log("sucess, new array items entered");
        }
      });
    } else {

      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });



});

app.get('/:id', function (req, res) {
  const customListName = _.capitalize(req.params.id);

  List.findOne({ name: customListName }, function (err, docs) {
    if (!err) {
      if (!docs) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName)
      } else {
        res.render("list", { listTitle: customListName, newListItems: docs.items })
        console.log("This already exists : ", docs);
      }
    }
  })


});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();

    res.redirect('/');
  } else {
    List.findOne({ name: listName }, function (err, docs) {
      docs.items.push(item);
      docs.save();
      res.redirect("/" + listName);

    })

  }



});

app.post("/delete", function (req, res) {

  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndDelete(checkedItemID, function (err, docs) {
      if (!err) {
        console.log("Deleted : ", docs);
        res.redirect("/");
      }

    });
  } else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemID } } }, function (err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });



  }



});


app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function () {
  console.log("Server started sucessfully");
});
