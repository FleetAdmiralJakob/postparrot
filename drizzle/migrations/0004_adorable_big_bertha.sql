ALTER TABLE "new-twitter-clone_post"
    ALTER COLUMN "id"
        TYPE uuid
        USING (gen_random_uuid());