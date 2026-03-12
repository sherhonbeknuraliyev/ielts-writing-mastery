import type { CollocationSet } from "../../shared/schemas/collocation.schema.js";
import { collocationsPart1 } from "./collocations-1.js";
import { collocationsPart2 } from "./collocations-2.js";
import { collocationsPart3 } from "./collocations-3.js";

export const collocationSets: CollocationSet[] = [
  ...collocationsPart1,
  ...collocationsPart2,
  ...collocationsPart3,
];
