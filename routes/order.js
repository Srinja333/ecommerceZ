const express = require("express");
const router = express.Router();
const { requireSignin, isAuth, isAdmin} = require("../controllers/auth");
const { userById,addOrderToUserHistory } = require("../controllers/user");
const { create,listOrders,getStatusValues,orderById,updateOrderStatus} = require("../controllers/order");
const { decreaseQantity } = require("../controllers/product");

router.post("/order/create/:userId", requireSignin, isAuth, addOrderToUserHistory, decreaseQantity, create);
//below router to all orders in frontend
router.get("/order/list/:userId",requireSignin,isAuth,isAdmin,listOrders);
router.get("/order/status-values/:userId",requireSignin,isAuth,isAdmin,getStatusValues);
router.put("/order/:orderId/status/:userId",requireSignin,isAuth,isAdmin,updateOrderStatus);

router.param("userId", userById);
router.param("orderId", orderById);
//console.log(router.param);

module.exports = router;
