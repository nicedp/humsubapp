// Helper transformer — shapes Helper Prisma model into API response.
// Uses `any` for the input type because the Prisma client may not yet have
// the Helper model in its generated types (requires `prisma generate` after migration).

export interface HelperResponse {
  id:             string;
  societyId:      number;
  name:           string;
  phone:          string;
  alternatePhone: string | null;
  email:          string | null;
  category:       string;
  description:    string | null;
  photoUrl:       string | null;
  isActive:       boolean;
  addedBy:        string | null;
  createdAt:      Date;
  updatedAt:      Date;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformHelper(helper: any): HelperResponse {
  return {
    id:             helper.id,
    societyId:      helper.societyId,
    name:           helper.name,
    phone:          helper.phone,
    alternatePhone: helper.alternatePhone ?? null,
    email:          helper.email ?? null,
    category:       helper.category,
    description:    helper.description ?? null,
    photoUrl:       helper.photoUrl ?? null,
    isActive:       helper.isActive,
    addedBy:        helper.addedBy ?? null,
    createdAt:      helper.createdAt,
    updatedAt:      helper.updatedAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformHelpers(helpers: any[]): HelperResponse[] {
  return helpers.map(transformHelper);
}