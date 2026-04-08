const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middleware/admin/auth"); // JWT middleware
const { getVendors, toggleVendorStatus, deleteVendor, viewVendor } = require('../../controllers/vendor/vendorController');



// ✅ Get all vendors
router.get("/vendors", verifyToken, getVendors);

// Toggle vendor status
router.patch("/:id/status", verifyToken, toggleVendorStatus);

// Delete vendor
router.delete("/:id", verifyToken, deleteVendor);

// Fetch single vendor for edit
router.get("/:id/view", verifyToken, viewVendor);


module.exports = router;