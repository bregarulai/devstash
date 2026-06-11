import { describe, it, expect } from 'vitest'
import {
  registerSchema,
  signInSchema,
  changePasswordSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
  deleteAccountSchema,
  verifyTokenSchema,
  itemInsertSchema,
  passwordRequirements,
} from './db'

describe('registerSchema', () => {
  it('passes with valid data', () => {
    const result = registerSchema.safeParse({
      name: 'John',
      email: 'john@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
    })
    expect(result.success).toBe(true)
  })

  it('fails with invalid email', () => {
    const result = registerSchema.safeParse({
      name: 'John',
      email: 'not-an-email',
      password: 'Password123',
      confirmPassword: 'Password123',
    })
    expect(result.success).toBe(false)
  })

  it('fails with short password', () => {
    const result = registerSchema.safeParse({
      name: 'John',
      email: 'john@example.com',
      password: 'short',
      confirmPassword: 'short',
    })
    expect(result.success).toBe(false)
  })

  it('fails when passwords do not match', () => {
    const result = registerSchema.safeParse({
      name: 'John',
      email: 'john@example.com',
      password: 'Password123',
      confirmPassword: 'Password456',
    })
    expect(result.success).toBe(false)
  })

  it('fails with empty name', () => {
    const result = registerSchema.safeParse({
      name: '',
      email: 'john@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
    })
    expect(result.success).toBe(false)
  })
})

describe('signInSchema', () => {
  it('passes with valid data', () => {
    const result = signInSchema.safeParse({
      email: 'john@example.com',
      password: 'password',
    })
    expect(result.success).toBe(true)
  })

  it('fails with invalid email', () => {
    const result = signInSchema.safeParse({
      email: 'not-an-email',
      password: 'password',
    })
    expect(result.success).toBe(false)
  })

  it('fails with empty password', () => {
    const result = signInSchema.safeParse({
      email: 'john@example.com',
      password: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('changePasswordSchema', () => {
  it('passes with valid data', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'oldPassword',
      newPassword: 'NewPassword123',
      confirmPassword: 'NewPassword123',
    })
    expect(result.success).toBe(true)
  })

  it('fails when passwords do not match', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'oldPassword',
      newPassword: 'NewPassword123',
      confirmPassword: 'DifferentPassword',
    })
    expect(result.success).toBe(false)
  })

  it('fails with short new password', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'oldPassword',
      newPassword: 'short',
      confirmPassword: 'short',
    })
    expect(result.success).toBe(false)
  })

  it('fails with empty current password', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: '',
      newPassword: 'NewPassword123',
      confirmPassword: 'NewPassword123',
    })
    expect(result.success).toBe(false)
  })
})

describe('resetPasswordSchema', () => {
  it('passes with valid data', () => {
    const result = resetPasswordSchema.safeParse({
      token: 'valid-token',
      email: 'john@example.com',
      password: 'NewPassword123',
      confirmPassword: 'NewPassword123',
    })
    expect(result.success).toBe(true)
  })

  it('fails when passwords do not match', () => {
    const result = resetPasswordSchema.safeParse({
      token: 'valid-token',
      email: 'john@example.com',
      password: 'NewPassword123',
      confirmPassword: 'DifferentPassword',
    })
    expect(result.success).toBe(false)
  })

  it('fails with empty token', () => {
    const result = resetPasswordSchema.safeParse({
      token: '',
      email: 'john@example.com',
      password: 'NewPassword123',
      confirmPassword: 'NewPassword123',
    })
    expect(result.success).toBe(false)
  })

  it('fails with short password', () => {
    const result = resetPasswordSchema.safeParse({
      token: 'valid-token',
      email: 'john@example.com',
      password: 'short',
      confirmPassword: 'short',
    })
    expect(result.success).toBe(false)
  })
})

describe('forgotPasswordSchema', () => {
  it('passes with valid email', () => {
    const result = forgotPasswordSchema.safeParse({
      email: 'john@example.com',
    })
    expect(result.success).toBe(true)
  })

  it('fails with invalid email', () => {
    const result = forgotPasswordSchema.safeParse({
      email: 'not-an-email',
    })
    expect(result.success).toBe(false)
  })
})

describe('deleteAccountSchema', () => {
  it('passes with valid password', () => {
    const result = deleteAccountSchema.safeParse({
      password: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('fails with empty password', () => {
    const result = deleteAccountSchema.safeParse({
      password: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('verifyTokenSchema', () => {
  it('passes with valid token', () => {
    const result = verifyTokenSchema.safeParse({
      token: 'valid-token',
    })
    expect(result.success).toBe(true)
  })

  it('fails with empty token', () => {
    const result = verifyTokenSchema.safeParse({
      token: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('itemInsertSchema', () => {
  it('passes with valid item data', () => {
    const result = itemInsertSchema.safeParse({
      title: 'My Item',
      contentType: 'TEXT',
      userId: 'user-123',
      itemTypeId: 'type-123',
    })
    expect(result.success).toBe(true)
  })

  it('fails with empty title', () => {
    const result = itemInsertSchema.safeParse({
      title: '',
      contentType: 'TEXT',
      userId: 'user-123',
      itemTypeId: 'type-123',
    })
    expect(result.success).toBe(false)
  })

  it('fails with invalid contentType', () => {
    const result = itemInsertSchema.safeParse({
      title: 'My Item',
      contentType: 'INVALID_TYPE',
      userId: 'user-123',
      itemTypeId: 'type-123',
    })
    expect(result.success).toBe(false)
  })

  it('fails without required fields', () => {
    const result = itemInsertSchema.safeParse({
      title: 'My Item',
    })
    expect(result.success).toBe(false)
  })
})

describe('passwordRequirements', () => {
  it('validates length requirement', () => {
    const req = passwordRequirements[0]
    expect(req.test('short')).toBe(false)
    expect(req.test('longenough')).toBe(true)
  })

  it('validates uppercase requirement', () => {
    const req = passwordRequirements[1]
    expect(req.test('nouppercase')).toBe(false)
    expect(req.test('WithUppercase')).toBe(true)
  })

  it('validates lowercase requirement', () => {
    const req = passwordRequirements[2]
    expect(req.test('NOLOWERCASE')).toBe(false)
    expect(req.test('withLowercase')).toBe(true)
  })

  it('validates number requirement', () => {
    const req = passwordRequirements[3]
    expect(req.test('NoNumber')).toBe(false)
    expect(req.test('With1Number')).toBe(true)
  })

  it('all requirements pass for strong password', () => {
    const password = 'StrongPass1'
    for (const req of passwordRequirements) {
      expect(req.test(password)).toBe(true)
    }
  })

  it('all requirements fail for weak password', () => {
    const password = 'weak'
    const results = passwordRequirements.map((req) => req.test(password))
    expect(results.some((r) => r === false)).toBe(true)
  })
})
