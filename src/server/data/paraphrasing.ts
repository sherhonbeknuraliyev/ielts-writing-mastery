import type { ParaphraseDrill } from "../../shared/schemas/collocation.schema.js";
import { paraphrasePart1 } from "./paraphrasing-1.js";
import { paraphrasePart2 } from "./paraphrasing-2.js";
import { paraphrasePart3 } from "./paraphrasing-3.js";

export const paraphraseDrills: ParaphraseDrill[] = [...paraphrasePart1, ...paraphrasePart2, ...paraphrasePart3];
