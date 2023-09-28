//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require ("mongoose")
const app = express();
const _ =require("lodash")
const dotenv = require("dotenv")
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
require('dotenv').config()
mongoose.set('strictQuery', false);

mongoose.connect(process.env.url, {useNewUrlParser: true});

const itemsSchema = new mongoose.Schema({
  name:String
})
const Item =  mongoose.model("Item",itemsSchema) 
const listSchema = {
  name:String,
  items: [itemsSchema]
}
const List = mongoose.model("List",listSchema);

app.get('/',function(req,res){res.redirect('/HOME')})

app.get("/:customListName",function(req,res){
  const customName = _.upperCase(req.params.customListName);
  if(customName!='FAVICON ICO'){
    List.findOne({name:customName},function(err,foundList){
      if (!err){
        if (!foundList){
          const list = new List({
            name:customName,
            items: []
          })
          list.save()
          res.redirect("/"+customName)
        }
        else
          List.find({} ,function(err,found){res.render("list", {allLists: found?found:[] ,listTitle: foundList.name , newListItems: foundList.items});})  
      }
    })
  }
})

app.post("/newItem", function(req, res){
  const itemname = req.body.newItem;
  const listname = req.body.list;
  const itemx =new Item({name:itemname})
  if (itemname!==""){
    List.findOne({name:listname},function(err,foundlist){
      foundlist.items.push(itemx)
      foundlist.save()
      res.redirect('/'+listname)
    })
  }
});

app.post("/delete",function(req,res){
  const checkedId = req.body.checkbox
  const listname = req.body.listname;
  
    List.findOneAndUpdate({name:listname},{$pull: {items:{_id:checkedId}}},function(err,foundList){
      if (!err) res.redirect('/'+listname)
    })
  
})


app.post("/newList",(req,res)=>{
  const newname = req.body.newItems
  res.redirect("/"+newname);
})

app.post("/deleteList/:listTitle",function(req,res){
  const checkedId = req.body.checkbox
  const listTitle = req.params.listTitle;
  List.findOne({_id:checkedId} , function(err,item){
    if (item){
      List.deleteOne({_id:checkedId},function(err){
        if (err) console.log(err)
        else console.log("Deleted checked item from Database")
      })
      if (item.name == listTitle) res.redirect('/HOME')
      else res.redirect('/'+listTitle)
    }
  })
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
