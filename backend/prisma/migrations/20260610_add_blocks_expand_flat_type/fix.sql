ALTER TABLE flats ALTER COLUMN type DROP DEFAULT;
ALTER TABLE flats ALTER COLUMN type TYPE "FlatType" USING type::text::"FlatType";
ALTER TABLE flats ALTER COLUMN type SET DEFAULT 'flat'::"FlatType";
DROP TYPE "FlatType_old";