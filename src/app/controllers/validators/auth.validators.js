import { ROLES, VALIDATION } from '../../../configs/constants.js';

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function ensureAllowedFields(payload, allowedFields) {
  const keys = Object.keys(payload || {});
  return keys.filter((key) => !allowedFields.includes(key));
}

export function validateRegisterPayload(payload) {
  const details = [];
  const unknownFields = ensureAllowedFields(payload, ['username', 'email', 'password', 'fullName', 'role', 'className']);

  if (unknownFields.length > 0) {
    unknownFields.forEach((field) => {
      details.push({ field, issue: 'not_allowed' });
    });
  }

  const username = normalizeText(payload.username);
  const email = normalizeText(payload.email);
  const password = normalizeText(payload.password);
  const fullName = normalizeText(payload.fullName);
  const role = normalizeText(payload.role) || ROLES.STUDENT;
  const className = normalizeText(payload.className) || null;

  if (!username) {
    details.push({ field: 'username', issue: 'required' });
  } else if (username.length < VALIDATION.USERNAME_MIN || username.length > VALIDATION.USERNAME_MAX) {
    details.push({ field: 'username', issue: 'length_4_50' });
  }

  if (!password) {
    details.push({ field: 'password', issue: 'required' });
  } else if (password.length < VALIDATION.PASSWORD_MIN || password.length > VALIDATION.PASSWORD_MAX) {
    details.push({ field: 'password', issue: 'length_8_128' });
  }

  if (!fullName) {
    details.push({ field: 'fullName', issue: 'required' });
  } else if (fullName.length > VALIDATION.FULLNAME_MAX) {
    details.push({ field: 'fullName', issue: 'max_150' });
  }

  if (email && (email.length > VALIDATION.EMAIL_MAX || !email.includes('@'))) {
    details.push({ field: 'email', issue: 'invalid_email' });
  }

  if (![ROLES.ADMIN, ROLES.STUDENT].includes(role)) {
    details.push({ field: 'role', issue: 'invalid_enum' });
  }

  if (className && className.length > VALIDATION.CLASS_MAX) {
    details.push({ field: 'className', issue: 'max_50' });
  }

  return {
    details,
    value: {
      username,
      email: email || null,
      password,
      fullName,
      role,
      className,
    },
  };
}

export function validateLoginPayload(payload) {
  const details = [];
  const unknownFields = ensureAllowedFields(payload, ['username', 'password']);

  if (unknownFields.length > 0) {
    unknownFields.forEach((field) => {
      details.push({ field, issue: 'not_allowed' });
    });
  }

  const username = normalizeText(payload.username);
  const password = normalizeText(payload.password);

  if (!username) {
    details.push({ field: 'username', issue: 'required' });
  }

  if (!password) {
    details.push({ field: 'password', issue: 'required' });
  }

  return {
    details,
    value: {
      username,
      password,
    },
  };
}

export function validateRefreshTokenPayload(payload) {
  const details = [];
  const unknownFields = ensureAllowedFields(payload, ['refreshToken']);

  if (unknownFields.length > 0) {
    unknownFields.forEach((field) => {
      details.push({ field, issue: 'not_allowed' });
    });
  }

  const refreshToken = normalizeText(payload.refreshToken);

  if (!refreshToken) {
    details.push({ field: 'refreshToken', issue: 'required' });
  }

  return {
    details,
    value: { refreshToken },
  };
}
