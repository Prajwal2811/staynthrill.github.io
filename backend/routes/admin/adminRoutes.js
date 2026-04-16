const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middleware/admin/auth"); // JWT middleware
const { checkRole } = require("../../middleware/admin/role");
const { getAdmins, 
    toggleAdminStatus , 
    deleteAdmin, 
    editAdmin, 
    updateAdmin, 
    createAdmin , 
    getManagers,
    toggleManagerStatus,
    deleteManager,
    viewManager,
    getVendors, 
    toggleVendorStatus, 
    deleteVendor, 
    viewVendor, 
    updateManagerReviewStatus, 
    updateVendorReviewStatus, 
    getUsers,
    toggleUserStatus,
    deleteUser,
    viewUser,
    getReviews,
    toggleReviewStatus,
    deleteReview,
    viewReview,
    getBookings,
    deleteBooking,
    viewBooking,
    updateBookingStatus
} = require("../../controllers/admin/adminController");

// ✅ Get all admins
router.get("/admins", verifyToken, getAdmins);

// Toggle admin status
router.patch("/:id/status", verifyToken, toggleAdminStatus);

// Delete admin
router.delete("/:id/admin", verifyToken, deleteAdmin);

// Fetch single admin for edit
router.get("/:id/edit", verifyToken, editAdmin);

// Update admin
router.put("/:id", verifyToken, updateAdmin); 

// Create new admin
router.post("/", verifyToken, createAdmin);





// ✅ Get all vendors
router.get("/vendors", verifyToken, getVendors);

// Toggle vendor status
router.patch("/:id/vendor_status", verifyToken, toggleVendorStatus);

// Delete vendor
router.delete("/:id/vendor", verifyToken, deleteVendor);

// Fetch single vendor for edit
router.get("/:id/view", verifyToken, viewVendor);





// ✅ Get all managers
router.get("/managers", verifyToken, getManagers);

// Toggle manager status
router.patch("/:id/manager_status", verifyToken, toggleManagerStatus);

// Delete manager
router.delete("/:id/manager", verifyToken, deleteManager);

// Fetch single manager for edit
router.get("/:id/view_manager", verifyToken, viewManager);

// Update review status
router.put("/:id/review-manager-status", verifyToken, updateManagerReviewStatus);





// Fetch single vendor for edit
router.put("/:id/review-vendor-status", verifyToken, updateVendorReviewStatus);


// Get all users
router.get("/users", verifyToken, getUsers);

// Toggle status
router.patch("/:id/user_status", verifyToken, toggleUserStatus);

// Delete user
router.delete("/:id/user", verifyToken, deleteUser);

// ✅ pehle specific route
router.get("/bookings", verifyToken, getBookings);

// Delete booking
router.delete("/:id/booking", verifyToken, deleteBooking);


// Fetch single booking for view
router.get("/:id/view_booking", verifyToken, viewBooking);

// PATCH: update booking status
router.patch("/:id/update_status", verifyToken, updateBookingStatus);


// Fetch single user for view
router.get("/:id", verifyToken, viewUser);


// Get all users reviews
router.get("/reviews", verifyToken, getReviews);

// Toggle status
router.patch("/:id/reviews_status", verifyToken, toggleReviewStatus);

// Delete review
router.delete("/:id/review", verifyToken, deleteReview);

// Fetch single review for edit
router.get("/review/:id", verifyToken, viewReview);








module.exports = router;