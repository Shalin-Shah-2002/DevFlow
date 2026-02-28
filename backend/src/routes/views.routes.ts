import { Router } from "express";
import { ViewsController } from "../controllers/views.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const viewsController = new ViewsController();

// All routes require authentication
router.use(authMiddleware);

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

export default router;