// Create web server application with Node.js
// 1. Create a web server using http module
// 2. Create a router
// 3. Create a handler
// 4. Create a template
// 5. Create a database

const http = require('http');
const fs = require('fs');
const qs = require('querystring');
const path = require('path');
const sanitizeHtml = require('sanitize-html');
const template = require('./lib/template.js');
const db = require('./lib/db.js');
const url = require('url');

const app = http.createServer(function (request, response) {
    const _url = request.url;
    const queryData = url.parse(_url, true).query; // querystring 모듈의 parse 기능을 사용하여 url의 query string을 분석한다.
    const pathname = url.parse(_url, true).pathname; // url의 path를 분석한다.
    if (pathname === '/') {
        if (queryData.id === undefined) {
            db.query(`SELECT * FROM topic`, function (error, topics) {
                const title = 'Welcome';
                const description = 'Hello, Node.js';
                const list = template.list(topics);
                const html = template.html(title, list,
                    `<h2>${title}</h2>${description}`,
                    `<a href="/create">create</a>`);
                response.writeHead(200);
                response.end(html);
            });
        } else {
            db.query(`SELECT * FROM topic`, function (error, topics) {
                if (error) throw error;
                db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`, [queryData.id], function (error2, topic) {
                    if (error2) throw error2;
                    const title = topic[0].title;
                    const description = topic[0].description;
                    const list = template.list(topics);
                    const html = template.html(title, list,
                        `<h2>${sanitizeHtml(title)}</h2>
                        ${sanitizeHtml(description)}
                        <p>by ${sanitizeHtml(topic[0].name)}</p>`,
                        `<a href="/create">create</a>
                        <a href="/update?id=${queryData.id}">update</a>
                        <form action="/delete_process" method="post">
                            <input type="hidden" name="id" value="${queryData.id