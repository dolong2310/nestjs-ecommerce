-- Create unique index for brandId and languageId with condition deletedAt = null
CREATE UNIQUE INDEX brand_translation_unique_brand_id_language_id_where_deleted_at_null
ON "BrandTranslation" ("brandId", "languageId")
WHERE "deletedAt" IS NULL;