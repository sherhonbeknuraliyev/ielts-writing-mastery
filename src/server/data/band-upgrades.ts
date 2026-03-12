import type { BandUpgrade } from "../../shared/schemas/collocation.schema.js";
import { upgradesPart1 } from "./band-upgrades-1.js";
import { upgradesPart2 } from "./band-upgrades-2.js";

export const bandUpgrades: BandUpgrade[] = [...upgradesPart1, ...upgradesPart2];
