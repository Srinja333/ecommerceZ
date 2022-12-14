const { Order, CartItem } = require("../models/order");
const { errorHandler } = require("../helpers/dbErrorHandler");
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


//orderById works like middle ware
exports.orderById = (req, res, next, id) => {
  console.log("rm", id);
  var query= Order.findById(id);

    query
    .populate("products.product", "namre price")
    .exec((err, order) => {
      console.log("orderbyid", order);
      if (err || !order) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      req.order = order;
      next();
    });
};

//  exports.create = (req, res) => {
//    console.log("CREAT ORDER:", req.body);

//    req.body.order.user = req.profile;
//    const order = new Order(req.body.order);
//    order.save((error, data) => {
//      if (error) {
//        return res.status(400).json({
//          error: errorHandler(error),
//        });
//      }
//     res.json(data);
//    });
//  };

// your create order method with email capabilities
exports.create = (req, res) => {
  console.log('CREATE ORDER: ', req.body);
  req.body.order.user = req.profile;
  const order = new Order(req.body.order);
  order.save((error, data) => {
      if (error) {
          return res.status(400).json({
              error: errorHandler(error)
          });
      }
      // User.find({ categories: { $in: categories } }).exec((err, users) => {}
      console.log('ORDER IS JUST SAVED >>> ', order);
      // send email alert to admin
      // order.address
      // order.products.length
      // order.amount
      const emailData = {
          to: 'cse19075@cemk.ac.in', // admin
          from: 'srinjayayan1262000@gmail.com',
          subject: `A new order is received`,
          html: `
          <h1>Hey Admin, Somebody just made a purchase in your ecommerce store</h1>
          <h2>Customer name: ${order.user.name}</h2>
          <h2>Customer address: ${order.address}</h2>
          <h2>User's purchase history: ${order.user.history.length} purchase</h2>
          <h2>User's email: ${order.user.email}</h2>
          <h2>Total products: ${order.products.length}</h2>
          <h2>Transaction ID: ${order.transaction_id}</h2>
          <h2>Order status: ${order.status}</h2>
          <h2>Product details:</h2>
          <hr />
          ${order.products
              .map(p => {
                  return `<div>
                      <h3>Product Name: ${p.name}</h3>
                      <h3>Product Price: ${p.price}</h3>
                      <h3>Product Quantity: ${p.count}</h3>
              </div>`;
              })
              .join('--------------------')}
          <h2>Total order cost: ${order.amount}<h2>
          <p>Login to your dashboard</a> to see the order in detail.</p>
      `
      };
      sgMail
          .send(emailData)
          .then(sent => console.log('SENT >>>', sent))
          .catch(err => console.log('ERR >>>', err));

      // email to buyer
      const emailData2 = {
          to: order.user.email,
          from: 'srinjayayan1262000@gmail.com',
          subject: `You order is in process`,
          html: `
          <h1>Hey ${req.profile.name}, Thank you for shopping with us.</h1>
          <h2>Total products: ${order.products.length}</h2>
          <h2>Transaction ID: ${order.transaction_id}</h2>
          <h2>Order status: ${order.status}</h2>
          <h2>Product details:</h2>
          <hr />
          ${order.products
              .map(p => {
                  return `<div>
                      <h3>Product Name: ${p.name}</h3>
                      <h3>Product Price: ${p.price}</h3>
                      <h3>Product Quantity: ${p.count}</h3>
              </div>`;
              })
              .join('--------------------')}
          <h2>Total order cost: ${order.amount}<h2>
          <p>Thank your for shopping with us.</p>
      `
      };
      sgMail
          .send(emailData2)
          .then(sent => console.log('SENT 2 >>>', sent))
          .catch(err => console.log('ERR 2 >>>', err));

      res.json(data);
  });
};

exports.listOrders = (req, res) => {
  //console.log("listreq:",req);
  //console.log("orderlo:",Order);
  Order.find()
    .populate("user", "_id name address") //_id name address from user
    .sort("-createdAt")
    .exec((err, orders) => {
      //console.log("userlo:",user)
      //console.log(created)
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json(orders);
    });
};

exports.getStatusValues = (req, res) => {
  res.json(Order.schema.path("status").enumValues);
};

exports.updateOrderStatus = (req, res) => {
  //below orderId and status get from frontend

  console.log("updateOrderStatus orderId", req.body.orderId);
  console.log("updateOrderStatus status", req.body.status);

  Order.updateMany(
    { _id: req.body.orderId },
    { $set: { status: req.body.status } },
    (err, order) => {
      console.log("updateOrderStatus:",order);
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json(order);
    }
  );
};
