"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const views_controller_1 = require("../controllers/views.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const viewsController = new views_controller_1.ViewsController();
// All routes require authentication
router.use(auth_middleware_1.authMiddleware);
// 6.1 GET    /api/views          - Get all saved views
// 6.2 POST   /api/views          - Create a saved view
// 6.3 PATCH  /api/views/:id      - Update a saved view
// 6.4 DELETE /api/views/:id      - Delete a saved view
// 6.5 POST   /api/views/:id/apply - Apply view (get filtered issues)
router.get("/", viewsController.getViews.bind(viewsController));
router.post("/", viewsController.createView.bind(viewsController));
router.patch("/:id", viewsController.updateView.bind(viewsController));
router.delete("/:id", viewsController.deleteView.bind(viewsController));
router.post("/:id/apply", viewsController.applyView.bind(viewsController));
exports.default = router;
