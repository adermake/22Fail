// src/app/services/identity.ts
var STORAGE_KEY = "app:current-user";
function getStoredIdentity() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw)
      return null;
    const p = JSON.parse(raw);
    return p && p.userId && p.code ? { userId: p.userId, code: p.code } : null;
  } catch {
    return null;
  }
}
function setStoredIdentity(id) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(id));
  } catch {
  }
}
function clearStoredIdentity() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
  }
}
function identityHeaders() {
  const id = getStoredIdentity();
  return id ? { "x-user-id": id.userId, "x-user-code": id.code } : {};
}
function identityAuth() {
  const id = getStoredIdentity();
  return id ? { userId: id.userId, code: id.code } : void 0;
}

export {
  getStoredIdentity,
  setStoredIdentity,
  clearStoredIdentity,
  identityHeaders,
  identityAuth
};
//# sourceMappingURL=chunk-VMYLUGMS.js.map
