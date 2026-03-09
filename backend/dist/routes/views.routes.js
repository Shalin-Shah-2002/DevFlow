"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const views_controller_1 = require("../controllers/views.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
const viewsController = new views_controller_1.ViewsController();
// All routes require authentication
router.use(auth_middleware_1.authMiddleware);
// 6.1 GET    /api/views          - Get all saved views
// 6.2 POST   /api/views          - Create a saved view
// 6.3 PATCH  /api/views/:id      - Update a saved view
// 6.4 DELETE /api/views/:id      - Delete a saved view
// 6.5 POST   /api/views/:id/apply - Apply view (get filtered issues)
router.get("/", [
    (0, express_validator_1.query)("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
    (0, express_validator_1.query)("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
    validation_middleware_1.validate,
], viewsController.getViews.bind(viewsController));
router.post("/", viewsController.createView.bind(viewsController));
router.patch("/:id", viewsController.updateView.bind(viewsController));
router.delete("/:id", viewsController.deleteView.bind(viewsController));
router.post("/:id/apply", viewsController.applyView.bind(viewsController));
exports.default = router;
