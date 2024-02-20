
import { Router } from 'express';
import { create, find, update, destroy, findOne } from '../controllers/user.js';
const router = Router();

// Create user
router.post("/api/users", [], create);

// List users
router.get("/api/users", [], find);

// List Single user
router.get("/api/users/:id", [], findOne);

// Update users
router.put("/api/users/:id", [], update);

// Delete user
router.delete("/api/users/:id", [], destroy);

export default router;
