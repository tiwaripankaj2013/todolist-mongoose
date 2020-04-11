const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const port = 3001;
const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// server database connection 
mongoose.connect("mongodb+srv://admin-pankaj:pankaj@2020@cluster0-nakra.mongodb.net/todolistDB",{useNewUrlParser: true,useUnifiedTopology:true});

/*connect mongodb database from local system*/


// local database connection 
// mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser: true,useUnifiedTopology:true});

const itemsSchema = {
    name:String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
    name: "Welcome to TodoLIst"
});
const item2 = new Item({
    name: "hit the + button to add a new item."
});
const item3 = new Item({
    name: "Delete todo item"
});

const listSchema = {
    name: String,
    items:[itemsSchema]
};

const List =  mongoose.model("List",listSchema);


const defaultItems = [item1,item2,item3]


app.get("/", (req, res) => {
    Item.find({},(err,foundItems)=>{
        if(foundItems.length === 0){
            Item.insertMany(defaultItems,(err)=>{
                if(err){
                    console.log(err)
                }
                else{
                    console.log("Sucessfully saved default items to DB.")
                }
            });
            res.redirect("/");
        }else{
            res.render("list", { listTitle: "Today", newListItems: foundItems });
        }
    });
  
});

/* dynamic routing  */
app.get("/:customListName",(req,res)=>{
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name:customListName},(err,foundList)=>{
        if(!err){
            if(!foundList){
                // create a new list
                const list = new List({
                    name:customListName,
                    items:defaultItems
                });
                list.save();
                res.redirect("/"+customListName);
            }else{
                // show an existing list 
                res.render("list",{ listTitle: foundList.name, newListItems: foundList.items })
                console.log("Exists!")
            }
        }
    });
    

});

/* add new task and insert data into db*/

app.post("/", (req, res) => {
    let itemName = req.body.newItem;
    const listName = req.body.list;

    const item  = new Item ({
        name:itemName
    });

    if(listName == 'Today'){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name:listName},(err,foundList)=>{
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
    }


});
/* delete task request  */
app.post("/delete", (req,res)=>{
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if(listName == 'Today'){

    Item.findByIdAndRemove(checkedItemId,(err)=>{
        if(err){
            console.log(err);
        }
        else{
            console.log("Item deleted sucessfully");
            res.redirect("/");
        }
    });
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},(err,foundList)=>{
            if(!err){
                res.redirect("/"+listName)
            }
        })
    }

});


app.get("/work", (req, res) => {
    res.render("list", { listTitle: "Work List", newListItems: workItems });
});
app.post("/work", (req, res) => {
    let item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
});

app.listen(port, () => {
    console.log("servr is stated on " + port)
})