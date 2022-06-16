const express = require('express');
const db = require('../util/database');
const getUniqId = require('../common/crypto_id');

const router = express.Router();

router.get('/', (req, res) => {
    const sql = ["select * from product order by title asc", "select * from district order by district asc"]
    db.query(sql.join(';'), (err, result) => {
        res.send(result);
    })
});

router.get('/history', (req, res) => {
    const customer_id = req.query;
    // console.log(customer_id)
    const sql = "select * from (((customer left outer join places using (customer_id)) left outer join customer_order using (order_id)) left outer join has using (order_id)) left outer join product using (product_id) where (customer_id = ? and order_id is not null) order by date_time desc ;";
    db.query(sql, [customer_id['0']], (err, result) => {
        res.send(result)
    })
});

router.post('/history', (req, res) => {
    const ordID = req.body['orderID']
    // console.log(ordID);
    const sql = "update customer_order set state='cancelled' where order_id = ?";
    db.query(sql, ordID, (err, result) => {
        res.send(result)
    })
});

router.post('/', (req, res) => {
    const a = req.body.dataa;
    const user = req.body.currentUser
    const cost = req.body.cost;
    const capacity = req.body.capacity;
    const order_id = getUniqId('ord')

    a.carts.forEach(element => {
        const sql1 = "UPDATE product SET quantity=? WHERE product_id=?";
        db.query(sql1, [element.quantity - element.count, element.product_id], (err, result) => {
        })

        const sql2 = "insert into has(order_id,product_id,count) values(?,?,?)";
        db.query(sql2, [order_id, element.product_id, element.count], (err, result) => { });
    });
    // console.log(user)
    // const address = a.address + ", " + a.city + ", " + a.district;
    const sql3 = "insert into places(customer_id,order_id,address,city,district) values(?,?,?,?,?)"
    db.query(sql3, [user.customer_id, order_id, a.address, a.city, a.district], (err, result) => {
        // console.log(err);
        // console.log(result);

    });

    const sql4 = "insert into customer_order(order_id,total_price,capacity) values (?,?,?)";
    db.query(sql4, [order_id, cost, capacity], (err, result) => {
    });
});


module.exports = router;
