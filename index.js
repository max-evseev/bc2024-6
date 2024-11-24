const { program } = require('commander');
const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const upload = multer();
program
.option('-h, --host <server host>')
.option('-p, --port <server port>')
.option('-c, --cache <cache directory>');
program.parse();
const options = program.opts();
    app.get('/UploadForm.html', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'UploadForm.html'));
    });
    app.post('/write', upload.none(), (req, res) => {
        if (!fs.existsSync(__dirname + "\\" + path.join(options.cache, req.body.note_name + '.txt'), fs.constants.F_OK)) {
        fs.writeFileSync(__dirname + "\\" + path.join(options.cache, req.body.note_name + '.txt'), req.body.note);
        res.status(201).send("note created");
        }
        else {
        res.status(400).send("note already exists under that name");
        }
    });
    app.get('/notes', (req, res) => {
    var files = fs.readdirSync(__dirname + "\\" + path.join(options.cache));
    var json = '[';
        for (const file of files) {
        var filedata = fs.readFileSync(__dirname + "\\" + path.join(options.cache, file), { encoding: 'utf8', flag: 'r' });
        json += '\n{\n"name": "' + file + '",\n"text": "' + filedata + '"\n}';
            if (files.indexOf(file) != files.length - 1) {
            json += ',';
            }
        }
        json += '\n]';
    res.setHeader('content-type', 'text/plain');
    res.status(200).send(json);
    });
    app.get('/notes/:name', (req, res) => {
        try {
        var notefile = fs.readFileSync(__dirname + "\\" + path.join(options.cache, req.params['name'] + ".txt"), { encoding: 'utf8', flag: 'r' });
        res.setHeader('content-type', 'text/plain');
        res.status(200).send(notefile);
        }
        catch {
        res.status(404).send("note doesnt exist");
        }
    });
    app.delete('/notes/:name', (req, res) => {
        try {
        fs.unlinkSync(__dirname + "\\" + path.join(options.cache, req.params['name'] + ".txt"));
        res.status(200).send("note deleted");
        }
        catch {
        res.status(404).send("note doesnt exist");
        }
    });
    app.put('/notes/:name', express.text(), (req, res) => {
        if (fs.existsSync(__dirname + "\\" + path.join(options.cache, req.params['name'] + ".txt"), fs.constants.F_OK)) {
        fs.writeFileSync(__dirname + "\\" + path.join(options.cache, req.params['name'] + ".txt"), req.body);
        res.status(200).send("note edited");
        }
        else {
        res.status(404).send("note doesnt exist");
        }
    });
    if (options.host === undefined || options.port === undefined || options.cache === undefined) {
    console.log("please specify host, port and cache if u want server to work");
    return;
    }   
    else {
    app.listen(options.port);
    }