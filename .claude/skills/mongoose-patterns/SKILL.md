---
name: mongoose-patterns
description: Patterns for MongoDB and Mongoose in this project. Use when creating or modifying database models, writing queries, adding indexes, or working with src/server/models/ and src/server/services/.
---

# Mongoose Patterns

## Model Pattern

File: `src/server/models/entity.model.ts`

```ts
import mongoose, { Schema, type Document } from "mongoose";
import type { Entity } from "@shared/schemas/entity.schema.js";

export interface EntityDocument extends Omit<Entity, "_id">, Document {}

const entitySchemaDB = new Schema<EntityDocument>(
  {
    name: { type: String, required: true, trim: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

// Add indexes for common query patterns
entitySchemaDB.index({ status: 1 });
entitySchemaDB.index({ createdAt: -1 });

export const EntityModel = mongoose.model<EntityDocument>("Entity", entitySchemaDB);
```

Register in `src/server/models/index.ts`:
```ts
export { EntityModel } from "./entity.model.js";
export type { EntityDocument } from "./entity.model.js";
```

## Service Pattern

File: `src/server/services/entity.service.ts`

```ts
import { EntityModel } from "../models/entity.model.js";
import type { CreateEntity, UpdateEntity } from "@shared/schemas/entity.schema.js";
import type { Pagination } from "@shared/schemas/common.schema.js";

export const entityService = {
  async findAll(pagination: Pagination) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      EntityModel.find().skip(skip).limit(limit).lean(),
      EntityModel.countDocuments(),
    ]);
    return {
      items: items.map((item) => ({ ...item, _id: item._id.toString() })),
      total, page, limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findById(id: string) {
    const item = await EntityModel.findById(id).lean();
    if (!item) return null;
    return { ...item, _id: item._id.toString() };
  },

  async create(data: CreateEntity) {
    const item = await EntityModel.create(data);
    return { ...item.toObject(), _id: item._id.toString() };
  },

  async update(id: string, data: UpdateEntity) {
    const item = await EntityModel.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!item) return null;
    return { ...item, _id: item._id.toString() };
  },

  async delete(id: string) {
    const result = await EntityModel.findByIdAndDelete(id);
    return !!result;
  },
};
```

## Key Rules
- Always use `.lean()` when returning data to the client (skips Mongoose hydration)
- Always convert `_id` to string: `_id: item._id.toString()`
- Use `.select("-password")` to exclude sensitive fields
- Use `Promise.all()` for independent parallel queries
- Services return plain objects, never Mongoose documents
- Add indexes for fields used in filters and sorting
