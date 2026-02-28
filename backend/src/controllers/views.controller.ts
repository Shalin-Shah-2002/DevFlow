import { Request, Response } from "express";
import { ViewsService } from "../services/views.service";
import {
  createViewSchema,
  updateViewSchema,
} from "../validators/views.validator";

const viewsService = new ViewsService();

export class ViewsController {
  // GET /api/views
  async getViews(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const views = await viewsService.getViews(userId);

      res.status(200).json({
        success: true,
        data: views,
      });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch views" });
    }
  }

  // POST /api/views
  async createView(req: Request, res: Response) {
    try {
      const parsed = createViewSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: parsed.error.flatten(),
        });
      }

      const view = await viewsService.createView(req.user!.id, parsed.data);

      res.status(201).json({
        success: true,
        message: "View created successfully",
        data: view,
      });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to create view" });
    }
  }

  // PATCH /api/views/:id
  async updateView(req: Request, res: Response) {
    try {
      const parsed = updateViewSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: parsed.error.flatten(),
        });
      }

      const updated = await viewsService.updateView(
        req.user!.id,
        req.params.id as string,
        parsed.data
      );

      if (!updated) {
        return res
          .status(404)
          .json({ success: false, error: "View not found" });
      }

      res.status(200).json({
        success: true,
        message: "View updated successfully",
        data: updated,
      });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to update view" });
    }
  }

  // DELETE /api/views/:id
  async deleteView(req: Request, res: Response) {
    try {
      const deleted = await viewsService.deleteView(
        req.user!.id,
        req.params.id as string
      );

      if (!deleted) {
        return res
          .status(404)
          .json({ success: false, error: "View not found" });
      }

      res.status(200).json({
        success: true,
        message: "View deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to delete view" });
    }
  }

  // POST /api/views/:id/apply
  async applyView(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await viewsService.applyView(
        req.user!.id,
        req.params.id as string,
        page,
        limit
      );

      if (!result) {
        return res
          .status(404)
          .json({ success: false, error: "View not found" });
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to apply view" });
    }
  }
}