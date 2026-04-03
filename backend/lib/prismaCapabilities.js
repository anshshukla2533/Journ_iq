import { prisma } from './prisma.js';

function getModelFields(modelName) {
  const fields = prisma?._runtimeDataModel?.models?.[modelName]?.fields;
  return Array.isArray(fields) ? fields : [];
}

export function hasUserUsernameField() {
  return getModelFields('User').some((field) => field.name === 'username');
}

export function hasAuthAccountModel() {
  return typeof prisma.authAccount?.findUnique === 'function';
}

export function userSelectWithCompatibility() {
  const base = {
    id: true,
    name: true,
    email: true,
    createdAt: true,
    lastLogin: true,
  };

  if (hasUserUsernameField()) {
    base.username = true;
  }

  return base;
}
