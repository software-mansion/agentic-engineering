import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";

const jsonLdNodeSchema = z
  .object({
    "@type": z.string().min(1),
  })
  .passthrough();

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        /** All pages all require to have a meaningful description. */
        description: z.string().min(1),
        jsonLd: z.array(jsonLdNodeSchema).optional(),
      }),
    }),
  }),
};
