const express = require('express');
const app = express();
const http = require('http').Server(app);
const cloudant = require('@cloudant/cloudant');
const uuid = require('uuid');
const client = cloudant({ password: "63a4e35b2375da3fc72da794ddd79434bc06941bfc499328c8af1e51b55dcb06", username: "d7aec8ed-7f4b-438e-ba41-edb66580338e-bluemix", url: "https://d7aec8ed-7f4b-438e-ba41-edb66580338e-bluemix.cloudantnosqldb.appdomain.cloud" });
const db = client.db.use("forestation_db");


app.use(express.urlencoded());
app.use(express.json());

app.get('/', function(req, res) {
  res.render('index.ejs');
});

app.get('/data', function(req, res) {
  db.partitionedFind("proposal", { selector: { "active": {"$eq": "Yes"} }}, function(err, result) {
    if (err) {
      throw err;
    }
  
    let rows = []
    res.render('data.ejs', { rows: rows, docs: result.docs });

    console.log('Found %d documents', result.docs.length);
    for (var i = 0; i < result.docs.length; i++) {
      console.log('  Doc id: %s', result.docs[i]);
    }
  });
});

app.get('/submissions', function(req, res) {
  db.partitionedFind("submission", { selector: { }}, function(err, result) {
    if (err) {
      throw err;
    }
  
    let rows = []
    res.render('submissions.ejs', { rows: rows, docs: result.docs });

    console.log('Found %d documents', result.docs.length);
    for (var i = 0; i < result.docs.length; i++) {
      console.log('  Doc id: %s', result.docs[i]);
    }
  });
});

  
app.get('/form', function(req, res) {
  res.render('form.ejs');
});

app.post('/form', function(req, res){
    db.insert(req.body, "ngo:"+uuid.v4())
    res.redirect('/');
});

app.get('/ngosubmission', function(req, res) {
  res.render('ngosubmission.ejs');
});

app.post('/ngosubmission', function(req, res){
    db.insert(req.body, "submission:"+uuid.v4())
    res.redirect('/data');
});
app.get('/admin', function(req, res) {
  res.render('admin.ejs');
});

app.get('/newproposal', function(req, res) {
  res.render('newproposal.ejs');
});

app.post('/newproposal', function(req, res){
    db.insert(req.body, "proposal:"+uuid.v4())
    res.redirect('/admin');
});

app.get('/allocation', function(req, res) {
  res.render('allocation.ejs');
});

app.post('/allocation', function(req, res){
    db.insert(req.body, "allocation:"+uuid.v4())
    res.redirect('/submissions');
});

app.get('/deactivateproposal', function(req, res) {
  res.render('deactivateproposal.ejs');
});

app.post('/deactivateproposal', function(req, res){
  console.log(req.body.proposalid);
  db.partitionedFind("proposal", { selector: { "_id": {"$eq": req.body.proposalid} }}, function(err, result) {
    if (err) {
      throw err;
    }
    result.docs[0].active="No";
    console.log(result);
    db.insert(result.docs[0]);
    res.redirect('/admin');
});
});

app.get('/update', function(req, res) {
  db.partitionedFind("proposal", { selector: { }}, function(err, result) {
    if (err) {
      throw err;
    }
  
    res.render('update.ejs', {record: result.docs[0]});
  });
});

app.post('/update', function(req, res){
    db.insert(req.body)
    res.redirect('/');
});









const server = http.listen(8080, function() {
    console.log("Listning on 8080....");
});
