import { z } from "zod";
import { DISCUSSION_MINUTES_OPTIONS } from "../app/constants";

export type DiscussionMinutes = (typeof DISCUSSION_MINUTES_OPTIONS)[number];

export const DISCUSSION_MINUTES_SCHEMA = z.literal([...DISCUSSION_MINUTES_OPTIONS]);
