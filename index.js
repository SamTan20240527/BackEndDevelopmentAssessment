//npm init -y
//npm install express hbs handlebars-helpers wax-on mysql2 dotenv
//npm update (when encounter npm deprecated warnings and outdated version of handlebars-helpers)
const express = require('express');
const hbs = require('hbs');
const helpers = require('handlebars-helpers');
helpers({ 'handlebars': hbs.handlebars })
const wax = require('wax-on');
require('dotenv').config();
const { createConnection } = require('mysql2/promise');
let app = express();
app.set('view engine', 'hbs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
wax.on(hbs.handlebars);
wax.setLayoutPath('./views/layouts');

//Connect to MySQL
let connection;
async function main() {
    connection = await createConnection({
        'host': process.env.DB_HOST,
        'user': process.env.DB_USER,
        'database': process.env.DB_NAME,
        'password': process.env.DB_PASSWORD
    })

    //Route for testing http://localhost:3000/
    app.get('/', (req, res) => { res.send('Localhost Connected!'); })

    //Route to view open POs
    app.get('/po_app', async (req, res) => {
        let [po_open] = await connection.execute('SELECT * FROM po_view WHERE quantity_received = 0');
        res.render('po_app/index', {
            'po': po_open
        })
    })

    //Route to view PO history
    app.get('/po_app/po_history', async (req, res) => {
        let [po_history] = await connection.execute('SELECT * FROM po_view WHERE quantity_received > 0');
        res.render('po_app/po_history', {
            'po': po_history
        })
    })

    //Route to create new PO
    app.get('/po_app/create', async (req, res) => {
        let [supplier] = await connection.execute('SELECT * FROM supplier ORDER BY supplier_name');
        let [product] = await connection.execute('SELECT * FROM product ORDER BY product_description');
        res.render('po_app/create', {
            'supplier': supplier,
            'product': product
        })
    })
    app.post('/po_app/create', async (req, res) => {
        let { supplier_id, product_id, quantity_ordered, unit_price, due_date } = req.body;
        await connection.execute(
            'INSERT INTO po (supplier_id, product_id, quantity_ordered, unit_price, due_date) VALUES (?, ?, ?, ?, ?)',
            [supplier_id, product_id, quantity_ordered, unit_price, due_date]);
        res.redirect('/po_app');
    })

    //Route to update PO (Receive PO)
    app.get('/po_app/:po_id/update', async (req, res) => {
        let [po_update] = await connection.execute('SELECT * from po_view WHERE po_id = ?', [req.params.po_id]);
        let po = po_update[0];
        res.render('po_app/update', {
            'po': po_update,
        })
    })
    app.post('/po_app/:po_id/update', async (req, res) => {
        let { quantity_received, remarks } = req.body;
        await connection.execute(
            'UPDATE po SET quantity_received =?, remarks =? WHERE po_id=?',
            [quantity_received, remarks, req.params.po_id]);
        res.redirect('/po_app');
    })

    //Route to view products
    app.get('/po_app/product', async (req, res) => {
        let [product] = await connection.execute('SELECT * FROM product_view ORDER BY product_number_view');
        res.render('po_app/product', {
            'product': product
        })
    })

    //Route to delete PO
    app.get('/po_app/:po_id/delete', async (req, res) => {
        let [pos] = await connection.execute('SELECT * FROM po WHERE po_id =?', [req.params.po_id]);
        let po = pos[0];
        res.render('po_app/delete', {
            'po': po
        })
    })
    app.post('/po_app/:po_id/delete', async (req, res) => {
        let { po_id } = req.body;
        await connection.execute(
            'DELETE FROM po WHERE po_id=?',
            [req.params.po_id]);
        res.redirect('/po_app');
    })

    //Start server: nodemon index.js
    //Browse: http://localhost:3000/
    app.listen(3000, () => {
        console.log('Server is running')
    })

};
main();

