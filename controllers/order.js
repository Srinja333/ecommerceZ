const { Order, CartItem } = require("../models/order");
const { errorHandler } = require("../helpers/dbErrorHandler");


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

 exports.create = (req, res) => {
   console.log("CREAT ORDER:", req.body);

   req.body.order.user = req.profile;
   const order = new Order(req.body.order);
   order.save((error, data) => {
     if (error) {
       return res.status(400).json({
         error: errorHandler(error),
       });
     }
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
